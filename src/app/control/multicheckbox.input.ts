import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
// import { FormControl } from '@angular/forms';
import { FieldType } from '@ngx-formly/core';
import { DateInput } from './datepicker';
import * as moment from 'moment';
import { isEmpty } from 'lodash';


@Component({
  selector: 'app-checkbox-input',
  template: `
    <style>
    .checkbox {

  }
  .example-margin{
    height: 0px;
    margin-top: -10px;
  }
  .mat-mdc-text-field-wrapper {
    height: 60px !important;
}
    </style>
    <mat-form-field class="example-full-width" appearance="outline" [formlyAttributes]="field"
    [formControl]="thisFormControl">
    <mat-label>{{field.props!['label']}}</mat-label>
      <input [required]="required" readonly matInput style="display:none;padding:0;margin:0" value=" ">
    <mat-checkbox *ngFor="let option of interest; let i = index"
     class="example-margin"
     [checked]="this.data[option.value]" [disabled]="this.opt?.readonly"
     (change)="onCheckboxChange($event,i)" >{{ option.label }}</mat-checkbox>       
</mat-form-field> 

  `,

})
export class MultiCheckboxInput extends FieldType<any> implements OnInit {

  error: any
  placeholder: any
  required: any
  opt: any
  interest: any[] = [];
  public get thisFormControl() {
    return this.formControl as FormControl;
    
  }

  // constructor(private dateInput:DateInput){
  //     super();
  // }

  ngOnInit(): void {
    this.opt = this.props
    this.required = this.field.props?.required
    this.error = this.field.props?.['error']
    this.placeholder = this.field.props?.['placeholder']
    this.interest =this.field.props?.options
    console.log(this.model.isEdit);
    
    if(this.model[this.field.key]!=undefined){
      this.data=this.formControl.value
    }else{

      this.interest.forEach((xyz:any)=>{
        this.data[xyz.value]=false
      })
    }
  }

  currentDate: any
  data: any = {}
  onCheckboxChange(event: any, name: any) {
    debugger

    let data: any = {}
    let names:any=this.interest[name].value    
    data[names] = event.checked

this.data[names]=event.checked
console.log(this.data);
this.formControl.setValue(this.data)


const key = this.field.props?.['onValueChange']?.key;
    // this.dateInput.currentPeriodClicked(event)
    if (event.checked) {
      // this.dateInput.currentPeriodClicked(event)
      // this.DateInput.currentPeriodClicked()
      this.currentDate = new Date();

      if (key) {
        const control = this.field.formControl?.parent?.get(key) as FormControl;
        if (control) {

          control.setValue(event.check);
        }
      }
    } else {
      // Handle unchecked state if necessary
      if (key) {
        const control = this.field.formControl?.parent?.get(key) as FormControl;
        if (control) {
          control.setValue('');
        }
      }
    }

    if(this.opt.required){
      const allFalse = Object.values(this.model[this.field.key]).every(value => value === false);
      if(allFalse){
        this.formControl.setErrors({required:true})
      }
    }

   
  }


}
