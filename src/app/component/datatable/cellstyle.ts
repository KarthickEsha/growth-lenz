import { Component } from '@angular/core';
import { AgRendererComponent } from 'ag-grid-angular';

@Component({
    template: `<a  (click)="onClickLink(actions)">{{params.value}}</a>`
})
export class MyLinkRendererComponent implements AgRendererComponent {
    params: any;
    actions: any

    agInit(params: any): void {
        debugger
        this.params = params;
        this.actions = this.params.context.componentParent.config.columnDefs
    }

    onClickLink(actions: any) {
        debugger
        this.params.context.componentParent.onRouteDialog(actions, this.params.data)
        // , this.params.data
    }


    refresh(param: any): boolean {
        return true
    }
}