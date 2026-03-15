import { IApiResponse } from '../shared/interfaces/response.interface';
import { Response } from 'express';

const sendResponse = <T>(res: Response, data: IApiResponse<T>): void => {
  const responseData: IApiResponse<T> = {
    statusCode: data.statusCode,
    success: data.success,
    message: data.message || 'Success',
    meta: data.meta || undefined,
    data: data.data || undefined,
    timestamp: new Date().toISOString(),
  };

  res.status(data.statusCode).json(responseData);
};

export default sendResponse;
