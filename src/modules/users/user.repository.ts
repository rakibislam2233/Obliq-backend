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

export const UserRepository = {
  createUser,
};
