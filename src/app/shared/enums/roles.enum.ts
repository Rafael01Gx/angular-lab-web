export enum Role {
  USUARIO = 'Usuário',
  OPERADOR = 'Operador',
  ADMIN = 'Administrador',
}

export const ROLE_HIERARCHY: Record<Role, Role[]> = {
  [Role.ADMIN]: [Role.ADMIN, Role.OPERADOR, Role.USUARIO],
  [Role.OPERADOR]: [Role.OPERADOR],
  [Role.USUARIO]: [Role.USUARIO],
};

export function mapUserRole(userRole: string): Role {
  switch (userRole) {
    case 'USUARIO': return Role.USUARIO;
    case 'OPERADOR': return Role.OPERADOR;
    case 'ADMIN': return Role.ADMIN;
    default: return Role.USUARIO;
  }
}
