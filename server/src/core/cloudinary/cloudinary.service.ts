import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import * as fs from 'fs';
import * as path from 'path';

export interface CloudinaryUploadResult {
  url: string;
  secureUrl: string;
  publicId: string;
  resourceType: 'image' | 'video' | 'raw';
  format?: string;
  bytes?: number;
  width?: number;
  height?: number;
  duration?: number;
}

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);
  private isConfigured = false;

  constructor(private readonly configService: ConfigService) {
    const cloudName =
      this.configService.get<string>('CLOUDINARY_CLOUD_NAME') ||
      this.configService.get<string>('CLOUDINARY_NAME') ||
      process.env.CLOUDINARY_CLOUD_NAME ||
      process.env.CLOUDINARY_NAME;
    const apiKey =
      this.configService.get<string>('CLOUDINARY_API_KEY') ||
      process.env.CLOUDINARY_API_KEY;
    const apiSecret =
      this.configService.get<string>('CLOUDINARY_API_SECRET') ||
      this.configService.get<string>('CLOUDINARY_SECERT_KEY') ||
      process.env.CLOUDINARY_API_SECRET ||
      process.env.CLOUDINARY_SECERT_KEY;

    const isTest = process.env.NODE_ENV === 'test';
    if (!isTest && cloudName && apiKey && apiSecret && !cloudName.includes('YOUR_CLOUDINARY')) {
      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
        secure: true,
      });
      this.isConfigured = true;
      this.logger.log(`Cloudinary configured successfully for cloud: ${cloudName}`);
    } else {
      this.logger.warn('Cloudinary credentials not provided or using placeholder. Running in Local Disk Storage driver.');
    }
  }

  /**
   * Upload hình ảnh lên Cloudinary
   */
  async uploadImage(
    file: Express.Multer.File,
    folder = 'teacher_dong_academy/images',
  ): Promise<CloudinaryUploadResult> {
    if (!file) {
      throw new BadRequestException('Vui lòng chọn file hình ảnh hợp lệ để upload');
    }

    const mime = file.mimetype || '';
    if (!mime.startsWith('image/')) {
      throw new BadRequestException('Định dạng file không phải là hình ảnh (jpg, png, webp, gif...)');
    }

    return this.uploadToCloudinary(file.buffer, {
      folder,
      resource_type: 'image',
    });
  }

  /**
   * Upload video lên Cloudinary
   */
  async uploadVideo(
    file: Express.Multer.File,
    folder = 'teacher_dong_academy/videos',
  ): Promise<CloudinaryUploadResult> {
    if (!file) {
      throw new BadRequestException('Vui lòng chọn file video hợp lệ để upload');
    }

    const mime = file.mimetype || '';
    if (!mime.startsWith('video/')) {
      throw new BadRequestException('Định dạng file không phải là video (mp4, webm, mov, mkv...)');
    }

    return this.uploadToCloudinary(file.buffer, {
      folder,
      resource_type: 'video',
    });
  }

  /**
   * Upload buffer lên Cloudinary hoặc dùng fallback mock khi chạy test/offline
   */
  async uploadToCloudinary(
    buffer: Buffer,
    options: {
      folder: string;
      resource_type: 'image' | 'video' | 'raw';
    },
  ): Promise<CloudinaryUploadResult> {
    const resourceType = options.resource_type || 'image';

    // STO-01: Local Disk Storage driver & Cloudinary mock fallback
    if (!this.isConfigured || !buffer) {
      const mockId = `mock_${resourceType}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const ext = resourceType === 'video' ? 'mp4' : resourceType === 'raw' ? 'bin' : 'jpg';

      // SEC-003: Sanitize folder path against Path Traversal attacks
      const safeFolder = (options.folder || 'general')
        .replace(/\\/g, '/')
        .split('/')
        .filter(part => part && part !== '..' && part !== '.')
        .join('/') || 'general';

      // Save file to public/uploads directory for local serving
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads', safeFolder);
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      const localFilePath = path.join(uploadsDir, `${mockId}.${ext}`);
      if (buffer) {
        try {
          fs.writeFileSync(localFilePath, buffer);
        } catch (e) {
          this.logger.warn(`Failed to write local file: ${e}`);
        }
      }

      const mockUrl = `https://res.cloudinary.com/englishweb/${resourceType}/upload/v1700000000/${safeFolder}/${mockId}.${ext}`;

      return {
        url: mockUrl,
        secureUrl: mockUrl,
        publicId: `${safeFolder}/${mockId}`,
        resourceType,
        format: ext,
        bytes: buffer ? buffer.length : 1024,
        width: resourceType === 'image' ? 1280 : 1920,
        height: resourceType === 'image' ? 720 : 1080,
        duration: resourceType === 'video' ? 120 : undefined,
      };
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        options,
        (error: UploadApiErrorResponse, result: UploadApiResponse) => {
          if (error) {
            this.logger.error('Cloudinary upload error:', error);
            return reject(new BadRequestException(`Lỗi khi upload lên Cloudinary: ${error.message}`));
          }
          resolve({
            url: result.url,
            secureUrl: result.secure_url,
            publicId: result.public_id,
            resourceType: result.resource_type as any,
            format: result.format,
            bytes: result.bytes,
            width: result.width,
            height: result.height,
            duration: result.duration,
          });
        },
      );

      uploadStream.end(buffer);
    });
  }

  /**
   * Xóa file khỏi Cloudinary
   */
  async deleteAsset(
    publicId: string,
    resourceType: 'image' | 'video' = 'image',
  ): Promise<{ result: string }> {
    if (!this.isConfigured) {
      return { result: 'ok (mock)' };
    }

    try {
      const res = await cloudinary.uploader.destroy(publicId, {
        resource_type: resourceType,
      });
      return res;
    } catch (err) {
      this.logger.error(`Error deleting asset ${publicId}:`, err);
      return { result: 'error' };
    }
  }
}
