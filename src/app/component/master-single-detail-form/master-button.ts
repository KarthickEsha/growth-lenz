import { HttpClient } from '@angular/common/http';
import { Component, TemplateRef, ViewChild } from '@angular/core';

import { ICellRendererAngularComp } from 'ag-grid-angular';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';


@Component({
  selector: 'app-master-single-button-renderer',
  template: `
<style>
::ng-deep.mat-mdc-dialog-container .mdc-dialog__surface {
  display: block;
  width: 100%;
  height: 100%;
  overflow: hidden !important;
}</style>


<div *ngIf="this.params?.label!='route'">
    <mat-icon  style="margin-top:9px" [matMenuTriggerFor]="menu" >more_vert</mat-icon>
    </div>
    <div *ngIf="this.params?.label=='route'">
    <mat-icon (click)="onClickMenuItem($event,this.params)" style="margin-top:9px">{{this.params.icon}}</mat-icon>
    </div>


    <mat-menu [overlapTrigger]="false" #menu="matMenu">
    <span *ngFor="let item of actions">
    <button mat-menu-item  (click)="onClickMenuItem($event,item)">
    <mat-icon >{{item.icon}}</mat-icon>{{item.label}}</button></span>
  </mat-menu>

    `
})

export class MasterButtonComponent implements ICellRendererAngularComp {
  
  params: any
 
 public actions: any
  
  


  constructor(
    private router: Router,
    private httpclient: HttpClient,
    private datePipe: DatePipe
  ) {


  }
  agInit(params: any): void {
    console.log();

    this.params = params;
   
    this.actions = params.context.componentParent.actions
   
    
  }


  

  refresh(params?: any): boolean {
    return true;
  }



  onClickItem(event:any,item: any) {
    this.params.context.componentParent.onActionButtonClick(event,item, this.params.data)
  }


  onClickMenuItem(event:any,item: any) {
    console.log(item);
    
    this.params.context.componentParent.onActionButtonClick(event,item, this.params.data)
  }


  





 


  


 



 

}
