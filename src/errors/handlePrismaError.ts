import { Prisma } from '@prisma/client';
import { IGenericErrorResponse } from '../shared/types/common.types';

// Handles PrismaClientKnownRequestError — maps Prisma error codes to HTTP responses
const handlePrismaError = (error: Prisma.PrismaClientKnownRequestError): IGenericErrorResponse => {
  switch (error.code) {
    case 'P2000': {
      // Value too long for column type
      const column = String(error.meta?.column_name ?? 'field');
      return {
        statusCode: 400,
        message: 'Input value is too long for this field',
        errorMessages: [{ path: column, message: `Value is too long for column "${column}"` }],
      };
    }

    case 'P2001': {
      // Record searched does not exist
      return {
        statusCode: 404,
        message: 'Record not found',
        errorMessages: [{ path: 'record', message: 'The requested record does not exist' }],
      };
    }

    case 'P2002': {
      // Unique constraint violation
      const target = error.meta?.target as string[] | string | undefined;
      const fields = Array.isArray(target) ? target : target ? [target] : ['field'];
      const field = fields[0];
      const friendlyField = field
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, str => str.toUpperCase())
        .trim();
      return {
        statusCode: 409,
        message: `${friendlyField} already exists`,
        errorMessages: [{ path: field, message: `${friendlyField} already exists` }],
      };
    }

    case 'P2003': {
      // Foreign key constraint failed
      const fieldName = String(error.meta?.field_name ?? 'field');
      return {
        statusCode: 400,
        message: 'Related record not found',
        errorMessages: [
          { path: fieldName, message: 'The referenced record does not exist' },
        ],
      };
    }

    case 'P2004': {
      // Constraint failed on the database
      return {
        statusCode: 400,
        message: 'Database constraint violation',
        errorMessages: [{ path: 'database', message: error.message }],
      };
    }

    case 'P2005':
    case 'P2006': {
      // Invalid value stored / provided for a field
      const fieldName = String(error.meta?.field_name ?? 'field');
      return {
        statusCode: 400,
        message: 'Invalid field value',
        errorMessages: [{ path: fieldName, message: `Invalid value provided for "${fieldName}"` }],
      };
    }

    case 'P2011': {
      // Null constraint violation
      const constraint = String(error.meta?.constraint ?? 'field');
      return {
        statusCode: 400,
        message: 'Required field is missing',
        errorMessages: [{ path: constraint, message: `"${constraint}" cannot be null` }],
      };
    }

    case 'P2012': {
      // Missing required value
      const path = String(error.meta?.path ?? 'field');
      return {
        statusCode: 400,
        message: 'Missing required field',
        errorMessages: [{ path, message: `Missing required value at "${path}"` }],
      };
    }

    case 'P2013': {
      // Missing required argument
      const argName = String(error.meta?.argument_name ?? 'argument');
      return {
        statusCode: 400,
        message: 'Missing required argument',
        errorMessages: [{ path: argName, message: `Required argument "${argName}" is missing` }],
      };
    }

    case 'P2014': {
      // Relation violation (required relation would be violated)
      const relation = String(error.meta?.relation_name ?? 'relation');
      return {
        statusCode: 400,
        message: 'Relation constraint violation',
        errorMessages: [{ path: relation, message: error.message }],
      };
    }

    case 'P2015': {
      // Related record not found
      return {
        statusCode: 404,
        message: 'Related record not found',
        errorMessages: [{ path: 'relation', message: error.message }],
      };
    }

    case 'P2025': {
      // Record to update/delete was not found
      const cause = String(error.meta?.cause ?? 'The requested record was not found');
      return {
        statusCode: 404,
        message: 'Record not found',
        errorMessages: [{ path: 'record', message: cause }],
      };
    }

    default: {
      return {
        statusCode: 500,
        message: 'An unexpected database error occurred',
        errorMessages: [{ path: 'database', message: error.message }],
      };
    }
  }
};

export default handlePrismaError;
