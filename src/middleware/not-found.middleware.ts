import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status-codes';

const notFound = (req: Request, res: Response, next: NextFunction) => {
  const message = `The requested endpoint ${req.originalUrl} was not found`;
  res.status(httpStatus.NOT_FOUND).json({
    statusCode: httpStatus.NOT_FOUND,
    success: false,
    message,
    errorMessages: [
      {
        path: req.originalUrl,
        message,
      },
    ],
    timestamp: new Date(),
  });
  next();
};

export default notFound;
