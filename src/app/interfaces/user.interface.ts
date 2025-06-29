import { Role } from "../enums/roles.enum";

export interface IUser {
  id: string;
  name: string;
  email: string;
  password?: string;
  phone?: string;
  area?: string;
  funcao?: string;
  authorization?: boolean;
  role?: Role;
}
