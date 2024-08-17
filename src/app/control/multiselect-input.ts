
import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { FormControl } from '@angular/forms';
import { FieldType, FormlyFieldConfig } from '@ngx-formly/core';
import { DataService } from '../services/data.service';

import { DialogService } from '../services/dialog.service';
import { MatDialog } from '@angular/material/dialog';
import { SharedService } from '../services/utils';
@Component({
  selector: 'multiselect-input',
  template: `
  <style>
  .border{
    border: 1px solid rgb(158,158,158) !important;
    margin-bottom: 37px;
    border-radius: 4px;
    height: 50px;
    text-align: center;
  }
  </style>
  <div  *ngIf="this.field.group!=true">
  <ng-select  
  [dropdownPosition]="'bottom'"
  [items]="dropdownList"
  [clearSearchOnAdd]="true"
  [multiple]="true"
  [bindLabel]="labelProp"
  [closeOnSelect]="false"
  (change)="modelUpdate($event)"
  [bindValue]="valueProp"
  [formControl]="FormControl"    
  [placeholder]="this.field.props?.label" 
  [formlyAttributes]="field"
  appearance='outline'


  >
  <ng-template ng-option-tmp let-item="item" let-item$="item$" let-index="index">
    <input id="item-{{index}}"  [disabled]="item.disabled"  type="checkbox" [ngModel]="item$.selected" [ngModelOptions]="{standalone: true}"/>
    <span style="margin-left:5px" >{{$any(item)[this.labelProp]}}</span>
</ng-template> 

<ng-template ng-multi-label-tmp let-items="items" let-clear="clear">
  <div class="ng-value" *ngFor="let item of items | slice:0:display_length">
    <span class="ng-value-label"> {{$any(item)[this.labelProp]}}</span>
    <span class="ng-value-icon right" (click)="clear(item)"  aria-hidden="true">×</span>

  </div>
  <div class="ng-value" *ngIf="items.length > display_length">
    <span class="ng-value-label">{{items.length - display_length}} more...</span>
  </div>
</ng-template>
</ng-select>
</div>

<div  *ngIf="this.field.group==true">
<ng-select
[dropdownPosition]="'bottom'"
[items]="dropdownList"
[clearSearchOnAdd]="true"
[multiple]="true"
[bindLabel]="labelProp"
groupBy="data"
[closeOnSelect]="false"
[bindValue]="valueProp"
[placeholder]="this.field.props?.label" 
[formControl]="FormControl"     
  [formlyAttributes]="field"
  appearance='outline'
>

<ng-template ng-option-tmp let-item="item" let-item$="item$" let-index="index">
  <input id="item-{{index}}" type="checkbox" [ngModel]="item$.selected" [ngModelOptions]="{standalone: true}"/>
  <span style="margin-left:5px" [innerHTML]="item[this.labelProp]"></span>
</ng-template> 
<ng-template ng-optgroup-tmp let-item="item">
{{item[this.labelProp]}}
</ng-template>
<ng-template ng-option-tmp let-item="item">
{{item[this.labelProp]}}
</ng-template>

<ng-template ng-multi-label-tmp let-items="items" let-clear="clear">
  <div class="ng-value" *ngFor="let item of items | slice:0:display_length">
    <span class="ng-value-label"> {{$any(item)[this.labelProp]}}</span>
    <span class="ng-value-icon right" (click)="clear(item)"  aria-hidden="true">×</span>

  </div>
  <div class="ng-value" *ngIf="items.length > display_length">
    <span class="ng-value-label">{{items.length - display_length}} more...</span>
  </div>
</ng-template>
</ng-select>
</div>

  `,

})


export class MultiSelectInput extends FieldType<any> implements OnInit {
  opt: any
  //default prop setting
  valueProp: any
  labelProp: any
  onValueChangeUpdate: any
  label: any
  dropdownList: any[] = []
  currentField: any
  display_length: any

  constructor(private dataService: DataService,
    private dialogService: DialogService,
    private cf: ChangeDetectorRef,
    private sharedService:SharedService,
    private dialog: MatDialog) {
    super()
  }


  public get FormControl() {
    return this.formControl as FormControl;

  }



  ngOnInit(): void {
    this.label = this.field.props?.label
    this.opt = this.field.props || {};
    this.labelProp = this.opt.labelProp
    this.valueProp = this.opt.valueProp
    this.currentField = this.field
    this.onValueChangeUpdate = this.opt.onValueChangeUpdate;
    this.display_length = this.field.display_length || 1


    if (this.opt.optionsDataSource.collectionName) {
      let name = this.opt.optionsDataSource.collectionName
      this.dataService.getDataByFilter(name,{}).subscribe((res: any) => {
        this.dropdownList = res.data
        if (this.field.disableOption == true) {
          res.data.filter((data: any) => {
            if (data.status == "InActive") {
              data['disabled'] = true
            }
          })
        }
        this.dataService.buildOptions(res, this.opt);
        this.cf.detectChanges();
        if (this.opt.updateModel) {
          this.modelUpdate(this.model[this.field.key])
        }
      });
    }

    // Group Multifilter API
    // if (this.field.group && this.field.split_type) {
    //   this.dataService.getDataByFilter(this.opt.optionsDataSource.ParentcollectionName).subscribe((res: any) => {
    //     let skills = res.data
    //     let data1 = []
    //     let data2 = []
    //     data1 = skills.filter((a: any) => { return a.type == this.field.field_name[0] })
    //     data2 = skills.filter((a: any) => { return a.type == this.field.field_name[1] })
    //     let total_skills: any = []
    //     if (data1.length != 0) {
    //       total_skills.push(
    //         {
    //           "name": this.field.field_name[0],
    //           "data": data1
    //         }
    //       )
    //     }

    //     if (data2.length != 0) {
    //       total_skills.push(
    //         {
    //           "name": this.field.field_name[1],
    //           "data": data2
    //         }
    //       )
    //     }
    //     this.dropdownList = total_skills
    //     this.cf.detectChanges();
    //   })
    // }




    if (this.currentField.parentKey != "") {
      (this.field.hooks as any).afterViewInit = (f: any) => {
        const parentControl = this.form.get(this.currentField.parentKey)//this.opt.parent_key);
        parentControl?.valueChanges.subscribe((val: any) => {
          let selectedOption = this.model[this.currentField.parentKey]
          if (selectedOption != undefined) {
            if (this.field.ParentcollectionName) {
              this.dataService.getparentdataById(this.field.ParentcollectionName, selectedOption).subscribe((res: any) => {
                this.dropdownList = res
                this.cf.detectChanges();
                this.dataService.buildOptions(res, this.opt);
              })
            }

            // Group Multifilter API
            if (this.field.group) {
              this.dataService.getparentdataById(this.opt.optionsDataSource.ParentcollectionName, selectedOption).subscribe((res: any) => {
                this.dropdownList = res.data
                this.cf.detectChanges();
              })
            }


            //  Multifilter API
            if (this.opt.optionsDataSource.multifilter) {
              this.opt.multifilter_condition.conditions.map((res: any) => {
                // if(res.operator=="IN"){
                //   res.value=val
                // }

                if (res.getdata == "parent") {
                  res.value = this.model[this.field.parentKey]
                }

                // if(res.value==""){
                //   res.value=val
                // }

              })
              let filter_condition = {
                filter: [
                  this.opt.multifilter_condition
                ]
              }
              this.dataService.getDataByFilter(this.opt?.optionsDataSource?.multifilter, filter_condition).subscribe((res: any) => {
                if (res.data == null) return
                if (this.field.child_filter) {
                  this.dropdownList = res.data[0].response[0].result
                } else {
                  this.dropdownList = res.data[0].response
                }
                this.cf.detectChanges();
                this.dataService.buildOptions(res.data, this.opt);
              })

            }



          }
        })

      }
    }

    if (this.opt.optionsDataSource.multifilter_array) {
      this.opt.multifilter_condition.conditions.map((res: any) => {

        if (res.getdata == 'parent') {
          res.value = this.model[this.field.parentKey]
        }
        // if(res.value==""){
        //   res.value=this.model[this.field.parentKey]
        // }

      })
      let filter_condition = {
        filter: [
          this.opt.multifilter_condition
        ]
      }
      this.dataService.getDataByFilter(this.opt?.optionsDataSource?.multifilter_array, filter_condition).subscribe((res: any) => {
        if (res.data == null) return
        if (this.field.child_filter) {
          this.dropdownList = res.data[0].response[0].result

        }
        else if (this.field.multiple_data) {

          let data = res.data[0].response.flatMap((item: any) => item.result);
          if (data != null) {
            this.dropdownList = data
          }
        }
        else {
          this.dropdownList = res.data[0].response
        }
        this.cf.detectChanges();
        this.dataService.buildOptions(res.data, this.opt);
      })
    }


  }


  modelUpdate(data: any) {
    if (this.opt.updateModel === true) {
      const valueIndex: any = {};
      this.dropdownList.forEach(item => { valueIndex[item[this.valueProp]] = item[this.labelProp] });
      this.model[this.field.key] = data.map((element: any) => valueIndex[element]).filter((found: any) => found);
    }

    
  

    // Send remote based services data in currency code(In Project)
    if(this.field.parent_data){
      this.sharedService.updateDataList(this.model[this.field.key]);
    }
  }



}
