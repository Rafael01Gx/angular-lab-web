import { Component, inject, OnInit } from '@angular/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { MultiSelectComponent, MultiSelectConfig } from "../../layout/input-select/multi-select.component";
import { AnalysisTypeService } from '../../../services/analysis-type.service';
import { ITipoAnalise } from '../../../interfaces/analysis-type.interface';
import { IAmostra } from '../../../interfaces/amostra.interface';
import { FormsModule } from '@angular/forms';
import { heroArrowTurnRightDown } from '@ng-icons/heroicons/outline';

@Component({
  selector: 'app-orders-create',
  imports: [NgIconComponent, MultiSelectComponent,FormsModule],
  viewProviders:[provideIcons({
    heroArrowTurnRightDown
  })],
  templateUrl: './orders-create.component.html',
})
export class OrdersCreateComponent implements OnInit {
#analysisService = inject(AnalysisTypeService);
identificacao= ''

ensaios:ITipoAnalise[] = []
amostras: IAmostra[] = []

  config: MultiSelectConfig = {
    displayField: 'tipo',
    searchField: 'descricao',
    placeholder: 'Selecione...',
    maxHeight: '300px',
  };

ngOnInit(): void {
  this.getAnalysis();
}

getAnalysis(){
  try {
    this.#analysisService.findAll().subscribe((res)=>{
      if(res){
        this.ensaios = res
      }
    })
  } catch (error) {
    console.log(error)
  }
}
}
