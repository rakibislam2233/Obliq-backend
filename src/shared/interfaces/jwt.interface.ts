export enum TokenType {
  ACCESS = 'ACCESS',
  REFRESH = 'REFRESH',
}

export interface ITokenPayload {
  userId: string;
  email: string;
  role: string;
  permissions: string[];
  type: TokenType;
}

export interface IDecodedToken extends ITokenPayload {
  iat: number;
  exp: number;
}
