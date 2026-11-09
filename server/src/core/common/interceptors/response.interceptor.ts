import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Request, Response } from 'express';
import { RESPONSE_MESSAGE_KEY } from '../decorators/response-message.decorator';

/**
 * Chuẩn hóa cấu trúc phản hồi thành công (Success Response Envelope)
 */
export interface StandardSuccessResponse<T> {
  success: true;
  statusCode: number;
  message: string;
  data: T;
  timestamp: string;
  path: string;
}

/**
 * Chuẩn hóa cấu trúc phản hồi lỗi (Error Response Envelope)
 */
export interface StandardErrorResponse {
  success: false;
  statusCode: number;
  errorCode: string;
  message: string | string[];
  error: string;
  timestamp: string;
  path: string;
}

@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, StandardSuccessResponse<T>>
{
  constructor(private reflector?: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<any> {
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest<Request>();
    const response = httpContext.getResponse<Response>();

    // Bỏ qua định dạng đối với Swagger docs, metrics hoặc endpoint stream nhị phân (Buffer)
    if (
      request.url?.startsWith('/api/docs') ||
      request.url?.includes('/stream')
    ) {
      return next.handle();
    }

    // Lấy thông điệp tùy chỉnh được gắn qua @ResponseMessage('...')
    const customMessage = this.reflector
      ? this.reflector.get<string>(RESPONSE_MESSAGE_KEY, context.getHandler())
      : undefined;

    return next.handle().pipe(
      map((resData) => {
        // Nếu response đã gửi header hoặc là Buffer/Stream, giữ nguyên dữ liệu gốc
        if (response.headersSent || Buffer.isBuffer(resData)) {
          return resData;
        }

        const statusCode = response.statusCode || HttpStatus.OK;

        // Trích xuất message nếu controller trả về object có trường `message`
        let responseMessage = customMessage || this.getDefaultMessage(statusCode);
        let actualData = resData;

        if (
          resData &&
          typeof resData === 'object' &&
          !Array.isArray(resData) &&
          'message' in resData
        ) {
          responseMessage = resData.message || responseMessage;
          const { message, ...restData } = resData;
          actualData = Object.keys(restData).length > 0 ? restData : null;
        }

        const formattedResponse: StandardSuccessResponse<T> = {
          success: true,
          statusCode,
          message: responseMessage,
          data: actualData,
          timestamp: new Date().toISOString(),
          path: request.url,
        };

        return formattedResponse;
      }),
      catchError((err) => {
        const statusCode =
          err instanceof HttpException
            ? err.getStatus()
            : HttpStatus.INTERNAL_SERVER_ERROR;

        const errorCode = this.getErrorCode(statusCode);
        const errorDetails = this.extractErrorMessage(err);

        const formattedError: StandardErrorResponse = {
          success: false,
          statusCode,
          errorCode,
          message: errorDetails.message,
          error: errorDetails.error || errorCode,
          timestamp: new Date().toISOString(),
          path: request.url,
        };

        return throwError(
          () => new HttpException(formattedError, statusCode),
        );
      }),
    );
  }

  /**
   * Trích xuất thông điệp lỗi rõ ràng từ HttpException hoặc Error thông thường
   */
  private extractErrorMessage(err: any): { message: string | string[]; error: string } {
    if (err instanceof HttpException) {
      const res = err.getResponse();
      if (typeof res === 'string') {
        return { message: res, error: err.name };
      }
      if (typeof res === 'object' && res !== null) {
        const resObj = res as Record<string, any>;
        return {
          message: resObj.message || err.message,
          error: resObj.error || err.name,
        };
      }
    }
    return {
      message: err.message || 'Đã có lỗi hệ thống xảy ra. Vui lòng thử lại sau.',
      error: 'INTERNAL_SERVER_ERROR',
    };
  }

  /**
   * Ánh xạ mã HTTP status sang mã lỗi chuẩn nghiệp vụ
   */
  private getErrorCode(status: number): string {
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
      case HttpStatus.INTERNAL_SERVER_ERROR:
      default:
        return 'INTERNAL_SERVER_ERROR';
    }
  }

  /**
   * Thông điệp mặc định theo mã trạng thái HTTP
   */
  private getDefaultMessage(statusCode: number): string {
    switch (statusCode) {
      case HttpStatus.OK:
        return 'Xử lý yêu cầu thành công';
      case HttpStatus.CREATED:
        return 'Khởi tạo dữ liệu thành công';
      case HttpStatus.ACCEPTED:
        return 'Yêu cầu đã được tiếp nhận và xử lý';
      case HttpStatus.NO_CONTENT:
        return 'Thực hiện thành công không có nội dung trả về';
      default:
        return 'Thành công';
    }
  }
}
