import { UserStatus } from '../../../prisma/generated/enums';
import { database } from '../../config/database.config';
import {
  createPaginationQuery,
  createPaginationResult,
  PaginationOptions,
  PaginationResult,
  parsePaginationOptions,
} from '../../utils/pagination.utils';
import { ICreateUserPayload, IUser } from './users.interface';

// --Create User
const createUser = async (userData: ICreateUserPayload): Promise<IUser> => {
  const user = await database.user.create({
    data: {
      fullName: userData.fullName,
      email: userData.email,
      password: userData.password,
      roleId: userData.roleId,
    },
  });
  const result = {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    roleId: user.roleId,
    status: user.status,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
  return result;
};

// ── Get User by ID ───────────────────────────────────────────────────────────
const getUserById = async (id: string) => {
  return database.user.findFirst({
    where: { id },
    select: {
      id: true,
      fullName: true,
      email: true,
      password: true,
      status: true,
      role: {
        select: {
          id: true,
          name: true,
        },
      },
      createdAt: true,
    },
  });
};

// ── Get All Users with Filters and Pagination ─────────────────────────────────
const getAllUsers = async (
  filters: any,
  options: PaginationOptions
): Promise<PaginationResult<any>> => {
  const pagination = parsePaginationOptions(options);
  const { skip, take, orderBy } = createPaginationQuery(pagination);

  const where: any = { isDeleted: false };

  if (filters.fullName) where.fullName = { contains: filters.fullName, mode: 'insensitive' };
  if (filters.email) where.email = { contains: filters.email, mode: 'insensitive' };
  if (filters.status) where.status = filters.status;
  if (filters.search) {
    where.OR = [
      { fullName: { contains: filters.search, mode: 'insensitive' } },
      { email: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  const [users, total] = await Promise.all([
    database.user.findMany({
      where,
      select: {
        id: true,
        fullName: true,
        email: true,
        status: true,
        role: {
          select: { id: true, name: true },
        },
        createdAt: true,
      },
      skip,
      take,
      orderBy,
    }),
    database.user.count({ where }),
  ]);

  return createPaginationResult(users, total, pagination);
};

// ── Get User by Email ──────────────────────────────────────────────────────────
const getUserByEmail = async (email: string) => {
  return database.user.findFirst({ where: { email } });
};

// ── Update User by ID ──────────────────────────────────────────────────────────
const updateUserById = async (id: string, data: Record<string, unknown>) => {
  return database.user.update({ where: { id }, data });
};
// ── Delete User (Soft Delete) ──────────────────────────────────────────────────
const deleteUserById = async (id: string) => {
  return database.user.update({
    where: { id },
    data: { status: UserStatus.SUSPENDED },
  });
};

// ── Email Helpers ──────────────────────────────────────────────────────────────
const isEmailExists = async (email: string) => {
  const user = await database.user.findUnique({ where: { email }, select: { id: true } });
  return !!user;
};
export const UserRepository = {
  createUser,
  getUserByEmail,
  getUserById,
  getAllUsers,
  updateUserById,
  deleteUserById,
  isEmailExists,
};
