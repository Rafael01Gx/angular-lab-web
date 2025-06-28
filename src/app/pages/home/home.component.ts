import { Component } from "@angular/core";
import { MainContentComponent } from "../../components/layout/main-content/main-content.component";


@Component({
  selector: 'app-home',
  imports: [MainContentComponent],
  template: '<app-main-content />',

})
export class HomeComponent {

}
