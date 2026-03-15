import { RoleType, UserStatus } from '../../../prisma/generated/enums';
import { database } from '../../config/database.config';
import logger from '../../utils/logger';
import {
  createPaginationQuery,
  createPaginationResult,
  PaginationOptions,
  PaginationResult,
  parsePaginationOptions,
} from '../../utils/pagination.utils';
import { ICreateUserPayload, IUpdateUserPayload, IUserFilters } from './users.interface';

// ─────────────────────────────────────────────
const userFullSelect = {
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
  userPermissions: {
    where: { isRevoked: false },
    select: {
      id: true,
      isRevoked: true,
      permission: {
        select: {
          id: true,
          atom: true,
          description: true,
          module: true,
        },
      },
    },
  },
};

// ─────────────────────────────────────────────
const userListSelect = {
  id: true,
  fullName: true,
  email: true,
  status: true,
  createdAt: true,
  createdById: true,
  role: {
    select: {
      id: true,
      name: true,
    },
  },
};

// ── Create User ───────────────────────────────
const createUser = async (userData: ICreateUserPayload) => {
  try {
    return await database.user.create({
      data: {
        fullName: userData.fullName,
        email: userData.email,
        password: userData.password,
        roleId: userData.roleId,
        createdById: userData.createdById,
      },
      select: userListSelect,
    });
  } catch (err) {
    logger.error('UserRepository.createUser failed:', err);
    throw err;
  }
};

// ── Get User by ID  -----
const getUserById = async (id: string) => {
  try {
    return await database.user.findFirst({
      where: { id },
      select: {
        ...userFullSelect,
        password: true,
      },
    });
  } catch (err) {
    logger.error('UserRepository.getUserById failed:', err);
    throw err;
  }
};

// ── Get User by ID ──
const getUserByIdPublic = async (id: string) => {
  try {
    return await database.user.findFirst({
      where: { id },
      select: userFullSelect,
    });
  } catch (err) {
    logger.error('UserRepository.getUserByIdPublic failed:', err);
    throw err;
  }
};

// ── Get User by Email ──────────
const getUserByEmail = async (email: string) => {
  try {
    return await database.user.findFirst({
      where: { email },
      select: {
        ...userFullSelect,
        password: true,
      },
    });
  } catch (err) {
    logger.error('UserRepository.getUserByEmail failed:', err);
    throw err;
  }
};

// ── Get All Users with Filters + Pagination ───
const getAllUsers = async (
  filters: IUserFilters,
  options: PaginationOptions
): Promise<PaginationResult<any>> => {
  const pagination = parsePaginationOptions(options);
  const { skip, take, orderBy } = createPaginationQuery(pagination);

  const where: any = {};

  // Search filter
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
  if (filters.roleId) {
    where.roleId = filters.roleId;
  }
  if (filters.createdById) {
    where.createdById = filters.createdById;
  }

  try {
    const [users, total] = await Promise.all([
      database.user.findMany({
        where,
        select: userListSelect,
        skip,
        take,
        orderBy,
      }),
      database.user.count({ where }),
    ]);
    return createPaginationResult(users, total, pagination);
  } catch (err) {
    logger.error('UserRepository.getAllUsers failed:', err);
    throw err;
  }
};

// ── Update User by ID ──────────────────────────
const updateUserById = async (id: string, data: IUpdateUserPayload) => {
  try {
    return await database.user.update({
      where: { id },
      data,
      select: userListSelect,
    });
  } catch (err) {
    logger.error('UserRepository.updateUserById failed:', err);
    throw err;
  }
};

// ── Update User Status ──────────────────────────
const updateUserStatus = async (id: string, status: UserStatus) => {
  try {
    return await database.user.update({
      where: { id },
      data: { status },
      select: userListSelect,
    });
  } catch (err) {
    logger.error('UserRepository.updateUserStatus failed:', err);
    throw err;
  }
};

// ── Delete User (Hard Delete) ──────────────────
const deleteUserById = async (id: string) => {
  try {
    return await database.user.delete({
      where: { id },
    });
  } catch (err) {
    logger.error('UserRepository.deleteUserById failed:', err);
    throw err;
  }
};

// ── Email Exists Check ─────────────────────────
const isEmailExists = async (email: string, excludeUserId?: string): Promise<boolean> => {
  try {
    const user = await database.user.findFirst({
      where: {
        email,
        ...(excludeUserId ? { id: { not: excludeUserId } } : {}),
      },
      select: { id: true },
    });
    return !!user;
  } catch (err) {
    logger.error('UserRepository.isEmailExists failed:', err);
    throw err;
  }
};

const getRoleById = async (id: string): Promise<{ id: string; name: RoleType } | null> => {
  try {
    return await database.role.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
      },
    });
  } catch (err) {
    logger.error('UserRepository.getRoleById failed:', err);
    throw err;
  }
};

// ── User Exists Check ──────────────────────────
const isUserExists = async (id: string): Promise<boolean> => {
  try {
    const user = await database.user.findUnique({
      where: { id },
      select: { id: true },
    });
    return !!user;
  } catch (err) {
    logger.error('UserRepository.isUserExists failed:', err);
    throw err;
  }
};

export const UserRepository = {
  createUser,
  getUserById,
  getUserByIdPublic,
  getUserByEmail,
  getAllUsers,
  updateUserById,
  updateUserStatus,
  deleteUserById,
  isEmailExists,
  isUserExists,
  getRoleById,
};
