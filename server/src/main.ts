import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, BadRequestException } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import { ResponseInterceptor } from './core/common/interceptors/response.interceptor';
import { AllExceptionsFilter } from './core/common/filters/http-exception.filter';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as fs from 'fs';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    rawBody: true,
  });

  // Ensure public uploads directory exists for local disk storage driver
  const uploadsDir = join(process.cwd(), 'public', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  app.useStaticAssets(join(process.cwd(), 'public'));

  app.setGlobalPrefix('api');

  app.use(cookieParser());

  const reflector = app.get(Reflector);
  app.useGlobalInterceptors(new ResponseInterceptor(reflector));
  app.useGlobalFilters(new AllExceptionsFilter());

  const allowedOrigins = [
    process.env.FRONTEND_URL,
    'http://localhost:3000',
    'http://127.0.0.1:3000',
  ].filter(Boolean) as string[];

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, server-to-server)
      if (!origin) {
        return callback(null, true);
      }

      const isAllowedLocal = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
      const isAllowedOrigin = allowedOrigins.includes(origin);
      const isNgrokInDev =
        process.env.NODE_ENV !== 'production' && origin.endsWith('.ngrok-free.app');

      if (isAllowedLocal || isAllowedOrigin || isNgrokInDev) {
        callback(null, true);
      } else {
        callback(new BadRequestException(`Origin ${origin} not allowed by CORS`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('English Learning LMS & LiveKit API')
      .setDescription('Full RESTful API for Website Dạy Tiếng Anh Trực Tuyến (2 Roles: STUDENT & ADMIN)')
      .setVersion('1.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
    console.log(`📚 Swagger Docs: http://localhost:${process.env.PORT || 3001}/api/docs`);
  }

  if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
    throw new Error('CRITICAL SECURITY ERROR: JWT_SECRET environment variable is missing in production!');
  }

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`🚀 Backend running on: http://localhost:${port}/api`);
}
bootstrap();
