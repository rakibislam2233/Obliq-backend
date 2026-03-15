import bcrypt from 'bcryptjs';
import { StatusCodes } from 'http-status-codes';
import { RoleType, UserStatus } from '../../../prisma/generated/enums';
import ApiError from '../../utils/ApiError';
import { PaginationOptions } from '../../utils/pagination.utils';
import { AuditLogRepository } from '../auditLogs/auditLogs.repository';
import { CustomerRepository } from './customers.repository';
import {
  ICreateCustomerPayload,
  ICustomerFilters,
  IUpdateCustomerPayload,
} from './customers.interface';

const getAllCustomers = async (
  actorId: string,
  actorRole: string,
  filters: ICustomerFilters,
  options: PaginationOptions
) => {
  if (actorRole === RoleType.MANAGER) {
    filters.createdById = actorId;
  }

  return CustomerRepository.getAllCustomers(filters, options);
};

const getCustomerById = async (id: string) => {
  const customer = await CustomerRepository.getCustomerById(id);
  if (!customer) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Customer not found.');
  }
  return customer;
};

const createCustomer = async (payload: ICreateCustomerPayload, actorId: string) => {
  const emailExists = await CustomerRepository.isEmailExists(payload.email);
  if (emailExists) {
    throw new ApiError(StatusCodes.CONFLICT, 'Email already in use.');
  }

  const hashedPassword = await bcrypt.hash(payload.password, 12);
  const created = await CustomerRepository.createCustomer({
    ...payload,
    password: hashedPassword,
    createdById: actorId,
  });

  if (!created) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Customer role not configured.');
  }

  await AuditLogRepository.createLog({
    actorId,
    action: 'Customer Created',
    targetType: 'User',
    targetId: created.id,
  });

  return created;
};

const updateCustomer = async (id: string, payload: IUpdateCustomerPayload, actorId: string) => {
  const existing = await CustomerRepository.getCustomerById(id);
  if (!existing) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Customer not found.');
  }

  if (payload.email) {
    const emailExists = await CustomerRepository.isEmailExists(payload.email, id);
    if (emailExists) {
      throw new ApiError(StatusCodes.CONFLICT, 'Email already in use.');
    }
  }

  const updated = await CustomerRepository.updateCustomer(id, payload);

  await AuditLogRepository.createLog({
    actorId,
    action: 'Customer Updated',
    targetType: 'User',
    targetId: id,
    meta: { updatedFields: Object.keys(payload) },
  });

  return updated;
};

const updateCustomerStatus = async (id: string, status: UserStatus, actorId: string) => {
  const existing = await CustomerRepository.getCustomerById(id);
  if (!existing) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Customer not found.');
  }

  if (id === actorId) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'You cannot change your own status.');
  }

  const updated = await CustomerRepository.updateCustomerStatus(id, status);

  await AuditLogRepository.createLog({
    actorId,
    action: `Customer Status Updated To ${status}`,
    targetType: 'User',
    targetId: id,
  });

  return updated;
};

const deleteCustomer = async (id: string, actorId: string) => {
  const existing = await CustomerRepository.getCustomerById(id);
  if (!existing) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Customer not found.');
  }

  if (id === actorId) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'You cannot delete your own account.');
  }

  await CustomerRepository.deleteCustomer(id);

  await AuditLogRepository.createLog({
    actorId,
    action: 'Customer Deleted',
    targetType: 'User',
    targetId: id,
  });
};

export const CustomerService = {
  getAllCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  updateCustomerStatus,
  deleteCustomer,
};
