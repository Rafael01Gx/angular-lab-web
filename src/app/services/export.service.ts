import { Injectable } from '@angular/core';
import { saveAs } from 'file-saver';
import { Workbook } from 'exceljs';
import { AgendamentoSemanal } from './agenda.service';

@Injectable({
  providedIn: 'root',
})
export class ExportService {
  /**
   * Exporta para CSV
   */
  exportarCSV(agendamentos: AgendamentoSemanal[], filename = 'agendamentos.csv') {
    const headers = ['Semana', 'Data Início', 'Data Fim', 'Tipo', 'Classe', 'Quantidade'];

    const rows = agendamentos.flatMap((sem) =>
      sem.tiposAnalise.map((tipo) => [
        sem.semana,
        sem.dataInicio,
        sem.dataFim,
        tipo.tipo,
        tipo.classe,
        tipo.quantidade,
      ])
    );

    const csv = [headers.join(','), ...rows.map((r) => r.map((c) => `"${c}"`).join(','))].join('\n');
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
   * ✅ Exporta para Excel (com cores, formatação e colunas ajustadas)
   */
  async exportarExcel(agendamentos: AgendamentoSemanal[], filename = 'agendamentos.xlsx') {
    const workbook = new Workbook();
    const sheet = workbook.addWorksheet('Agendamentos Semanais');

    // Cabeçalhos
    const headers = [
      'Semana',
      'Data Início',
      'Data Fim',
      'Total Amostras',
      'Tipo Análise',
      'Classe',
      'Quantidade',
      'Amostras',
    ];

    // Configura colunas
    sheet.columns = headers.map((header) => ({
      header,
      key: header,
      width: Math.max(header.length, 18),
    }));

    // Adiciona linhas
    agendamentos.forEach((sem) => {
      sem.tiposAnalise.forEach((tipo) => {
        sheet.addRow({
          'Semana': sem.semana,
          'Data Início': new Date(sem.dataInicio).toLocaleDateString('pt-BR'),
          'Data Fim': new Date(sem.dataFim).toLocaleDateString('pt-BR'),
          'Total Amostras': sem.totalAmostras,
          'Tipo Análise': tipo.tipo,
          'Classe': tipo.classe,
          'Quantidade': tipo.quantidade,
          'Amostras': tipo.amostras?.map((a) => a.nomeAmostra).join('; ') || '',
        });
      });
    });

    // 🎨 Estilo do cabeçalho
    const headerRow = sheet.getRow(1);
    headerRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFF' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '2563EB' }, // azul Tailwind (blue-600)
      };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = {
        top: { style: 'thin', color: { argb: 'CCCCCC' } },
        bottom: { style: 'thin', color: { argb: 'CCCCCC' } },
      };
    });

    // 🔢 Formata números
    sheet.eachRow((row, i) => {
      if (i === 1) return;
      const qtdCell = row.getCell('Quantidade');
      const totalCell = row.getCell('Total Amostras');

      if (!isNaN(Number(qtdCell.value))) qtdCell.numFmt = '0';
      if (!isNaN(Number(totalCell.value))) totalCell.numFmt = '0';
    });

    // 🧭 Centraliza algumas colunas
    ['Semana', 'Tipo Análise', 'Classe'].forEach((colKey) => {
      const col = sheet.getColumn(colKey);
      col.alignment = { horizontal: 'center' };
    });

    // 💾 Gera e baixa arquivo
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), filename);
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

        ${agendamentos
          .map(
            (sem) => `
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
              ${sem.tiposAnalise
                .map(
                  (tipo) => `
                <tr>
                  <td>${tipo.tipo}</td>
                  <td>${tipo.classe}</td>
                  <td>${tipo.quantidade}</td>
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>
        `
          )
          .join('')}
      </body>
      </html>
    `;

    this.download(html, filename, 'text/html');
  }

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
