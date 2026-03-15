import { Prisma } from '@prisma/client';
import { IErrorMessage, IGenericErrorResponse } from '../shared/types/common.types';

// Handles Prisma P2002 — unique constraint violation
const handleDuplicateError = (error: Prisma.PrismaClientKnownRequestError): IGenericErrorResponse => {
  const target = error.meta?.target as string[] | string | undefined;
  const fields = Array.isArray(target) ? target : target ? [target] : ['field'];
  const field = fields[0];

  const friendlyField = field
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();

  const errorMessages: IErrorMessage[] = [
    {
      path: field,
      message: `${friendlyField} already exists`,
    },
  ];

  return {
    statusCode: 409,
    message: `${friendlyField} already exists`,
    errorMessages,
  };
};

export default handleDuplicateError;
