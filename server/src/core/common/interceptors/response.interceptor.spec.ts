import { ResponseInterceptor } from './response.interceptor';
import { ExecutionContext, CallHandler, HttpException, HttpStatus } from '@nestjs/common';
import { of, throwError } from 'rxjs';

describe('ResponseInterceptor', () => {
  let interceptor: ResponseInterceptor<any>;
  let mockContext: ExecutionContext;
  let mockHandler: CallHandler;
  let mockRequest: any;
  let mockResponse: any;

  beforeEach(() => {
    interceptor = new ResponseInterceptor();

    mockRequest = {
      url: '/api/test-endpoint',
    };

    mockResponse = {
      statusCode: 200,
      headersSent: false,
    };

    mockContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
        getResponse: () => mockResponse,
      }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as unknown as ExecutionContext;
  });

  it('should format successful response with standard envelope', (done) => {
    mockHandler = {
      handle: () => of({ id: '123', name: 'IELTS Intensive' }),
    };

    interceptor.intercept(mockContext, mockHandler).subscribe({
      next: (result) => {
        expect(result).toHaveProperty('success', true);
        expect(result).toHaveProperty('statusCode', 200);
        expect(result).toHaveProperty('message', 'Xử lý yêu cầu thành công');
        expect(result.data).toEqual({ id: '123', name: 'IELTS Intensive' });
        expect(result).toHaveProperty('timestamp');
        expect(result).toHaveProperty('path', '/api/test-endpoint');
        done();
      },
    });
  });

  it('should extract custom message if returned data contains message property', (done) => {
    mockHandler = {
      handle: () => of({ message: 'Ghi danh thành công', courseId: 'c-1' }),
    };

    interceptor.intercept(mockContext, mockHandler).subscribe({
      next: (result) => {
        expect(result.success).toBe(true);
        expect(result.message).toBe('Ghi danh thành công');
        expect(result.data).toEqual({ courseId: 'c-1' });
        done();
      },
    });
  });

  it('should format error response with standard errorCode and message', (done) => {
    const error = new HttpException('Dữ liệu không hợp lệ', HttpStatus.BAD_REQUEST);
    mockHandler = {
      handle: () => throwError(() => error),
    };

    interceptor.intercept(mockContext, mockHandler).subscribe({
      error: (err: HttpException) => {
        const errorResponse: any = err.getResponse();
        expect(errorResponse.success).toBe(false);
        expect(errorResponse.statusCode).toBe(400);
        expect(errorResponse.errorCode).toBe('BAD_REQUEST');
        expect(errorResponse.message).toBe('Dữ liệu không hợp lệ');
        expect(errorResponse.path).toBe('/api/test-endpoint');
        done();
      },
    });
  });
});
