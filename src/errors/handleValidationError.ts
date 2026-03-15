import { Prisma } from '@prisma/client';
import { IErrorMessage, IGenericErrorResponse } from '../shared/types/common.types';

// Handles PrismaClientValidationError — wrong argument types or missing required fields
const handleValidationError = (
  error: Prisma.PrismaClientValidationError
): IGenericErrorResponse => {
  const rawMessage = error.message;

  // Extract meaningful lines from Prisma's verbose validation message
  const lines = rawMessage
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 0 && !l.startsWith('at ') && !l.includes('prisma.'));

  const cleanMessage =
    lines.slice(0, 3).join(' ').replace(/\s+/g, ' ').trim() || 'Validation failed';

  const errorMessages: IErrorMessage[] = [
    {
      path: 'validation',
      message: cleanMessage,
    },
  ];

  return {
    statusCode: 400,
    message: 'Validation failed',
    errorMessages,
  };
};

export default handleValidationError;
