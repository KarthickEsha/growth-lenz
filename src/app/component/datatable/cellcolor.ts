import { Component } from '@angular/core';
import { AgRendererComponent } from 'ag-grid-angular';

@Component({
    template: `
    <span [ngStyle]="{'color': this.params.data[this.field] === 'Cr' ? 'green' : 'red'}">
        <span >{{ this.params.data[this.field] }}</span>
</span>
      `

})
export class StatusColorComponent implements AgRendererComponent {
    params: any;
    actions: any
    field:any

    agInit(params: any): void {
        
        this.params = params;
        this.field=this.params.colDef.field
        this.actions = this.params.context.componentParent.config.columnDefs
    }

  


    refresh(param: any): boolean {
        return true
    }
}