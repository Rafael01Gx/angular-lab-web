import { Injectable } from '@angular/core';
import { AgendamentoSemanal } from './agenda.service';

@Injectable({
  providedIn: 'root'
})
export class ExportService {
  
  /**
   * Exporta para CSV
   */
  exportarCSV(agendamentos: AgendamentoSemanal[], filename = 'agendamentos.csv') {
    const headers = ['Semana', 'Data Início', 'Data Fim', 'Tipo', 'Classe', 'Quantidade'];
    
    const rows = agendamentos.flatMap(sem =>
      sem.tiposAnalise.map(tipo => [
        sem.semana,
        sem.dataInicio,
        sem.dataFim,
        tipo.tipo,
        tipo.classe,
        tipo.quantidade
      ])
    );

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    this.download(csv, filename, 'text/csv');
  }

  /**
   * Exporta para JSON
   */
  exportarJSON(agendamentos: AgendamentoSemanal[], filename = 'agendamentos.json') {
    const json = JSON.stringify(agendamentos, null, 2);
    this.download(json, filename, 'application/json');
  }

  /**
   * Exporta para Excel (formato CSV que Excel reconhece)
   */
  exportarExcel(agendamentos: AgendamentoSemanal[], filename = 'agendamentos.xlsx') {
    // Criar uma planilha mais completa
    const headers = [
      'Semana',
      'Data Início',
      'Data Fim',
      'Total Amostras',
      'Tipo Análise',
      'Classe',
      'Quantidade',
      'Amostras'
    ];

    const rows = agendamentos.flatMap(sem =>
      sem.tiposAnalise.map(tipo => [
        sem.semana,
        sem.dataInicio,
        sem.dataFim,
        sem.totalAmostras,
        tipo.tipo,
        tipo.classe,
        tipo.quantidade,
        tipo.amostras.map(a => a.nomeAmostra).join('; ')
      ])
    );

    // UTF-8 BOM para Excel reconhecer acentos
    const csv = '\uFEFF' + [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    this.download(csv, filename, 'text/csv;charset=utf-8');
  }

  /**
   * Gera relatório em HTML
   */
  exportarHTML(agendamentos: AgendamentoSemanal[], filename = 'relatorio.html') {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Relatório de Agendamentos</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #2563eb; }
          table { border-collapse: collapse; width: 100%; margin: 20px 0; }
          th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          th { background-color: #2563eb; color: white; }
          tr:nth-child(even) { background-color: #f8fafc; }
          .summary { background-color: #eff6ff; padding: 15px; border-radius: 8px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <h1>Relatório de Agendamentos de Ensaios</h1>
        <div class="summary">
          <p><strong>Data:</strong> ${new Date().toLocaleDateString('pt-BR')}</p>
          <p><strong>Total de Semanas:</strong> ${agendamentos.length}</p>
          <p><strong>Total de Amostras:</strong> ${agendamentos.reduce((acc, sem) => acc + sem.totalAmostras, 0)}</p>
        </div>
        
        ${agendamentos.map(sem => `
          <h2>${sem.semana}</h2>
          <p><strong>Período:</strong> ${sem.dataInicio} até ${sem.dataFim}</p>
          <p><strong>Total de Amostras:</strong> ${sem.totalAmostras}</p>
          <table>
            <thead>
              <tr>
                <th>Tipo de Análise</th>
                <th>Classe</th>
                <th>Quantidade</th>
              </tr>
            </thead>
            <tbody>
              ${sem.tiposAnalise.map(tipo => `
                <tr>
                  <td>${tipo.tipo}</td>
                  <td>${tipo.classe}</td>
                  <td>${tipo.quantidade}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `).join('')}
      </body>
      </html>
    `;

    this.download(html, filename, 'text/html');
  }

  /**
   * Função auxiliar para download
   */
  private download(content: string, filename: string, mimeType: string) {
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  }
}

// no componente
// export class AgendamentoDashboardComponent {
//   private exportService = inject(ExportService);

//   exportar(formato: 'csv' | 'json' | 'excel' | 'html') {
//     const dados = this.agendamentos();
    
//     switch (formato) {
//       case 'csv':
//         this.exportService.exportarCSV(dados);
//         break;
//       case 'json':
//         this.exportService.exportarJSON(dados);
//         break;
//       case 'excel':
//         this.exportService.exportarExcel(dados);
//         break;
//       case 'html':
//         this.exportService.exportarHTML(dados);
//         break;
//     }
//   }
// }