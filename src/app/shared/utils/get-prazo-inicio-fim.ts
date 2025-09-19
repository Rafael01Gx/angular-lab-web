export function getPrazoInicioFim(prazo: string|null|undefined): string {
  if (!prazo || prazo?.length < 12) return "Aguardando...";
  const inicio = new Date(prazo.split(' - ')[0]).toLocaleDateString();
  const fim = new Date(prazo.split(' - ')[1]).toLocaleDateString();

  return `${inicio} - ${fim}`;
}
