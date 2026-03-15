import { IDecodedToken } from '../shared/interfaces/jwt.interface';

declare global {
  namespace Express {
    interface Request {
      user?: IDecodedToken;
    }
  }
}

