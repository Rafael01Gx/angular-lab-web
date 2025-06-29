import { Role } from "../enums/roles.enum";

export interface UserPayload  {
  sub: string;
  name: string;
  email: string;
  role: Role;
  iat?: number;
  exp?: number;
  iss?: string;
  aud?: string;
};

export interface IUserlogin {
  email: string;
  password: string;
}