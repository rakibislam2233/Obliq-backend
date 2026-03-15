import { RoleType, UserStatus } from '../../../prisma/generated/enums';
import { database } from '../../config/database.config';
import {
  createPaginationQuery,
  createPaginationResult,
  PaginationOptions,
  PaginationResult,
  parsePaginationOptions,
} from '../../utils/pagination.utils';
import {
  ICreateCustomerPayload,
  ICustomerFilters,
  IUpdateCustomerPayload,
} from './customers.interface';

const customerSelect = {
  id: true,
  fullName: true,
  email: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  createdById: true,
  role: {
    select: {
      id: true,
      name: true,
    },
  },
};

const getCustomerRoleId = async (): Promise<string | null> => {
  const role = await database.role.findUnique({
    where: { name: RoleType.CUSTOMER },
    select: { id: true },
  });
  return role?.id ?? null;
};

const getAllCustomers = async (
  filters: ICustomerFilters,
  options: PaginationOptions
): Promise<PaginationResult<any>> => {
  const pagination = parsePaginationOptions(options);
  const { skip, take, orderBy } = createPaginationQuery(pagination);

  const customerRoleId = await getCustomerRoleId();
  if (!customerRoleId) {
    return createPaginationResult([], 0, pagination);
  }

  const where: any = {
    roleId: customerRoleId,
  };

  if (filters.search) {
    where.OR = [
      { fullName: { contains: filters.search, mode: 'insensitive' } },
      { email: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  if (filters.fullName) {
    where.fullName = { contains: filters.fullName, mode: 'insensitive' };
  }
  if (filters.email) {
    where.email = { contains: filters.email, mode: 'insensitive' };
  }
  if (filters.status) {
    where.status = filters.status;
  }
  if (filters.createdById) {
    where.createdById = filters.createdById;
  }

  const [customers, total] = await Promise.all([
    database.user.findMany({
      where,
      select: customerSelect,
      skip,
      take,
      orderBy,
    }),
    database.user.count({ where }),
  ]);

  return createPaginationResult(customers, total, pagination);
};

const getCustomerById = async (id: string) => {
  return database.user.findFirst({
    where: {
      id,
      role: { name: RoleType.CUSTOMER },
    },
    select: {
      ...customerSelect,
      password: true,
    },
  });
};

const createCustomer = async (payload: ICreateCustomerPayload & { createdById: string }) => {
  const customerRoleId = await getCustomerRoleId();
  if (!customerRoleId) {
    return null;
  }

  return database.user.create({
    data: {
      fullName: payload.fullName,
      email: payload.email,
      password: payload.password,
      roleId: customerRoleId,
      status: UserStatus.ACTIVE,
      createdById: payload.createdById,
    },
    select: customerSelect,
  });
};

const updateCustomer = async (id: string, payload: IUpdateCustomerPayload) => {
  return database.user.update({
    where: { id },
    data: payload,
    select: customerSelect,
  });
};

const updateCustomerStatus = async (id: string, status: UserStatus) => {
  return database.user.update({
    where: { id },
    data: { status },
    select: customerSelect,
  });
};

const deleteCustomer = async (id: string) => {
  return database.user.delete({
    where: { id },
  });
};

const isEmailExists = async (email: string, excludeCustomerId?: string): Promise<boolean> => {
  const customer = await database.user.findFirst({
    where: {
      email,
      role: { name: RoleType.CUSTOMER },
      ...(excludeCustomerId ? { id: { not: excludeCustomerId } } : {}),
    },
    select: { id: true },
  });

  return !!customer;
};

export const CustomerRepository = {
  getAllCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  updateCustomerStatus,
  deleteCustomer,
  isEmailExists,
};
