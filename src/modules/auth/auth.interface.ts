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


export 