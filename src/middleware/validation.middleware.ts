import { NextFunction, Request, Response } from 'express';
import { ZodObject } from 'zod';

const validateRequest =
  (schema: ZodObject<any>) => async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = await schema.parseAsync({
        body: req.body,
        params: req.params,
        query: req.query,
        cookies: req.cookies,
      });

      req.body = (parsed as any).body;

      next();
    } catch (error) {
      next(error);
    }
  };

export default validateRequest;
