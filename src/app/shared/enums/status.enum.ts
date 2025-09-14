export enum Status {
  AGUARDANDO = "Aguardando Autorização",
  AUTORIZADA = "Autorizada",
  EXECUCAO = "Em Execução",
  FINALIZADA = "Finalizada",
  CANCELADA = "Cancelada",
  DEFAULT = "Sem Status"
}


export function mapStatus(status: string): Status {
  switch (status) {
    case 'AGUARDANDO':
      return Status.AGUARDANDO;
    case 'AUTORIZADA':
      return Status.AUTORIZADA;
    case 'EXECUCAO':
      return Status.EXECUCAO;
    case 'CANCELADA':
      return Status.CANCELADA;
    default:
      return Status.DEFAULT;
  }
}

export function keyOfStatus(status: string): string{
  switch (status) {
    case Status.AGUARDANDO:
      return 'AGUARDANDO';
    case Status.AUTORIZADA:
      return 'AUTORIZADA';
    case Status.EXECUCAO:
      return 'EXECUCAO';
    case Status.CANCELADA:
      return 'CANCELADA';
    default:
      return Status.DEFAULT;
  }
}
