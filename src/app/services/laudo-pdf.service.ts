import { inject, Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { IAmostra } from '../shared/interfaces/amostra.interface';
import { ParametrosForm } from '../shared/interfaces/form-analise.interface';
import { IUser } from '../shared/interfaces/user.interface';
import { transformarResultado } from '../shared/utils/helpers.functions';
import { getPrazoInicioFim } from '../shared/utils/get-prazo-inicio-fim';


@Injectable({
  providedIn: 'root',
})
export class LaudoAmostraService {


async generateLaudoPdf(amostra: IAmostra) {
  try {
    if(amostra) this.generatePdfFromElement(amostra);
  } catch (error) {
    console.error('Erro ao gerar o PDF:', error);
  }
}
async generatePdfFromElement(
  amostra: IAmostra
): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Tamanho da página A4 em mm
  const PAGE_HEIGHT = 297;
  const PAGE_WIDTH = 210;
  
  // Espaço de margem para quebra de página (1cm = 10mm)
  const PAGE_BREAK_MARGIN = 0;

  doc.setFont('Helvetica');

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = this.createReportTemplate(amostra);
    
    tempDiv.style.width = '210mm';
    tempDiv.style.maxWidth = '210mm';
    tempDiv.style.height = 'auto';
    tempDiv.style.overflow = 'visible';
    tempDiv.style.position = 'relative';
    
    const styleElement = document.createElement('style');
    styleElement.textContent = this.getCssStyles();
    tempDiv.appendChild(styleElement);

    document.body.appendChild(tempDiv);

    try {
      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        useCORS: true,
        logging: false,
        allowTaint: true,
        backgroundColor: '#ffffff',
        height: tempDiv.scrollHeight,
        width: tempDiv.scrollWidth,
        windowWidth: tempDiv.scrollWidth,
        windowHeight: tempDiv.scrollHeight
      });

      document.body.removeChild(tempDiv);

      const imgData = canvas.toDataURL('image/png');
      if (!imgData || imgData === 'data:,') {
        throw new Error('Imagem inválida gerada pelo canvas');
      }

      const imgProps = doc.getImageProperties(imgData);
      const imgWidth = PAGE_WIDTH;
      const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

      // Lógica ajustada para considerar margem de quebra de página
      const pagesNeeded = Math.ceil((imgHeight + PAGE_BREAK_MARGIN) / PAGE_HEIGHT);
      
      for (let page = 0; page < pagesNeeded; page++) {
        if (page > 0) {
          doc.addPage();
        }
        
        // Ajusta a posição da imagem considerando a margem de quebra
        const yOffset = page === 0 
          ? 0 
          : -((page * PAGE_HEIGHT) - PAGE_BREAK_MARGIN);
        
        doc.addImage(
          imgData, 
          'PNG', 
          0, 
          yOffset, 
          imgWidth, 
          imgHeight, 
          '', 
          'FAST'
        );
      }

      // Adiciona página apenas se não for o último item
      //if (index < amostras.length - 1) {doc.addPage();}
      
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      if (document.body.contains(tempDiv)) {
        document.body.removeChild(tempDiv);
      }
    }
  

  doc.save(`Relatorio_${amostra.numeroOs}.pdf`);
}
  private createReportTemplate(
    amostra: IAmostra
  ): string {
    const [prazoInicio, prazoFim] = getPrazoInicioFim(amostra.prazoInicioFim).trim().split(' - ');
    return `
      <div class="book">
        <div class="page">
          <div class="subpage">
            <div class="header">
              <div>
                <img src="./img/logo_relatorio.png" width="150px" />
              </div>
              <div>
                <h1>Laudo de Análise</h1>
              </div>
              <div class="header-right">
                <img class="img-header" src="./img/arcelor.png" />
              </div>
            </div>
            <div class="body">
              <fieldset class="solicitante">
                <div>
                  <div>
                    <span>Área Solicitante:</span>
                    <fieldset><p>${amostra.user?.area || 'N/A'}</p></fieldset>
                  </div>
                  <div>
                    <span>Data de Início:</span>
                    <fieldset>
                      <p>${
                        prazoInicio
                      }</p>
                    </fieldset>
                  </div>
                  <div>
                    <span>Data Final:</span>
                    <fieldset>
                      <p>${
                        prazoFim
                      }</p>
                    </fieldset>
                  </div>
                </div>
                <div>
                  <div>
                    <span>Requerente:</span>
                    <fieldset>
                      <p>${amostra.user?.name || 'N/A'}</p>
                    </fieldset>
                  </div>
                  <div>
                    <span>E-mail:</span>
                    <fieldset>
                      <p>${amostra.user?.email || 'N/A'}</p>
                    </fieldset>
                  </div>
                  <div>
                    <span>Contato:</span>
                    <fieldset>
                      <p>${amostra.user?.phone || 'N/A'}</p>
                    </fieldset>
                  </div>
                </div>
              </fieldset>
              
              <fieldset class="analise">
                <div>
                  <div>
                    <span>Identificação da amostra:</span>
                    <fieldset>
                      <p>${amostra.nomeAmostra}</p>
                    </fieldset>
                  </div>
                  <div>
                    <span>Tipo de amostras:</span>
                    <fieldset>
                      <p>${amostra.amostraTipo}</p>
                    </fieldset>
                  </div>
                </div>
                <div>
                  <div>
                    <span>Data da Amostra:</span>
                    <fieldset>
                      <p>${new Date(amostra.dataAmostra).toLocaleDateString()}</p>
                    </fieldset>
                  </div>
                  <div>
                    <span>Data da Recepção:</span>
                    <fieldset>
                      <p>${new Date(amostra.dataRecepcao).toLocaleDateString()}</p>
                    </fieldset>
                  </div>
                </div>
              </fieldset>

              <fieldset class="ensaios p-bottom-4">
                <div class="title">
                  <h2>Ensaios Solicitados</h2>
                </div>
                <span style="text-transform: uppercase">
                  ${amostra.ensaiosSolicitados.map(ensaio => ensaio.tipo).join(', ')}
                </span>
              </fieldset>

              ${this.renderResultados(amostra.resultados)}

                    <fieldset class="ensaios elaboracao">
        <div class="title">
          <h2>Elaboração & aprovação</h2>
        </div>
        ${this.renderAnalistas(amostra.analistas,amostra)}
      </fieldset>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  private renderResultados(resultados:{[key:string]:{}}): string {
    let html = '';
    Object.entries(resultados).forEach(([key, value]) => {
      html += `
        <fieldset class="ensaios">
          <div class="title">
            <h2>${key}</h2>
          </div>
          ${this.renderResultadosTable(key, value as ParametrosForm[])}
        </fieldset>
      `;
    });
    return html;
  }

  private renderAnalistas(analistas: IUser[], amostra: IAmostra): string {
    return `
      <div class="signatures-grid">
        ${analistas.map(analista => `
          <div class="signature-card">
            <div class="signature-line"></div>
            <div class="signature-name">${analista.name?.toUpperCase()}</div>
            <div class="signature-role">${analista.funcao || ""}</div>
            <div class="signature-area">${analista.area || ""}</div>
            <div class="signature-label">Analista Responsável</div>
          </div>
        `).join('')}
        <div class="signature-card">
          <div class="signature-line"></div>
          <div class="signature-name">${amostra.revisor.name?.toUpperCase()}</div>
          <div class="signature-role">${amostra.revisor.funcao || ""}</div>
          <div class="signature-area">${amostra.revisor.area || ""}</div>
          <div class="signature-label">Revisor Técnico</div>
        </div>
      </div>
    `;
  }

  private renderResultadosTable(key: string, value: ParametrosForm[]): string {

    const entries = Object.entries(value).map((entry) => entry[1]) as ParametrosForm[];
    const isSpecialCase = entries.length > 10
    const tableStyle = isSpecialCase
      ? 'style="display: flex;flex-direction: column; gap:1mm;"'
      : '';

    const rowStyle = isSpecialCase
      ? 'style="display: flex;flex-direction: row; flex-wrap: nowrap;"'
      : '';

    let html = `<div class="tabela-resultado" ${tableStyle}>`;
    entries.forEach((resultado) => {
      html += `
        <div class="borda" ${rowStyle}>
          <div class="result-item p-bottom-4">
            <span>${resultado.descricao} ${resultado?.subDescricao || ""}</span>
          </div>
          ${
            !isSpecialCase
              ? `<div class="result-unidade-resultado p-bottom-4"><span>${resultado.unidadeResultado}</span></div>`
              : ''
          }
          <div class="result-valor-resultado p-bottom-4">
            <span>${transformarResultado(resultado.valor!,resultado.casasDecimais)}</span>
          </div>
          ${
            isSpecialCase
              ? `<div class="result-unidade-resultado p-bottom-4"><span>${resultado.unidadeResultado}</span></div>`
              : ''
          }
        </div>
      `;
    });
    html += `</div>`;
    return html;
  }

  private getCssStyles(): string {
    
    return `
          * { box-sizing: border-box; }    
    
.header,
.body {
  max-width: 100%;
  overflow: hidden;
}

span,
p {
  font-size: 12px;
  margin: 0;
}

body {
  margin: 0;
  padding: 0;
  background-color: #fafafa;
  font: 12pt "Tahoma";
}

* {
  box-sizing: border-box;
}

.page {
  width: 21cm;
  margin: auto;
  border: 1px #d3d3d3 solid;
  border-radius: 5px;
  background-color: white;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
  
}

.subpage {
margin: 0;
  width: 100%;
  max-width: 100%;
  height: 100%;
  border: 2px #005cbb solid;
  outline: 1cm white solid;
  overflow: hidden;


  .header {
    height: 45px;
    padding: 15px 10px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: #538dd5;
.header-right{
  display: flex;
  justify-content: flex-end;
  align-items: center;
}
  .img-header{
    height: 30px;
    object-fit: contain;
  }
    div {
      flex-grow: 1;

      h1 {
        margin: 0;
        font-size: 24px;
        font-weight: 450;
        text-align: start;
        text-transform: uppercase;
        color: white;
      }
    }
  }

  .body {
    margin-top: 20px;
    padding: 10px;

    fieldset {
      border: 1px #005cbb solid;
    }

    .solicitante,
    .analise {
      margin-bottom: 10px;
      width: 100%;
      display: flex;
      flex-direction: row;
      gap: 10px;
      padding: 10px;
      border: 1px #005cbb solid;

      & > div {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        gap: 10px;
        align-items: center;
        margin-left: 30px;

        & > div,
        & > span {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        fieldset {
          min-width: 130px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2px;
          margin: 0;
          border:none;
          border-bottom: 1px solid #ccc;
          border-radius: 2px;
        }
      }
    }

    .tabela-resultado {
      width: 95%;
      margin: 20px 10px;
      display: flex;
      gap: 1px;

      .borda {
        flex-grow: 1;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;

        div {
          width: 100%;
          heigth: auto;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          border: 1px solid #a39fa9;
          text-align: center;

          span {
            width: 100%;
          }
        }
      }
    }

    .ensaios {
      margin-top: 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 100%;

      .title {
        width: 100%;
        height: 20px;
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: #538dd5;
        color: white;
        text-transform: uppercase;
        padding-bottom: 4px;

        h2 {
          margin: 0;
          text-align: center;
          font-size: 0.7rem;
        }
      }
      .result-item{
        background: #a39fa9;
        color:white;
      }
    }
  }
}
.granulometria{
  display: flex;
  flex-direction: column;
  
}

 /* Signatures Section */
      .signatures-section {
        margin-top: 30px;
        border: 2px solid #005cbb;
        border-radius: 8px;
        overflow: hidden;
      }

      .signatures-grid {
        display: flex;
        gap: 5px;
        justify-content: space-around;
        align-items:center;
        padding: 15px;
      }

      .signature-card {
        background: white;
        border: 1px solid #e0e0e0;
        border-radius: 5px;
        padding: 6px;
        text-align: center;
        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
      }

      .signature-line {
        height: 5px;
        border-bottom: 2px solid #005cbb;
        margin-bottom: 10px;
      }

      .signature-name {
        font-size: 12px;
        font-weight: 700;
        color: #005cbb;
        margin-bottom: 6px;
      }

      .signature-role {
        font-size: 10px;
        color: #666;
        margin-bottom: 4px;
      }

      .signature-area {
        font-size: 11px;
        font-weight: 600;
        color: #333;
        margin-bottom: 10px;
      }

      .signature-label {
        font-size: 10px;
        text-align: center;
        color: white;
        background: #538dd5;
        padding: 4px 8px;
        border-radius: 4px;
        border-top-left-radius: 0px; 
        border-top-right-radius: 0px;
        text-transform: uppercase;
        letter-spacing: 0.3px;
        display: inline-block;
        margin-top: 8px;
      }

  .p-bottom-4{
    padding-bottom: 4px;
  }

@page {
  size: A4;
  margin: 0;
}

@media print {
  body {
    margin: 0;
    padding: 0;
    background-color: white;
  }

  .page {
    width: 100%;
    margin: 0;
    padding: 0;
    border: none;
    border-radius: 0;
    box-shadow: none;
  }

  .subpage {
    margin: 0;
    border: none;
    outline: none;
    width: 100%;
    max-width: 100%;
  }

  .header {
    background-color: #538dd5 !important;
    color: white !important;
    height: auto;
    padding: 15px 10px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .header h1 {
    font-size: 24px;
    font-weight: 450;
    color: white !important;
    margin: 0;
  }

  .body {
    margin-top: 0;
    padding: 10px;
  }

  .solicitante,
  .analise {
    margin-bottom: 10px;
    width: 100%;
    display: flex;
    flex-direction: row;
    gap: 10px;
    padding: 10px;
    border: 1px #005cbb solid;
  }

  .tabela-resultado {
    width: 100%;
    margin: 20px 0;
    display: flex;
    gap: 1px;
    page-break-inside: avoid;
  }

  .ensaios {
    margin-top: 20px;
    page-break-inside: avoid;
  }

  .ensaios .title {
    background-color: #538dd5;
    color: white !important;
  }

  .result-item {
    background: #a39fa9 !important;
    color: white !important;
  }

  .container-assinatura {
    margin-top: 20px;
    page-break-inside: avoid;
  }

  * {
    -webkit-print-color-adjust: exact !important;
    color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  /* Ensure content fits on page */
  .header,
  .body,
  .solicitante,
  .analise,
  .tabela-resultado,
  .ensaios,
  .container-assinatura {
    page-break-inside: avoid;
  }
}
     `;
  }

}