import { toast } from '@/components/ui/toast';

export interface ApiErrorPayload {
  success: boolean;
  statusCode: number;
  errorCode: string;
  message: string | string[];
  error?: string;
  timestamp?: string;
  path?: string;
}

export function extractErrorMessage(err: unknown, fallbackMessage: string = 'Đã có lỗi xảy ra. Vui lòng thử lại.'): string {
  if (typeof err === 'object' && err !== null) {
    const axiosErr = err as { response?: { data?: { message?: string | string[]; error?: string; errorCode?: string } } };
    const data = axiosErr.response?.data;
    if (data?.message) {
      const msg = Array.isArray(data.message) ? data.message.join(', ') : data.message;
      if (msg && typeof msg === 'string' && !msg.startsWith('Request failed')) {
        return msg;
      }
    }
    if (data?.error && typeof data.error === 'string' && !data.error.startsWith('Request failed')) {
      return data.error;
    }
  }

  if (err instanceof Error) {
    const rawMsg = err.message || '';
    if (rawMsg.includes('Network Error')) {
      return 'Lỗi kết nối mạng. Vui lòng kiểm tra lại kết nối internet.';
    }
    if (rawMsg.includes('timeout')) {
      return 'Yêu cầu quá thời gian chờ (timeout). Vui lòng thử lại sau.';
    }
    if (rawMsg.includes('status code 400')) {
      return 'Dữ liệu gửi lên không hợp lệ.';
    }
    if (rawMsg.includes('status code 401')) {
      return 'Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.';
    }
    if (rawMsg.includes('status code 403')) {
      return 'Bạn không có quyền thực hiện thao tác này.';
    }
    if (rawMsg.includes('status code 404')) {
      return 'Không tìm thấy dữ liệu yêu cầu.';
    }
    if (rawMsg.includes('status code 500')) {
      return 'Đã có lỗi hệ thống xảy ra. Vui lòng thử lại sau.';
    }
    if (!rawMsg.includes('AxiosError') && !rawMsg.includes('status code')) {
      return rawMsg;
    }
  }

  return fallbackMessage;
}

export function handleApiError(err: unknown, fallbackMessage: string = 'Đã có lỗi xảy ra'): string {
  const friendlyMsg = extractErrorMessage(err, fallbackMessage);
  toast.error(friendlyMsg);

  if (typeof err === 'object' && err !== null && 'response' in err) {
    const axiosErr = err as { response?: { data?: ApiErrorPayload } };
    const data = axiosErr.response?.data;
    if (data?.errorCode) {
      return data.errorCode;
    }
  }

  return 'API_ERROR';
}
