import { ErrorRequestHandler, NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import handleDuplicateError from '../errors/handleDuplicateError';
import handleValidationError from '../errors/handleValidationError';
import handleZodError from '../errors/handleZodError';
import ApiError from '../utils/ApiError';

const globalErrorHandler: ErrorRequestHandler = (
  error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = 500;
  let message = 'Something went wrong !';
  let errorDetails = undefined;

  // Handle specific error types and extract unique messages
  if (error instanceof ZodError) {
    const simplifiedError = handleZodError(error);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorDetails = simplifiedError.errorMessages;
  } else if (error?.name === 'ValidationError') {
    const simplifiedError = handleValidationError(error);
    statusCode = simplifiedError.statusCode;
    // Combine all mongoose validation messages into one string
    message = simplifiedError.errorMessages.map(msg => msg.message).join('. ');
    errorDetails = simplifiedError.errorMessages;
  } else if (
    error.name === 'DuplicateError' ||
    (error.name === 'MongoServerError' && error.code === 11000)
  ) {
    const simplifiedError = handleDuplicateError(error);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorDetails = [{ path: Object.keys(error.keyValue)[0], message: simplifiedError.message }];
  } else if (error.name === 'MongoServerError') {
    if (error.code === 121) {
      statusCode = 400;
      message = 'Document validation failed';
    } else {
      statusCode = 500;
      message = error.message || 'Database error';
    }
    errorDetails = [{ path: 'database', message: error.message || 'Database error' }];
  } else if (error.message?.includes('timeout') || error.name === 'TimeoutError') {
    statusCode = 504;
    message = 'Request timed out';
    errorDetails = [{ path: 'request', message: error.message }];
  } else if (error instanceof ApiError) {
    statusCode = error.statusCode;
    message = error.message;
    errorDetails = error.data ? [{ path: 'general', message: error.message }] : undefined;
  } else if (error instanceof Error) {
    message = error.message;
    errorDetails = [{ path: 'general', message: error.message }];
  }
  // Final cleaned up response
  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    errorMessages: errorDetails,
    timestamp: new Date().toISOString(),
  });
};

export default globalErrorHandler;
