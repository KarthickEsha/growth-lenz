import { Component, TemplateRef, ViewChild } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';

@Component({
  selector: 'app-button-renderer',
  template: `
<style>
::ng-deep.mat-mdc-dialog-container .mdc-dialog__surface {
  display: block;
  width: 100%;
  height: 100%;
  overflow: hidden !important;
}

::ng-deep.mat-mdc-menu-content {
  margin: 0;
  padding: 8px 8px !important;
  list-style-type: none;
}


</style>
<div>
    <mat-icon  style="margin-top:9px" [matMenuTriggerFor]="menu" >more_vert</mat-icon>
    </div>
    <div *ngIf="this.params?.label=='route'">
    <mat-icon (click)="onClickMenuItem(this.params)" style="margin-top:9px">{{this.params.icon}}</mat-icon>
    </div>

    
    <div *ngIf="this.params.label=='checkbox'">
    <input type="checkbox"   [(ngModel)]="value" #input style="width: 100%" (click)="selectCheckbox($event)"/>
    </div>
    <mat-menu [overlapTrigger]="false" #menu="matMenu">
    <span *ngFor="let item of actions">
    <button mat-menu-item  (click)="onClickMenuItem(item)">
    <mat-icon >{{item.icon}}</mat-icon>{{item.label}}</button></span>
  </mat-menu>
  `
})

export class ActionButtonComponent implements ICellRendererAngularComp {
  params: any
  actions: any
  value:any
  constructor(
  ) {
  }
  agInit(params: any): void {
    this.params = params;
    this.actions = this.params.context?.componentParent?.config?.actions
    
  }

  onClickMenuItem(item: any) {
    this.params.context.componentParent.onActionButtonClick(item, this.params.data)
  }

  refresh(param: any): boolean {
    return true
  }

  selectCheckbox(item:any){
    this.params.context.componentParent.select_checkbox(item, this.params.data)
  }
  isvisible(config: any): boolean {

    if ((!config.key || !config.value) && !config.expression && !config.permission) {
      return true;
    }
    let value: boolean = true;

    // if (config.permission) {
    //   // ? for Negative
    //   let permission = false
    //   if (config.permissionType == "appPermission" && this.permissionService.hasPermission(config.permission)) {
    //     permission = true
    //   } else if (config.permissionType == "appMultiPermission" && this.permissionService.hasMultiPermission(config.permission)) {
    //     // console.log(" Permission is appMultiPermission");
    //     permission = true
    //   } else if (config.permissionType == "customPermission" && this.permissionService.customPermission(config.permission)) {
    //     // console.log(" Permission is customPermission");
    //     permission = true
    //   }
    //   if (permission == false) {
    //     return false
    //   }
    //   value = permission
    // }

    function expressionCheck(model: any, expressions: string) {
      return eval(expressions)
    }
    if (config.expression && value) {
      // console.log("inside expression");
      let data = expressionCheck(this.params, config.expression)
      // console.log(data);
      if (data == false) {
        return false
      }
      // return data;
      value = data;
    }


    if (config.key && config.value && value) {
     
      const values = this.params[config.key].toLowerCase();
      const operator = config.operator.toLowerCase();
      const isArray = Array.isArray(config.value);

      if (isArray) {
        if (operator === 'equal') {
          value = config.value.some((val: any) => val.toLowerCase() === values);
        } else if (operator === 'notequal') {
          value = !config.value.some((val: any) => val.toLowerCase() === values);
        }
      } else {
        if (operator === 'equal') {
          value = config.value === values;
        } else if (operator === 'notequal') {
          value = config.value !== values;
        }
      }
    }


    return value;
  }

}


//  [
//   {
//     "label": "mmsonboarding.mms.edit",
//     "icon": "edit",
//     "isSvgIcon": true,
// ?  Operatoer type equal /  notequal
// !    "operator": "notequal",
// ?  Object Key  To Check 
//   !  "key": "status",
// ?  Value type Array / STring
//   !  "value": [  "rejected",   "pending",  "verified"   ], 
//     "formAction": "routing",
//     "route": "admin/onboard/banks/bank/{{_id}}/0",
//     "permissionType": "appPermission",
//     "permission": [
//       "Banks",
//       "edit"
//     ]
//   },
//   {
//     "label": "mmsonboarding.mms.view",
//     "icon": "view",
//     "isSvgIcon": true,
//     "route": "admin/onboard/banks/bank/view/{{_id}}/0",
//     "formAction": "routing"
//   },
//   {
//     "label": "mmsonboarding.mms.close",
//     "operator": "notequal",
//     "icon": "highlight_off",
//     "permissionType": "appPermission",
//     "permission": [
//       "Banks",
//       "cancel"
//     ],
//     "value": [
//       "closed",
//       "rejected"
//     ],
//     "key": "status",
//     "formAction": "close",
//     "keyConfig": "_id"
//   }