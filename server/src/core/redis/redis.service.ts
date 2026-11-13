import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

interface CacheEntry {
  value: string;
  expireAt: number | null;
}

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis | null = null;
  private isRedisReady = false;
  private readonly memoryStore = new Map<string, CacheEntry>();

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    await this.initRedisClient();
  }

  async onModuleDestroy() {
    if (this.client) {
      try {
        await this.client.quit();
      } catch {
        this.client.disconnect();
      }
      this.client = null;
      this.isRedisReady = false;
    }
  }

  private async initRedisClient() {
    const isTest = process.env.NODE_ENV === 'test';
    let rawUrl =
      this.configService.get<string>('UPSTASH_REDIS_URL') ||
      this.configService.get<string>('REDIS_URL') ||
      process.env.UPSTASH_REDIS_URL ||
      process.env.REDIS_URL ||
      '';

    // Strip wrapping quotes and whitespace if present
    rawUrl = rawUrl.trim().replace(/^["']|["']$/g, '');

    if (isTest || !rawUrl) {
      this.logger.log(
        'Running with high-performance in-memory cache store (test/dev mode).',
      );
      this.isRedisReady = false;
      return;
    }

    try {
      this.client = new Redis(rawUrl, {
        lazyConnect: true,
        connectTimeout: 3000,
        maxRetriesPerRequest: 1,
        enableOfflineQueue: false,
        retryStrategy: (times) => {
          if (times > 3) return null; // stop retrying after 3 attempts
          return Math.min(times * 1000, 3000);
        },
      });

      // Prevent uncaught error crashes
      this.client.on('error', (err) => {
        this.logger.debug(
          `Redis client event error: ${err.message}. Relying on resilient fallback.`,
        );
        this.isRedisReady = false;
      });

      this.client.on('connect', () => {
        this.logger.log('Successfully connected to Redis instance.');
        this.isRedisReady = true;
      });

      // Attempt initial handshake with timeout
      await Promise.race([
        this.client.connect(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Connection timed out')), 3000),
        ),
      ]);
      this.isRedisReady = true;
      this.logger.log('Redis client initialized and ready.');
    } catch (err: any) {
      this.logger.warn(
        `Unable to establish live connection to Redis (${err.message}). System seamlessly running on high-performance in-memory cache.`,
      );
      this.isRedisReady = false;
      if (this.client) {
        try {
          this.client.disconnect();
        } catch {
          // ignore
        }
      }
    }
  }

  public isConnected(): boolean {
    return this.isRedisReady;
  }

  /**
   * Get string value by key
   */
  async get(key: string): Promise<string | null> {
    if (this.isRedisReady && this.client) {
      try {
        return await this.client.get(key);
      } catch (err: any) {
        this.logger.debug(`Redis GET error for key ${key}: ${err.message}`);
      }
    }

    // Memory fallback
    const entry = this.memoryStore.get(key);
    if (!entry) return null;
    if (entry.expireAt && entry.expireAt < Date.now()) {
      this.memoryStore.delete(key);
      return null;
    }
    return entry.value;
  }

  /**
   * Set string value with optional TTL (in seconds)
   */
  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (this.isRedisReady && this.client) {
      try {
        if (ttlSeconds && ttlSeconds > 0) {
          await this.client.set(key, value, 'EX', ttlSeconds);
        } else {
          await this.client.set(key, value);
        }
        return;
      } catch (err: any) {
        this.logger.debug(`Redis SET error for key ${key}: ${err.message}`);
      }
    }

    // Memory fallback
    this.memoryStore.set(key, {
      value,
      expireAt: ttlSeconds && ttlSeconds > 0 ? Date.now() + ttlSeconds * 1000 : null,
    });
  }

  /**
   * Delete one or multiple keys
   */
  async del(keyOrKeys: string | string[]): Promise<void> {
    const keys = Array.isArray(keyOrKeys) ? keyOrKeys : [keyOrKeys];
    if (keys.length === 0) return;

    if (this.isRedisReady && this.client) {
      try {
        await this.client.del(...keys);
        return;
      } catch (err: any) {
        this.logger.debug(`Redis DEL error: ${err.message}`);
      }
    }

    // Memory fallback
    for (const k of keys) {
      this.memoryStore.delete(k);
    }
  }

  /**
   * Delete keys matching a wildcard pattern (e.g. 'cache:courses:*')
   */
  async delPattern(pattern: string): Promise<void> {
    if (this.isRedisReady && this.client) {
      try {
        const stream = this.client.scanStream({
          match: pattern,
          count: 100,
        });

        const keysToDelete: string[] = [];
        for await (const resultKeys of stream) {
          if (resultKeys.length) {
            keysToDelete.push(...resultKeys);
          }
        }

        if (keysToDelete.length > 0) {
          await this.client.del(...keysToDelete);
        }
        return;
      } catch (err: any) {
        this.logger.debug(`Redis delPattern error for ${pattern}: ${err.message}`);
      }
    }

    // Memory fallback: convert wildcard pattern to regex
    const regexPattern = new RegExp(
      '^' + pattern.replace(/[-/\\^$+?.()|[\]{}]/g, '\\$&').replace(/\*/g, '.*') + '$',
    );
    for (const key of this.memoryStore.keys()) {
      if (regexPattern.test(key)) {
        this.memoryStore.delete(key);
      }
    }
  }

  /**
   * Check if key exists
   */
  async exists(key: string): Promise<boolean> {
    if (this.isRedisReady && this.client) {
      try {
        const count = await this.client.exists(key);
        return count > 0;
      } catch (err: any) {
        this.logger.debug(`Redis EXISTS error: ${err.message}`);
      }
    }

    const entry = this.memoryStore.get(key);
    if (!entry) return false;
    if (entry.expireAt && entry.expireAt < Date.now()) {
      this.memoryStore.delete(key);
      return false;
    }
    return true;
  }

  /**
   * Store parsed JSON object
   */
  async setJson<T>(key: string, data: T, ttlSeconds?: number): Promise<void> {
    const serialized = JSON.stringify(data);
    await this.set(key, serialized, ttlSeconds);
  }

  /**
   * Retrieve and deserialize JSON object
   */
  async getJson<T>(key: string): Promise<T | null> {
    const raw = await this.get(key);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  /**
   * Rate limiting helper: increments a counter and sets TTL on first hit
   * Returns current count
   */
  async incrementRateLimit(key: string, windowSeconds: number): Promise<number> {
    if (this.isRedisReady && this.client) {
      try {
        const count = await this.client.incr(key);
        if (count === 1) {
          await this.client.expire(key, windowSeconds);
        }
        return count;
      } catch (err: any) {
        this.logger.debug(`Redis rateLimit error: ${err.message}`);
      }
    }

    // Memory fallback
    const now = Date.now();
    const entry = this.memoryStore.get(key);
    let count = 1;
    if (entry && (!entry.expireAt || entry.expireAt > now)) {
      count = parseInt(entry.value, 10) + 1;
      this.memoryStore.set(key, {
        value: count.toString(),
        expireAt: entry.expireAt,
      });
    } else {
      this.memoryStore.set(key, {
        value: '1',
        expireAt: now + windowSeconds * 1000,
      });
    }
    return count;
  }
}
