import { UserStatus } from '../../../prisma/generated/enums';

export interface ICustomerFilters {
  fullName?: string;
  email?: string;
  status?: UserStatus;
  createdById?: string;
  search?: string;
}

export interface ICreateCustomerPayload {
  fullName: string;
  email: string;
  password: string;
}

export interface IUpdateCustomerPayload {
  fullName?: string;
  email?: string;
}
