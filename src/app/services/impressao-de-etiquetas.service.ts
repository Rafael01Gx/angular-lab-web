import { Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import {ElementoQuimico, Remessa} from '../shared/interfaces/laboratorios-externos.interfaces';
import {IOrders} from '../shared/interfaces/orders.interface';

export interface PrintOptions {
  filename?: string;
  format?: 'a4' | 'a3' | 'letter';
  orientation?: 'portrait' | 'landscape';
  margin?: number;
  scale?: number;
  quality?: number;
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
          display: grid;
          grid-template-columns: repeat(3, 8.1cm);
          grid-template-rows: repeat(4, 4.5cm);
          gap: 0.2cm;
        ">
      `;

      // Criar as etiquetas para esta página
      for (let i = 0; i < amostrasNaPagina.length; i++) {
        const amostra = amostrasNaPagina[i];

        const materiaPrima =
          amostra.amostraName +
          (amostra.subIdentificacao ? ` ${amostra.subIdentificacao}` : '');

        const periodo = amostra.dataInicio !== amostra.dataFim
          ? `${this.dateToBr(amostra.dataInicio)} á ${this.dateToBr(amostra.dataFim)}`
          : this.dateToBr(amostra.dataInicio);

        htmlCompleto += `
          <div class="etiqueta" style="
            width: 8.1cm;
            height: 4.2cm;
            border: 1px solid black;
            box-sizing: border-box;
            padding: 0.1cm;
            display: flex;
            flex-direction: column;
          ">
            <div class="etiqueta-header" style="
              display: flex;
              justify-content: space-between;
              border: 1px solid black;
              border-collapse: collapse;
              height: 1.5cm;
            ">
              <div class="logo" style="
                width: 4cm;
                height: 1.5cm;
                display: flex;
                align-items: center;
                padding: 0.1cm;
                border-right: 1px solid black;
                border-collapse: collapse;
              ">
                <img src="/img/arcelor.png" alt="ArcelorMittal" style="max-width: 80%; max-height: 80%;">
              </div>
              <div class="titulo" style="
                display: flex;
                flex-direction: column;
                font-weight: 500;
                width: 3.9cm;
                height: 100%;
              ">
                <div style="
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-size: 11px;
                  flex-grow: 1;
                  border-bottom: 1px solid black;
                  border-collapse: collapse;
                  text-align: center;
                  width: 100%;
                ">
                  <strong>ETIQUETA DE AMOSTRA</strong>
                </div>
                <div style="
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-size: 10px;
                  text-align: center;
                  flex-grow: 2;
                  width: 100%;
                ">
                  <span>GERÊNCIA: GAPSI</span>
                </div>
              </div>
            </div>

            <div style="
              margin-top: 0.1cm;
              font-size: 10px;
              border: 1px solid black;
              display: flex;
              flex-direction: column;
              flex-grow: 1;
            ">
              <div style="
                height: 0.5cm;
                border-bottom: 1px solid black;
                display: flex;
                align-items: center;
              ">
                <div style="
                  margin-left: 4px;
                  display: flex;
                  align-items: center;
                  width: 100%;
                  font-weight: 500;
                ">
                  DESTINO: ${destino}
                </div>
              </div>

              <div style="
                height: 0.5cm;
                border-bottom: 1px solid black;
                display: flex;
                align-items: center;
              ">
                <div style="
                  margin-left: 4px;
                  display: flex;
                  align-items: center;
                  width: auto;
                  font-weight: 500;
                ">
                  MATÉRIA-PRIMA: ${materiaPrima}
                </div>
              </div>

              <div style="
                height: 0.5cm;
                border-bottom: 1px solid black;
                display: flex;
                align-items: center;
              ">
                <div style="
                  margin-left: 4px;
                  display: flex;
                  align-items: center;
                  width: auto;
                  font-weight: 500;
                ">
                  PERÍODO: ${periodo}
                </div>
              </div>

              <div style="
                height: 0.5cm;
                display: flex;
                align-items: center;
              ">
                <div style="
                  margin-left: 4px;
                  display: flex;
                  align-items: center;
                  width: auto;
                  font-weight: 500;
                ">
                  ENSAIO QUÍMICO:
                </div>
                <div style="
                  margin-left: auto;
                  margin-right: 0.1cm;
                  display: flex;
                  align-items: center;
                ">
                  <span style="margin-right: 1cm;">( ) NÃO</span>
                  <span>(X) SIM</span>
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
      pdf.addImage(imgData, 'JPEG', 0, 0, 29.7, 21);

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
        <html lang="pt-BR">
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
              .pagina-etiquetas {
                page-break-after: always;
              }
              .pagina-etiquetas:last-child {
                page-break-after: avoid;
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

        <div style="margin-top: 30px; font-size: 12px; color: #666;">
          <p><strong>Gerado em: ${new Date().toLocaleString('pt-BR')}</strong></p>
          <p><strong>Total de amostras: ${remessa.amostras.length}</strong></p>
          <p><strong>Elementos Solicitados*:</strong> ${elementosQuimicos.map(e => e.simbolo + ` (${e.elementName})`).join(', ')}</p>
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

  private etiqueta_de_amostras_ordem(ordem:IOrders):string{
    let paginasHtml = '';
    for (let item in ordem.amostras) {
      const amostra = ordem.amostras[item];
      const solicitante = ordem.solicitante;
      const numeroOs = ordem.id;
      const observacao = ordem.observacao;
      const ensaios = amostra.ensaiosSolicitados.map((ensaios)=> ensaios.tipo);

      const paginaHtml = `

        <div class="page">
          <div class="subpage">
            <div class="header">
              <div class="header-text">
                <h1>N.º OS ${numeroOs}</h1>
              </div>
              <div class="header-right">
                <img height="24px" src="./img/arcelorWhite.png" alt="logo Arcelor" />
              </div>
            </div>

            <div class="body">
              <fieldset class="container">
                <div class="title">
                  <p>Amostra</p>
                </div>
                <div class="row">
                  <span>Identificação:</span>
                  <p>${amostra.nomeAmostra}</p>
                </div>
                <div class="row">
                  <span>Data:</span>
                  <p>${amostra.dataAmostra}</p>
                </div>
                <div class="row">
                  <span>Ensaios:</span>
                  <p>${ensaios.join(", ")}</p>
                </div>
                <div class="row">
                  <span>Observações:</span>
                  <p>${observacao || "s/ obs."}</p>
                </div>
              </fieldset>

              <fieldset class="container">
                <div class="title">
                  <p>Informações do Solicitante</p>
                </div>
                <div class="solicitante-info">
                  <div class="info-item">
                    <span>Nome:</span>
                    <p>${solicitante?.name}</p>
                  </div>
                  <div class="info-item">
                    <span>Área:</span>
                    <p>${solicitante?.area}</p>
                  </div>
                  <div class="info-item">
                    <span>Email:</span>
                    <p>${solicitante?.email}</p>
                  </div>
                  <div class="info-item">
                    <span>Contato:</span>
                    <p>${solicitante?.phone}</p>
                  </div>
                </div>
              </fieldset>
            </div>
          </div>
        </div>
      `;

      paginasHtml += paginaHtml;
    }
    const css= ` <style>
        body {
          margin: 0;
          padding: 0;
          background-color: #f7f9fc;
          font-family: 'Roboto', sans-serif;
          color: #2d3436;
          overflow: auto !important;
        }

        .page {
          width: 29.7cm;
          height: 21cm;
          margin: auto auto 20px;
          border: 1px solid #dfe6e9;
          border-radius: 12px;
          background-color: #ffffff;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
          display: flex;
          flex-direction: column;
        }

        .subpage {
          display: flex;
          flex-direction: column;
          flex-grow: 1;
          padding: 25px;

        }

        .header {
        position: relative;
          display: flex;
          justify-content: center;
          align-items: center;
          background-color: #1e3799;
          padding: 20px 25px;
          color: white;
          border-radius: 12px 12px 0 0;
        }
          .header-text{
        position: absolute;
         top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          }
        .header-right{
        margin-left:auto;}
        .header div img {
          height: 50px;
        }

        .header h1 {
          font-size: 24px;
          font-weight: 600;
          text-transform: uppercase;
        }

        .body {
          flex-grow: 1;
          padding: 10px;
        }

        .container {
          margin-bottom: 15px;
          border: 1px solid #1e3799;
          border-radius: 12px;
          padding: 10px;
        }

        .title {
          text-align: center;
          background-color: #4a69bd;
          color: white;
          padding: 2px;
          font-size: 16px;
          font-weight: 700;
          border-radius: 10px 10px 0 0;
          text-transform: uppercase;
          margin-bottom: 10px;
          p{
          margin:0;}
        }

        .row {
          display: flex;
          align-items: center;
          margin: 2px 0;
        }

        .row span {
          font-weight: bold;
          width: 180px;
          color: #1e3799;
          font-size: 14px;
        }

        .row p {
          flex-grow: 1;
          background-color: #f1f2f6;
          padding: 10px;
          border-radius: 6px;
          border: 1px solid #dcdde1;
          font-size: 14px;
        }

        .solicitante-info {
          display: flex;
          flex-direction: row;
          flex-wrap: wrap;
          gap: 0 20px;
        }

        .info-item {
          display: flex;
          align-items: center;
          width: calc(50% - 12.5px);
        }

        .info-item span {
          font-weight: bold;
          width: 140px;
          color: #1e3799;
          font-size: 14px;
        }

        .info-item p {
          flex-grow: 1;
          background-color: #f1f2f6;
          padding: 10px;
          border-radius: 6px;
          border: 1px solid #dcdde1;
          font-size: 14px;
        }

        @page {
          size: A4 landscape;
          margin: 0;
        }

        @media print {
          body, html {
            height: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: hidden !important;
            background-color: #ffffff !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }

          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
            font-size: calc(16px * 0.9) !important;
            line-height: 1.5 !important;
          }

          .page {
            width: 100% !important;
            height: 100% !important;
            max-height: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: hidden !important;
            page-break-inside: avoid !important;
            box-shadow: none !important;
            border: 1px solid #dfe6e9 !important;
          }

          .subpage {
            height: 100% !important;
            max-height: 100% !important;
            overflow: hidden !important;

          }

          .container {
            page-break-inside: avoid !important;
          }

          .header {
            background-color: #1e3799 !important;
            color: white !important;
          }

          .title {
            background-color: #4a69bd !important;
            color: white !important;
          }

          .row p,
          .info-item p {
            background-color: #f1f2f6 !important;
            border: 1px solid #dcdde1 !important;
          }

          @page {
            size: A4 landscape;
            margin: 0mm !important;
          }
        }
      </style>`
    const pagCompleta = ` <div class="book"> ${paginasHtml} </div> ${css}`
    return pagCompleta;
  }

  async gerarEtiquetaAmostrasOS(ordem: IOrders
  ) {
    try {
      const htmlCompleto = this.etiqueta_de_amostras_ordem(ordem);
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = htmlCompleto;

      // configurações importantes para renderização
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.width = '297mm';
      tempDiv.style.height = '210mm';
      tempDiv.style.overflow = 'visible';

      document.body.appendChild(tempDiv);

      const paginas = tempDiv.querySelectorAll('.page') as NodeListOf<HTMLElement>;

      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      const imgWidth = 297;
      const imgHeight = 210;

      for (let i = 0; i < paginas.length; i++) {
        if (i > 0) {
          pdf.addPage();
        }

        const canvas = await html2canvas(paginas[i], {
          scale: 2, // escala de qualidade
          useCORS: true,
          logging: false,
          width: imgWidth * 3.78, // conversão de mm para pixels
          height: imgHeight * 3.78, // conversão de mm para pixels
          windowWidth: imgWidth * 3.78,
          windowHeight: imgHeight * 3.78,

          // configurações para melhorar a renderização
          removeContainer: false,
          allowTaint: true,
          proxy: undefined
        });

        const imgData = canvas.toDataURL('image/jpeg', 1.0);
        pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight, undefined, 'FAST');
      }

      pdf.save(`Etiqueta_${ordem.numeroOs}.pdf`);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
    } finally {
      const tempDiv = document.querySelector('div[style*="absolute"]');
      if (tempDiv) {
        document.body.removeChild(tempDiv);
      }
    }
  }
}
