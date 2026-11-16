import { HttpException, HttpStatus } from '@nestjs/common';
import { AppErrorCode } from './error-codes.enum';

export class AppException extends HttpException {
  public readonly errorCode: AppErrorCode;

  constructor(errorCode: AppErrorCode, message: string, status: HttpStatus = HttpStatus.BAD_REQUEST) {
    super(
      {
        errorCode,
        message,
        statusCode: status,
      },
      status,
    );
    this.errorCode = errorCode;
  }

  static badRequest(errorCode: AppErrorCode, message: string): AppException {
    return new AppException(errorCode, message, HttpStatus.BAD_REQUEST);
  }

  static unauthorized(errorCode: AppErrorCode, message: string): AppException {
    return new AppException(errorCode, message, HttpStatus.UNAUTHORIZED);
  }

  static forbidden(errorCode: AppErrorCode, message: string): AppException {
    return new AppException(errorCode, message, HttpStatus.FORBIDDEN);
  }

  static notFound(errorCode: AppErrorCode, message: string): AppException {
    return new AppException(errorCode, message, HttpStatus.NOT_FOUND);
  }

  static conflict(errorCode: AppErrorCode, message: string): AppException {
    return new AppException(errorCode, message, HttpStatus.CONFLICT);
  }

  static payloadTooLarge(errorCode: AppErrorCode, message: string): AppException {
    return new AppException(errorCode, message, HttpStatus.PAYLOAD_TOO_LARGE);
  }

  static unsupportedMediaType(errorCode: AppErrorCode, message: string): AppException {
    return new AppException(errorCode, message, HttpStatus.UNSUPPORTED_MEDIA_TYPE);
  }
}

