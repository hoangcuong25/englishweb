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

export function handleApiError(err: unknown, fallbackMessage: string = 'Đã có lỗi xảy ra'): string {
  if (typeof err === 'object' && err !== null && 'response' in err) {
    const axiosErr = err as { response?: { data?: ApiErrorPayload } };
    const data = axiosErr.response?.data;
    if (data && data.errorCode) {
      const msg = Array.isArray(data.message) ? data.message.join(', ') : data.message;
      toast.error(msg || fallbackMessage);
      return data.errorCode;
    }
    if (data && data.message) {
      const msg = Array.isArray(data.message) ? data.message.join(', ') : data.message;
      toast.error(msg || fallbackMessage);
      return 'API_ERROR';
    }
  } else if (err instanceof Error) {
    toast.error(err.message || fallbackMessage);
    return 'CLIENT_ERROR';
  }

  toast.error(fallbackMessage);
  return 'UNKNOWN_ERROR';
}

