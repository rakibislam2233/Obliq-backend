import { ZodError, ZodIssue } from 'zod';
import { IGenericErrorResponse } from '../shared/types/common.types';

const handleZodError = (error: ZodError): IGenericErrorResponse => {
  const statusCode = 400;

  const errorMessages = error.issues.map((issue: ZodIssue) => {
    // Format the path to be more user-friendly, removing 'body.' prefix for cleaner display
    let path = Array.isArray(issue.path) ? issue.path.join('.') : (issue.path as string | number);

    // Remove 'body.' prefix for cleaner user-facing messages
    if (typeof path === 'string' && path.startsWith('body.')) {
      path = path.substring(5); // Remove 'body.' prefix
    }

    // Improve certain common error messages
    let message = issue.message;

    // More user-friendly messages for common validation errors
    if (message.includes('expected string, received null')) {
      message = 'Field cannot be null';
    } else if (message.includes('expected string, received undefined')) {
      message = 'Field is required';
    } else if (message.includes('String must contain at least')) {
      const match = message.match(/at least (\d+) character/);
      if (match) {
        message = `Must be at least ${match[1]} characters`;
      }
    } else if (message.includes('String must contain at most')) {
      const match = message.match(/at most (\d+) character/);
      if (match) {
        message = `Must be at most ${match[1]} characters`;
      }
    } else if (message.includes('Invalid email format')) {
      message = 'Please provide a valid email address';
    } else if (message.includes('String must be a valid phone number')) {
      message = 'Please provide a valid phone number';
    }

    return {
      path: path as string | number,
      message,
    };
  });


  // Create a more readable combined message
  const message = errorMessages
    .map(issue => {
      if (typeof issue.path === 'string' && issue.path !== 'request_body') {
        return `${issue.path.charAt(0).toUpperCase() + issue.path.slice(1)}: ${issue.message}`;
      }
      return issue.message;
    })
    .join('. ');

  return {
    statusCode,
    message,
    errorMessages,
  };
};

export default handleZodError;
