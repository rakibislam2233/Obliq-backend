import { RoleType, UserStatus } from '../../../prisma/generated/enums';
import { database } from '../../config/database.config';
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
  return database.user.create({
    data: {
      fullName: userData.fullName,
      email: userData.email,
      password: userData.password,
      roleId: userData.roleId,
      createdById: userData.createdById,
    },
    select: userListSelect,
  });
};

// ── Get User by ID  -----
const getUserById = async (id: string) => {
  return database.user.findFirst({
    where: { id },
    select: {
      ...userFullSelect,
      password: true,
    },
  });
};

// ── Get User by ID ──
const getUserByIdPublic = async (id: string) => {
  return database.user.findFirst({
    where: { id },
    select: userFullSelect,
  });
};

// ── Get User by Email ──────────
const getUserByEmail = async (email: string) => {
  return database.user.findFirst({
    where: { email },
    select: {
      ...userFullSelect,
      password: true,
    },
  });
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
};

// ── Update User by ID ──────────────────────────
const updateUserById = async (id: string, data: IUpdateUserPayload) => {
  return database.user.update({
    where: { id },
    data,
    select: userListSelect,
  });
};

// ── Update User Status ──────────────────────────
const updateUserStatus = async (id: string, status: UserStatus) => {
  return database.user.update({
    where: { id },
    data: { status },
    select: userListSelect,
  });
};

// ── Delete User (Hard Delete) ──────────────────
const deleteUserById = async (id: string) => {
  return database.user.delete({
    where: { id },
  });
};

// ── Email Exists Check ─────────────────────────
const isEmailExists = async (email: string, excludeUserId?: string): Promise<boolean> => {
  const user = await database.user.findFirst({
    where: {
      email,
      ...(excludeUserId ? { id: { not: excludeUserId } } : {}),
    },
    select: { id: true },
  });
  return !!user;
};

const getRoleById = async (id: string): Promise<{ id: string; name: RoleType } | null> => {
  return database.role.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
    },
  });
};

// ── User Exists Check ──────────────────────────
const isUserExists = async (id: string): Promise<boolean> => {
  const user = await database.user.findUnique({
    where: { id },
    select: { id: true },
  });
  return !!user;
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
