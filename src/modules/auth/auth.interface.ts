export interface IRegisterPayload {
  fullName: string;
  email: string;
  password: string;
  roleId: string;
}

export interface ILoginPayload {
  email: string;
  password: string;
}

export interface ILogoutPayload {
  userId: string;
  accessToken: string;
}

export interface IForgotPasswordPayload {
  email: string;
}

export interface IResetPasswordPayload {
  token: string;
  newPassword: string;
}

export interface IChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}
