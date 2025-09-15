import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface PrintOptions {
  filename?: string;
  format?: 'a4' | 'a3' | 'letter';
  orientation?: 'portrait' | 'landscape';
  margin?: number;
  scale?: number;
  quality?: number;
}

@Injectable({
  providedIn: 'root'
})
export class PrintService {

  /**
   * Gera PDF a partir de conteúdo HTML
   */
  async generatePDFFromHTML(
    htmlContent: string,
    options: PrintOptions = {}
  ): Promise<void> {

    const defaultOptions: PrintOptions = {
      filename: `documento-${Date.now()}.pdf`,
      format: 'a4',
      orientation: 'portrait',
      margin: 20,
      scale: 2,
      quality: 0.95
    };

    const config = { ...defaultOptions, ...options };

    try {
      // Criar elemento temporário
      const tempDiv = this.createTempElement(htmlContent);

      // Aguardar renderização
      await this.waitForRender();

      // Capturar como canvas
      const canvas = await this.htmlToCanvas(tempDiv, config);

      // Gerar PDF
      await this.canvasToPDF(canvas, config);

      // Limpar
      this.cleanupTempElement(tempDiv);

    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      throw error;
    }
  }

  /**
   * Gera PDF a partir de um elemento DOM
   */
  async generatePDFFromElement(
    element: HTMLElement,
    options: PrintOptions = {}
  ): Promise<void> {

    const defaultOptions: PrintOptions = {
      filename: `documento-${Date.now()}.pdf`,
      format: 'a4',
      orientation: 'portrait',
      scale: 2,
      quality: 0.95
    };

    const config = { ...defaultOptions, ...options };

    try {
      const canvas = await this.htmlToCanvas(element, config);
      await this.canvasToPDF(canvas, config);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      throw error;
    }
  }

  /**
   * Imprime via browser (window.print)
   */
  printViaBrowser(htmlContent?: string): void {
    if (htmlContent) {
      // Criar nova janela com o conteúdo
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>Impressão</title>
            <meta charset="utf-8">
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                margin: 0;
                padding: 20px;
                color: #111;
                line-height: 1.5;
              }
              .bg-gray-50 { background-color: #f9fafb !important; }
              .bg-blue-50 { background-color: #eff6ff !important; }
              .bg-yellow-50 { background-color: #fefce8 !important; }
              .text-gray-900 { color: #111827 !important; }
              .text-gray-700 { color: #374151 !important; }
              .text-gray-600 { color: #4b5563 !important; }
              .text-blue-900 { color: #1e3a8a !important; }
              .text-blue-700 { color: #1d4ed8 !important; }
              .rounded-lg { border-radius: 8px; }
              .rounded-md { border-radius: 6px; }
              .p-4 { padding: 16px; }
              .p-6 { padding: 24px; }
              .px-3 { padding-left: 12px; padding-right: 12px; }
              .py-2 { padding-top: 8px; padding-bottom: 8px; }
              .mb-2 { margin-bottom: 8px; }
              .mb-4 { margin-bottom: 16px; }
              .mb-6 { margin-bottom: 24px; }
              .mt-3 { margin-top: 12px; }
              .grid { display: grid; }
              .grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
              .gap-2 { gap: 8px; }
              .gap-4 { gap: 16px; }
              .space-y-4 > * + * { margin-top: 16px; }
              .space-y-6 > * + * { margin-top: 24px; }
              .border { border: 1px solid #e5e7eb; }
              .border-b { border-bottom: 1px solid #e5e7eb; }
              .border-gray-200 { border-color: #e5e7eb; }
              .border-blue-200 { border-color: #c3ddfd; }
              .border-yellow-200 { border-color: #fde68a; }
              .pb-4 { padding-bottom: 16px; }
              .font-bold { font-weight: 700; }
              .font-semibold { font-weight: 600; }
              .font-medium { font-weight: 500; }
              .text-2xl { font-size: 24px; }
              .text-lg { font-size: 18px; }
              .text-sm { font-size: 14px; }
              .text-xs { font-size: 12px; }
              .text-center { text-align: center; }
              @media print {
                body { margin: 0; padding: 15px; }
                .page-break { page-break-before: always; }
                * { -webkit-print-color-adjust: exact !important; }
              }
            </style>
          </head>
          <body>
            ${htmlContent}
          </body>
          </html>
        `);
        printWindow.document.close();

        // Aguardar carregamento e imprimir
        printWindow.onload = () => {
          printWindow.print();
          printWindow.close();
        };
      }
    } else {
      // Imprimir página atual
      window.print();
    }
  }

  private createTempElement(htmlContent: string): HTMLElement {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;

    // Estilos para renderização adequada
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.style.top = '0';
    tempDiv.style.width = '800px';
    tempDiv.style.padding = '20px';
    tempDiv.style.backgroundColor = 'white';
    tempDiv.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    tempDiv.style.fontSize = '14px';
    tempDiv.style.lineHeight = '1.5';
    tempDiv.style.color = '#111827';

    document.body.appendChild(tempDiv);
    return tempDiv;
  }

  private cleanupTempElement(element: HTMLElement): void {
    if (element && element.parentNode) {
      element.parentNode.removeChild(element);
    }
  }

  private waitForRender(ms: number = 100): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async htmlToCanvas(element: HTMLElement, options: PrintOptions): Promise<HTMLCanvasElement> {

    return await html2canvas(element, {
      scale: options.scale || 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      width: element.scrollWidth,
      height: element.scrollHeight,
      logging: false,
      imageTimeout: 0,
      removeContainer: true
    });

  }

  private async canvasToPDF(canvas: HTMLCanvasElement, options: PrintOptions): Promise<void> {

    const pdf = new jsPDF({
      orientation: options.orientation || 'portrait',
      unit: 'mm',
      format: options.format || 'a4'
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const margin = options.margin || 20;

    const availableWidth = pdfWidth - (margin * 2);
    const availableHeight = pdfHeight - (margin * 2);

    const imgWidth = canvas.width;
    const imgHeight = canvas.height;

    // Calcular escala para caber na página
    const scaleX = availableWidth / (imgWidth * 0.264583); // px to mm
    const scaleY = availableHeight / (imgHeight * 0.264583);
    const scale = Math.min(scaleX, scaleY);

    const finalWidth = (imgWidth * 0.264583) * scale;
    const finalHeight = (imgHeight * 0.264583) * scale;

    // Centralizar na página
    const x = margin + (availableWidth - finalWidth) / 2;
    const y = margin + (availableHeight - finalHeight) / 2;

    const imgData = canvas.toDataURL('image/png', options.quality || 0.95);

    pdf.addImage(imgData, 'PNG', x, y, finalWidth, finalHeight);
    pdf.save(options.filename || 'documento.pdf');
  }

  /**
   * Método auxiliar para preparar elemento para impressão
   */
  prepareElementForPrint(element: HTMLElement): void {
    // Adicionar classe de impressão
    element.classList.add('print-mode');

    // Forçar renderização de cores em backgrounds
    element.style.setProperty('-webkit-print-color-adjust', 'exact');
    element.style.setProperty('color-adjust', 'exact');
    element.style.setProperty('print-color-adjust', 'exact');

    // Garantir que fontes sejam renderizadas
    const style = document.createElement('style');
    style.textContent = `
      @media print {
        * {
          -webkit-print-color-adjust: exact !important;
          color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
      }
    `;
    document.head.appendChild(style);

    // Remover após impressão
    setTimeout(() => {
      element.classList.remove('print-mode');
      document.head.removeChild(style);
    }, 1000);
  }
}
