export enum Role {
  USUARIO = 'Usuário',
  OPERADOR = 'Operador',
  ADMIN = 'Administrador',
}


export function mapUserRole(userRole: string): Role {
    switch (userRole) {
      case 'USUARIO': return Role.USUARIO;
      case 'OPERADOR': return Role.OPERADOR;
      case 'ADMIN': return Role.ADMIN;
      default: return Role.USUARIO;
    }
  }
