export function getPrazoInicioFim(prazo: string|null|undefined): string {
  if (!prazo || prazo?.length < 12) return "Aguardando...";
  const datainicio = new Date(`${prazo.split(' - ')[0]}T00:00:00`);
  const datafim = new Date(`${prazo.split(' - ')[1]}T00:00:00`);
  const inicio = datainicio.toLocaleDateString();
  const fim = datafim.toLocaleDateString();
  return `${inicio} - ${fim}`;
}
