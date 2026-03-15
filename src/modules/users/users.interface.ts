import { UserStatus } from '../../../prisma/generated/enums';

export interface ICreateUserPayload {
  fullName: string;
  email: string;
  password: string;
  roleId: string;
}

export interface IUser {
  id: string;
  fullName: string;
  email: string;
  roleId: string;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
}
