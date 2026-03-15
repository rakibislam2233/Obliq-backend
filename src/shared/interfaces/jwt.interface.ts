import jwt from 'jsonwebtoken';
export interface ITokenPayload {
  userId: string;
  email: string;
  role: string;
  batchId?: string;
  type: TokenType;
}

export interface IDecodedToken extends jwt.JwtPayload {
  userId: string;
  email: string;
  role: string;
  batchId?: string;
  type: TokenType;
}

export enum TokenType {
  ACCESS = 'access',
  REFRESH = 'refresh',
  RESET_PASSWORD = 'reset-password',
}
