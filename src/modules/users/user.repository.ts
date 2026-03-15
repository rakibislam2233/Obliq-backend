// --Create User
import { database } from '../../config/database.config';
import { ICreateUserPayload, IUser } from './users.interface';

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


// ── Get User by Email ──────────────────────────────────────────────────────────
const getUserByEmail = async (email: string) => {
  return database.user.findFirst({ where: { email } });
};

// ── Update User by ID ──────────────────────────────────────────────────────────
const updateUserById = async (id: string, data: Record<string, unknown>) => {
  return database.user.update({ where: { id }, data });
};
export const UserRepository = {
  createUser,
  getUserByEmail,
  updateUserById,
};
