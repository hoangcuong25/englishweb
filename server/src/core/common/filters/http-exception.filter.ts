import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { StandardErrorResponse } from '../interceptors/response.interceptor';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let statusCode =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let errorCode = 'INTERNAL_SERVER_ERROR';
    let errorMessage: string | string[] = 'Đã có lỗi hệ thống xảy ra. Vui lòng thử lại sau.';
    let errorType = 'InternalServerError';

    if (exception instanceof HttpException) {
      const res = exception.getResponse();
      errorType = exception.name;

      if (typeof res === 'string') {
        errorMessage = res;
      } else if (typeof res === 'object' && res !== null) {
        const resObj = res as Record<string, any>;
        errorMessage = resObj.message || exception.message;
        errorCode = resObj.errorCode || this.mapStatusToErrorCode(statusCode);
        errorType = resObj.error || exception.name;
      }
    } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      errorType = 'DatabaseError';
      switch (exception.code) {
        case 'P2002': {
          statusCode = HttpStatus.CONFLICT;
          errorCode = 'DATABASE_UNIQUE_CONFLICT';
          const target = (exception.meta?.target as string[]) || [];
          const fieldName = target.join(', ');
          errorMessage = fieldName
            ? `Dữ liệu (${fieldName}) đã tồn tại trong hệ thống. Vui lòng kiểm tra lại.`
            : 'Thông tin này đã tồn tại trong hệ thống (email, số điện thoại hoặc mã định danh đã được đăng ký).';
          break;
        }
        case 'P2025': {
          statusCode = HttpStatus.NOT_FOUND;
          errorCode = 'DATABASE_RECORD_NOT_FOUND';
          errorMessage = 'Không tìm thấy dữ liệu yêu cầu hoặc bản ghi đã bị xóa.';
          break;
        }
        case 'P2003': {
          statusCode = HttpStatus.BAD_REQUEST;
          errorCode = 'DATABASE_FOREIGN_KEY_VIOLATION';
          errorMessage = 'Thao tác không hợp lệ do vi phạm ràng buộc dữ liệu liên kết.';
          break;
        }
        default: {
          statusCode = HttpStatus.BAD_REQUEST;
          errorCode = 'DATABASE_REQUEST_ERROR';
          errorMessage = 'Yêu cầu cơ sở dữ liệu không hợp lệ. Vui lòng thử lại.';
          break;
        }
      }
      this.logger.error(`Prisma Client Known Request Error [${exception.code}]: ${exception.message}`);
    } else if (exception instanceof Error) {
      if (process.env.NODE_ENV === 'production') {
        errorMessage = 'Đã có lỗi hệ thống xảy ra. Vui lòng liên hệ quản trị viên.';
      } else {
        const sanitized = exception.message.replace(/(\b(SELECT|INSERT|UPDATE|DELETE|FROM|WHERE)\b.+)/gi, '[SQL Query Sanitized]');
        errorMessage = sanitized || 'Đã có lỗi xảy ra. Vui lòng thử lại sau.';
      }
      this.logger.error(`Unhandled Exception: ${exception.message}`, exception.stack);
    }

    const translateText = (text: string): string => {
      if (!text || typeof text !== 'string') return text;

      let translated = text;
      translated = translated.replace(/([a-zA-Z0-9_]+) must be an email/g, '$1 phải là địa chỉ email hợp lệ');
      translated = translated.replace(/([a-zA-Z0-9_]+) should not be empty/g, '$1 không được để trống');
      translated = translated.replace(/([a-zA-Z0-9_]+) must not be empty/g, '$1 không được để trống');
      translated = translated.replace(/([a-zA-Z0-9_]+) must be longer than or equal to ([0-9]+) characters/g, '$1 phải có tối thiểu $2 ký tự');
      translated = translated.replace(/([a-zA-Z0-9_]+) must be shorter than or equal to ([0-9]+) characters/g, '$1 không được vượt quá $2 ký tự');
      translated = translated.replace(/([a-zA-Z0-9_]+) must be a string/g, '$1 phải là chuỗi văn bản');
      translated = translated.replace(/([a-zA-Z0-9_]+) must be a number/g, '$1 phải là số hợp lệ');
      translated = translated.replace(/([a-zA-Z0-9_]+) must be a valid enum value/g, '$1 không nằm trong danh mục hợp lệ');
      translated = translated.replace(/([a-zA-Z0-9_]+) must be a boolean/g, '$1 phải là giá trị đúng/sai');

      const dict: Record<string, string> = {
        'Invalid email or password': 'Email hoặc mật khẩu không chính xác',
        'Your account has been deactivated': 'Tài khoản của bạn đã bị vô hiệu hóa',
        'No Google account is currently linked': 'Hiện tại chưa có tài khoản Google nào được liên kết',
        'Cannot unlink Google account without setting a local password first': 'Không thể hủy liên kết Google khi chưa thiết lập mật khẩu',
        'User not found': 'Không tìm thấy thông tin người dùng',
        'Current password does not match': 'Mật khẩu hiện tại không chính xác',
        'Refresh token is required': 'Yêu cầu mã refresh token hợp lệ',
        'Invalid, revoked or expired refresh token': 'Phiên làm việc đã hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại.',
        'User sessions have been invalidated': 'Phiên làm việc đã bị thu hồi. Vui lòng đăng nhập lại.',
        'Session not found': 'Không tìm thấy phiên đăng nhập',
        'Unauthorized': 'Bạn chưa đăng nhập hoặc phiên làm việc đã hết hạn',
        'Forbidden resource': 'Bạn không có quyền truy cập tài nguyên này',
        'Bad Request': 'Yêu cầu không hợp lệ',
        'Not Found': 'Không tìm thấy tài nguyên yêu cầu',
        'Internal server error': 'Đã có lỗi hệ thống xảy ra. Vui lòng thử lại sau.',
      };

      if (dict[translated]) {
        return dict[translated];
      }

      return translated
        .replace(/\bemail\b/gi, 'Email')
        .replace(/\bpassword\b/gi, 'Mật khẩu')
        .replace(/\boldPassword\b/gi, 'Mật khẩu cũ')
        .replace(/\bnewPassword\b/gi, 'Mật khẩu mới')
        .replace(/\bfullName\b/gi, 'Họ và tên')
        .replace(/\bphone\b/gi, 'Số điện thoại')
        .replace(/\btitle\b/gi, 'Tiêu đề')
        .replace(/\bdescription\b/gi, 'Mô tả')
        .replace(/\bprice\b/gi, 'Học phí');
    };

    if (Array.isArray(errorMessage)) {
      errorMessage = errorMessage.map(translateText);
    } else if (typeof errorMessage === 'string') {
      errorMessage = translateText(errorMessage);
    }

    const errorResponse: StandardErrorResponse = {
      success: false,
      statusCode,
      errorCode,
      message: errorMessage,
      error: errorType,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    response.status(statusCode).json(errorResponse);
  }

  private mapStatusToErrorCode(status: number): string {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return 'BAD_REQUEST';
      case HttpStatus.UNAUTHORIZED:
        return 'UNAUTHORIZED';
      case HttpStatus.FORBIDDEN:
        return 'FORBIDDEN_ACCESS';
      case HttpStatus.NOT_FOUND:
        return 'RESOURCE_NOT_FOUND';
      case HttpStatus.CONFLICT:
        return 'RESOURCE_CONFLICT';
      case HttpStatus.UNPROCESSABLE_ENTITY:
        return 'UNPROCESSABLE_ENTITY';
      case HttpStatus.TOO_MANY_REQUESTS:
        return 'TOO_MANY_REQUESTS';
      case HttpStatus.PAYLOAD_TOO_LARGE:
        return 'PAYLOAD_TOO_LARGE';
      case HttpStatus.UNSUPPORTED_MEDIA_TYPE:
        return 'UNSUPPORTED_MEDIA_TYPE';
      default:
        return 'INTERNAL_SERVER_ERROR';
    }
  }
}
