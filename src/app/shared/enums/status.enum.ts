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
