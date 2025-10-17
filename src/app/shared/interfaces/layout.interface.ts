export interface IMenuItem {
  id: string;
  label: string;
  icon: string;
  route?: string;
  children?: IMenuItem[];
  expanded?: boolean;
  rolesAllowed?:EMenuRoles[];
}

export enum EMenuRoles {
  USUARIO = 'USUARIO',
  OPERADOR = 'OPERADOR',
  ADMIN = 'ADMIN',
}