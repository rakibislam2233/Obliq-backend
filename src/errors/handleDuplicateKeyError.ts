import { IErrorMessage, IGenericErrorResponse } from '../shared/types/common.types';

// Handles raw PostgreSQL unique violation errors (error code 23505)
const handleDuplicateKeyError = (error: { message?: string; detail?: string }): IGenericErrorResponse => {
  const detail = error.detail || error.message || 'Duplicate key error';

  const fieldMatch = detail.match(/Key \((.+?)\)=/);
  const field = fieldMatch ? fieldMatch[1] : 'field';
  const friendlyField = field
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();

  const message = `${friendlyField} already exists`;

  const errorMessages: IErrorMessage[] = [
    {
      path: field,
      message,
    },
  ];

  return {
    statusCode: 409,
    message,
    errorMessages,
  };
};

export default handleDuplicateKeyError;
