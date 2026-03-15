import { StatusCodes } from 'http-status-codes';
import bcrypt from 'bcryptjs';
import ApiError from '../../utils/ApiError';
import { UserRepository } from './users.repository';
import { ICreateUserPayload, IUserFilters } from './users.interface';
import { PaginationOptions } from '../../utils/pagination.utils';

// ── Create User ───────────────────────────────
const createUser = async (payload: ICreateUserPayload, actorId: string) => {
  // check email already exists
  const emailExists = await UserRepository.isEmailExists(payload.email);
  if (emailExists) {
    throw new ApiError(StatusCodes.CONFLICT, 'Email already in use.');
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(payload.password, 12);

  // create user
  const user = await UserRepository.createUser({
    ...payload,
    password: hashedPassword,
    createdById: actorId,
  });

  return user;
};

// ── Get All Users ─────────────────────────────
const getAllUsers = async (
  actorId: string,
  actorRole: string,
  filters: IUserFilters,
  options: PaginationOptions
) => {
  // Only MANAGER can see users created by themselves
  if (actorRole === 'MANAGER') {
    filters.createdById = actorId;
  }
  return UserRepository.getAllUsers(filters, options);
};
export const UserService = {
  createUser,
  getAllUsers,
};
