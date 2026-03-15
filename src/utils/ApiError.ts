class ApiError extends Error {
  statusCode: number;
  success: boolean;
  message: string;
  data?: Record<string, any>;

  constructor(statusCode: number, message: string, data?: Record<string, any>) {
    super(message);
    this.statusCode = statusCode;
    this.success = false;
    this.message = message;
    this.data = data;
    Error.captureStackTrace(this, this.constructor);
  }
}

export default ApiError;
