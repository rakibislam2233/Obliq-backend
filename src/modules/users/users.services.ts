import { StatusCodes } from 'http-status-codes';
import bcrypt from 'bcryptjs';
import ApiError from '../../utils/ApiError';
import { UserRepository } from './users.repository';
import { ICreateUserPayload, IUpdateUserPayload, IUserFilters } from './users.interface';
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

// ── Get Single User ───────────────────────────
const getUserById = async (id: string) => {
  const user = await UserRepository.getUserByIdPublic(id);
  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User not found.');
  }
  return user;
};

// ── Update User ───────────────────────────────
const updateUser = async (id: string, payload: IUpdateUserPayload) => {
  // User existence check
  const existing = await UserRepository.isUserExists(id);
  if (!existing) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User not found.');
  }

  // when email update check if the new email is already taken by another user
  if (payload.email) {
    const emailExists = await UserRepository.isEmailExists(payload.email);
    if (emailExists) {
      throw new ApiError(StatusCodes.CONFLICT, 'Email already in use.');
    }
  }

  const updated = await UserRepository.updateUserById(id, payload);
  return updated;
};



export const UserService = {
  createUser,
  getAllUsers,
};
