export interface IErrorResponse {
  success: false;
  statusCode: number;
  message: string;
  errorMessages?: IErrorMessage[];
}

export interface IErrorMessage {
  path: string;
  message: string;
}

export interface IApiResponse<T> {
  statusCode: number;
  success: boolean;
  message?: string;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages?: number;
    hasNext?: boolean;
    hasPrev?: boolean;
  };
  data?: T;
  timestamp?: string;
}
