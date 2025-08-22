import { Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import {Remessa} from '../shared/interfaces/laboratorios-externos.interfaces';

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
    const destino = remessa.destino;
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
        const top = row * 4 + 'cm'; // 3.8cm de altura + espaço entre etiquetas

        const materiaPrima =
          amostra.amostraName +
          (amostra.subIdentificacao ? ` (${amostra.subIdentificacao})` : '');
        const periodo = `${this.dateToBr(
          amostra.dataInicio
        )} á ${this.dateToBr(amostra.dataFim)}`;

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
                <img src="/img/arcelormittal-logo.png" alt="ArcelorMittal" style="max-width: 80%; max-height: 80%;">
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

  dateToBr(data: string): string | null {
    const [ ano, mes, dia ] = data.split('-');
    const dataFormatada = `${dia}/${mes}/${ano}`
    return dataFormatada;
  }
}
