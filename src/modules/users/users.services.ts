import { StatusCodes } from 'http-status-codes';
import bcrypt from 'bcryptjs';
import ApiError from '../../utils/ApiError';
import { UserRepository } from './users.repository';
import { ICreateUserPayload } from './users.interface';

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

export const UserService = {
  createUser,
};
