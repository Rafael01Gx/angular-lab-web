import { Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import {ElementoQuimico, Remessa} from '../shared/interfaces/laboratorios-externos.interfaces';

interface Periodo {
  inicio: string;
  fim: string;
}

@Injectable({
  providedIn: 'root',
})
export class EtiquetasService {
  constructor() {}
  /**
   * Gera o HTML para impressão das etiquetas de amostras
   * @param remessa Objeto remessa contendo as amostras
   * @param laboratorioNome Nome do laboratório de destino
   * @returns HTML String para renderização das etiquetas
   */
  gerarHtmlEtiquetas(remessa: Remessa): string {
    // Calcular quantas páginas serão necessárias

    const totalAmostras = remessa.amostras.length;
    const destino = remessa.destino?.nome ?? '';
    const etiquetasPorPagina = 12;
    const totalPaginas = Math.ceil(totalAmostras / etiquetasPorPagina);

    let htmlCompleto = '';

    // Para cada página
    for (let pagina = 0; pagina < totalPaginas; pagina++) {
      const inicioIndice = pagina * etiquetasPorPagina;
      const fimIndice = Math.min(
        (pagina + 1) * etiquetasPorPagina,
        totalAmostras
      );
      const amostrasNaPagina = remessa.amostras.slice(inicioIndice, fimIndice);

      // Iniciar uma nova página
      htmlCompleto += `
        <div class="pagina-etiquetas" style="
          width: 29.7cm;
          height: 21cm;
          position: relative;
          page-break-after: always;
          padding: 1cm;
          box-sizing: border-box;
        ">
      `;

      // Criar as etiquetas para esta página
      for (let i = 0; i < amostrasNaPagina.length; i++) {
        const amostra = amostrasNaPagina[i];
        const row = Math.floor(i / 3);
        const col = i % 3;

        // Posicionar a etiqueta na grade 3x4
        const left = col * 8.3 + 'cm'; // 8.1cm de largura + espaço entre etiquetas
        const top = row * 4.5 + 'cm'; // 3.8cm de altura + espaço entre etiquetas

        const materiaPrima =
          amostra.amostraName +
          (amostra.subIdentificacao ? ` (${amostra.subIdentificacao})` : '');
        const periodo =amostra.dataInicio !== amostra.dataFim ? `${this.dateToBr(
          amostra.dataInicio
        )} á ${this.dateToBr(amostra.dataFim)}`: this.dateToBr(amostra.dataInicio) ;

        htmlCompleto += `
          <div class="etiqueta" style="
            position: absolute;
            left: ${left};
            top: ${top};
            width: 8.1cm;
            border-collapse: collapse;
            border: 1px solid black;
            box-sizing: border-box;
            padding: 0.1cm;
            margin:1cm;
          ">
            <div class="etiqueta-header" style="display: flex; justify-content: space-between; border: 1px solid black;border-collapse: collapse;">
              <div class="logo" style="width: 4cm; height: 1.5cm; display: flex; align-items: center; padding: 0.1cm; border: 1px solid black;border-collapse: collapse;">
                <img src="/img/arcelor.png" alt="ArcelorMittal" style="max-width: 80%; max-height: 80%;">
              </div>
              <div class="titulo" style="
                display: flex;
                flex-direction: column;
                font-weight: 500;
                width: 3.9cm;


              ">

                <div style="display:flex;align-items:center;justify-content: center;font-size: 11px;flex-grow:1;border-bottom:1px solid black; border-collapse: collapse;text-align: center; width:100% ;heigth:100%;"><strong >ETIQUETA DE AMOSTRA</strong></div>
                <div style="display:flex;align-items:center;justify-content: center;font-size: 10px;text-align: center;flex-grow:2; ; width:100%;heigth:100%;"><span>GERÊNCIA: GAPSI</span></div>

              </div>
            </div>


            <div style="margin-top:0.1cm;font-size:10px; border: 1px solid black; display:flex; flex-direction: column; height:2cm;">
              <div style="height:0.5cm;border-bottom: 1px solid black; display: flex;">
                <div style="margin-left:4px;display:flex;align-items:center;width: 100%;font-weight: 500;">DESTINO: ${destino}</div>

              </div>

              <div style="height:0.5cm; border-bottom: 1px solid black; display: flex;">
                <div style="margin-left:4px;display:flex;align-items:center;width: auto; font-weight: 500;">MATÉRIA-PRIMA: ${materiaPrima}</div>

              </div>

              <div style="height:0.5cm;border-bottom: 1px solid black; display: flex;">
                <div style="margin-left:4px;display:flex;align-items:center;width: auto; font-weight: 500;">PERÍODO: ${periodo}</div>

              </div>

              <div style="height:0.5cm;display: flex;">
                <div style="margin-left:4px;display:flex;align-items:center;width: auto; font-weight: 500;">ENSAIO QUÍMICO: </div>
                <div style=" margin-left:auto;margin-right:0.1cm;display:flex;align-items:center;">
                  <span style=" margin-right:1cm;">( ) NÃO </span>
                  <span>(X) SIM </span>
                </div>
              </div>
</div>
            </div>
          </div>
        `;
      }

      // Fechar a div da página
      htmlCompleto += '</div>';
    }

    return htmlCompleto;
  }

  /**
   * Gera e imprime as etiquetas para uma remessa
   * @param remessa Dados da remessa
   * @param laboratorioNome Nome do laboratório de destino
   */
  imprimirEtiquetas(remessa: Remessa): void {
    // Criar um elemento temporário para renderizar as etiquetas
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = this.gerarHtmlEtiquetas(remessa);
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    document.body.appendChild(tempDiv);

    // Usar html2canvas e jsPDF para gerar o PDF
    const paginas = tempDiv.querySelectorAll('.pagina-etiquetas');
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'cm',
      format: 'a4',

    });

    // Converter cada página para canvas e adicionar ao PDF
    const processarPagina = async (index: number) => {
      if (index >= paginas.length) {
        // Todas as páginas foram processadas, salvar o PDF
        pdf.save(`etiquetas-remessa-${remessa.id}.pdf`);
        document.body.removeChild(tempDiv);
        return;
      }

      const pagina = paginas[index] as HTMLElement;
      const canvas = await html2canvas(pagina, {
        scale: 2, // Maior qualidade
        useCORS: true,
        logging: false,

      });

      // Se não for a primeira página, adicionar uma nova
      if (index > 0) {
        pdf.addPage();
      }

      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      pdf.addImage(imgData, 'JPEG', 10, 10, 29.7, 21);

      // Processar a próxima página
      processarPagina(index + 1);
    };

    // Iniciar o processamento das páginas
    processarPagina(0);
  }

  /**
   * Versão alternativa que renderiza as etiquetas diretamente na página
   * para impressão via browser (sem gerar PDF)
   */
  prepararParaImpressaoBrowser(remessa: Remessa): void {
    const conteudoEtiquetas = this.gerarHtmlEtiquetas(remessa);

    // Criar um iframe para a impressão
    const iframeImprimir = document.createElement('iframe');
    iframeImprimir.style.position = 'absolute';
    iframeImprimir.style.top = '-9999px';
    iframeImprimir.style.left = '-9999px';
    iframeImprimir.style.width = '29.7cm';
    iframeImprimir.style.height = '21cm';

    document.body.appendChild(iframeImprimir);

    // Definir o conteúdo do iframe
    const iframeDoc =
      iframeImprimir.contentDocument || iframeImprimir.contentWindow?.document;

    if (iframeDoc) {
      iframeDoc.open();
      iframeDoc.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Etiquetas de Amostras - Remessa ${remessa.id}</title>
          <style>
            @page {
              size: A4 landscape;
              margin: 0;
            }
            body {
              margin: 0;
              padding: 0;
              font-family: Arial, sans-serif;
            }
            @media print {
              body {
                width: 29.7cm;
                height: 21cm;
              }
            }
          </style>
        </head>
        <body>
          ${conteudoEtiquetas}
        </body>
        </html>
      `);
      iframeDoc.close();

      // Esperar que o conteúdo seja carregado antes de imprimir
      setTimeout(() => {
        iframeImprimir.contentWindow?.print();
        // Remover o iframe após um tempo
        setTimeout(() => {
          document.body.removeChild(iframeImprimir);
        }, 1000);
      }, 500);
    }
  }
  // ---------------------------------- Tabela ----------------

  /**
   * Gera uma tabela de análises em PDF formato A4 landscape
   * @param remessa Dados da remessa
   * @param elementosQuimicos Array de elementos químicos disponíveis
   */
  async gerarTabelaAnalisesPDF(remessa: Remessa, elementosQuimicos: ElementoQuimico[]): Promise<void> {
    // Criar um elemento temporário para renderizar a tabela
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = this.gerarHtmlTabelaAnalises(remessa, elementosQuimicos);
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.style.width = '29.7cm';
    document.body.appendChild(tempDiv);

    try {
      // Usar html2canvas para converter em imagem
      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        useCORS: true,
        logging: false,
        width: tempDiv.scrollWidth,
        height: tempDiv.scrollHeight
      });

      // Criar PDF em formato landscape
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'cm',
        format: 'a4'
      });

      const imgData = canvas.toDataURL('image/jpeg', 1.0);

      // Calcular dimensões para ajustar na página
      const pageWidth = 29.7; // A4 landscape width in cm
      const pageHeight = 21; // A4 landscape height in cm
      const margin = 1;

      const availableWidth = pageWidth - (2 * margin);
      const availableHeight = pageHeight - (2 * margin);

      // Adicionar a imagem ao PDF
      pdf.addImage(imgData, 'JPEG', margin, margin, availableWidth, availableHeight);

      // Salvar o PDF
      pdf.save(`tabela-analises-remessa-${remessa.id}.pdf`);

    } finally {
      // Limpar o elemento temporário
      document.body.removeChild(tempDiv);
    }
  }

  /**
   * Gera o HTML da tabela de análises
   * @param remessa Dados da remessa
   * @param elementosQuimicos Array de elementos químicos
   * @returns HTML string da tabela
   */
  private gerarHtmlTabelaAnalises(remessa: Remessa, elementosQuimicos: ElementoQuimico[]): string {
    const destino = remessa.destino?.nome ?? 'Não informado';
    const dataRemessa = this.dateToBr(remessa.data) ?? remessa.data;

    // Cabeçalho do documento
    const cabecalho = `
      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="margin: 0; font-size: 18px; font-weight: bold;">
          DESCRIÇÃO DAS AMOSTRAS
        </h2>
        <p style="margin: 5px 0; font-size: 14px;">
          Destino: ${destino} | Data: ${dataRemessa}
        </p>
      </div>
    `;

    // Cabeçalho da tabela
    let cabecalhoTabela = `
      <tr style="background-color: #f0f0f0;">
        <th style="border: 1px solid #000; padding: 8px; text-align: center; font-weight: bold; min-width: 200px;">
          Identificação das Amostras
        </th>
        <th style="border: 1px solid #000; padding: 8px; text-align: center; font-weight: bold; min-width: 150px;">
          Data das Amostras
        </th>
    `;

    // Adicionar coluna para cada elemento químico
    elementosQuimicos.forEach(elemento => {
      cabecalhoTabela += `
        <th style="border: 1px solid #000; padding: 8px; text-align: center; font-weight: bold; width: 1.2cm; text-orientation: mixed;">
          ${elemento.simbolo}
        </th>
      `;
    });

    cabecalhoTabela += '</tr>';

    // Linhas das amostras
    let linhasAmostras = '';
    remessa.amostras.forEach((amostra, index) => {
      const identificacao = amostra.amostraName +
        (amostra.subIdentificacao ? ` ${amostra.subIdentificacao}` : '');

      const periodo = amostra.dataInicio !== amostra.dataFim ?
        `${this.dateToBr(amostra.dataInicio)} à ${this.dateToBr(amostra.dataFim)}` :
        this.dateToBr(amostra.dataInicio);

      // Cor alternada para as linhas
      const corLinha = index % 2 === 0 ? '#ffffff' : '#f9f9f9';

      linhasAmostras += `
        <tr style="background-color: ${corLinha};">
          <td style="border: 1px solid #000; padding: 8px; text-align: left;">
            ${identificacao}
          </td>
          <td style="border: 1px solid #000; padding: 8px; text-align: center;">
            ${periodo}
          </td>
      `;

      // Para cada elemento químico, verificar se está nos elementos solicitados
      elementosQuimicos.forEach(elemento => {
        const temElemento = amostra.elementosSolicitados.includes(elemento.simbolo);
        linhasAmostras += `
          <td style="border: 1px solid #000; padding: 8px; text-align: center; font-weight: bold; font-size: 14px;">
            ${temElemento ? 'X' : ''}
          </td>
        `;
      });

      linhasAmostras += '</tr>';
    });

    // HTML completo
    const htmlCompleto = `
      <div style="
        width: 29.7cm;
        padding: 1cm;
        font-family: Arial, sans-serif;
        font-size: 12px;
        box-sizing: border-box;
      ">
        ${cabecalho}

        <table style="
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        ">
          ${cabecalhoTabela}
          ${linhasAmostras}
        </table>

        <div style="margin-top: 30px; font-size: 10px; color: #666;">
          <p>Gerado em: ${new Date().toLocaleString('pt-BR')}</p>
          <p>Total de amostras: ${remessa.amostras.length}</p>
          <p>Elementos Solicitados*: ${elementosQuimicos.map(e => e.simbolo + ` (${e.elementName})`).join(', ')}</p>
        </div>
      </div>
    `;

    return htmlCompleto;
  }

  /**
   * Versão alternativa para impressão direta no browser
   * @param remessa Dados da remessa
   * @param elementosQuimicos Array de elementos químicos
   */
  imprimirTabelaAnalisesBrowser(remessa: Remessa, elementosQuimicos: ElementoQuimico[]): void {
    const conteudoTabela = this.gerarHtmlTabelaAnalises(remessa, elementosQuimicos);

    // Criar um iframe para a impressão
    const iframeImprimir = document.createElement('iframe');
    iframeImprimir.style.position = 'absolute';
    iframeImprimir.style.top = '-9999px';
    iframeImprimir.style.left = '-9999px';
    iframeImprimir.style.width = '29.7cm';
    iframeImprimir.style.height = '21cm';

    document.body.appendChild(iframeImprimir);

    const iframeDoc = iframeImprimir.contentDocument || iframeImprimir.contentWindow?.document;

    if (iframeDoc) {
      iframeDoc.open();
      iframeDoc.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Tabela de Análises - Remessa ${remessa.id}</title>
          <style>
            @page {
              size: A4 landscape;
              margin: 1cm;
            }
            body {
              margin: 0;
              padding: 0;
              font-family: Arial, sans-serif;
            }
            @media print {
              body {
                width: 29.7cm;
                height: 21cm;
              }
            }
          </style>
        </head>
        <body>
          ${conteudoTabela}
        </body>
        </html>
      `);
      iframeDoc.close();

      setTimeout(() => {
        iframeImprimir.contentWindow?.print();
        setTimeout(() => {
          document.body.removeChild(iframeImprimir);
        }, 1000);
      }, 500);
    }
  }


  dateToBr(data: string): string | null {
    const [ ano, mes, dia ] = data.split('-');
    const dataFormatada = `${dia}/${mes}/${ano}`
    return dataFormatada;
  }
}
