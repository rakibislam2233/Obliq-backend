import bcrypt from 'bcryptjs';
import { StatusCodes } from 'http-status-codes';
import { RoleType, UserStatus } from '../../../prisma/generated/enums';
import ApiError from '../../utils/ApiError';
import { PaginationOptions } from '../../utils/pagination.utils';
import { ICreateUserPayload, IUpdateUserPayload, IUserFilters } from './users.interface';
import { UserRepository } from './users.repository';

// ── Create User ───────────────────────────────
const createUser = async (payload: ICreateUserPayload, actorId: string, actorRole: string) => {
  // check email already exists
  const emailExists = await UserRepository.isEmailExists(payload.email);
  if (emailExists) {
    throw new ApiError(StatusCodes.CONFLICT, 'Email already in use.');
  }

  const targetRole = await UserRepository.getRoleById(payload.roleId);
  if (!targetRole) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid role id.');
  }

  // Grant ceiling: manager can create only agent/customer users
  if (actorRole === RoleType.MANAGER) {
    const allowedManagerTargets: RoleType[] = [RoleType.AGENT, RoleType.CUSTOMER];
    if (!allowedManagerTargets.includes(targetRole.name)) {
      throw new ApiError(
        StatusCodes.FORBIDDEN,
        'Managers can only create Agent or Customer users.'
      );
    }
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
    const emailExists = await UserRepository.isEmailExists(payload.email, id);
    if (emailExists) {
      throw new ApiError(StatusCodes.CONFLICT, 'Email already in use.');
    }
  }

  const updated = await UserRepository.updateUserById(id, payload);
  return updated;
};

const updateUserStatus = async (id: string, status: UserStatus, actorId: string) => {
  // User existence check
  const existing = await UserRepository.isUserExists(id);
  if (!existing) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User not found.');
  }

  // Self user status change check
  if (id === actorId) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'You cannot change your own status.');
  }

  const updated = await UserRepository.updateUserStatus(id, status);

  return updated;
};
// ── Delete User ───────────────────────────────
const deleteUser = async (id: string, actorId: string) => {
  // User existence check
  const existing = await UserRepository.isUserExists(id);
  if (!existing) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User not found.');
  }

  // You cannot delete your own account check
  if (id === actorId) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'You cannot delete your own account.');
  }

  await UserRepository.deleteUserById(id);
};
export const UserService = {
  createUser,
  getUserById,
  getAllUsers,
  updateUser,
  updateUserStatus,
  deleteUser,
};
