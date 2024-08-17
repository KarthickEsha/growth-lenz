import { DatePipe } from '@angular/common';
import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { AbstractControl, FormControl, Validators } from '@angular/forms';
import { ThemePalette } from '@angular/material/core';

import { FieldType } from '@ngx-formly/core';
import * as moment from 'moment';

@Component({
  selector: 'date-input',
  template: `
  <mat-form-field class="example-full-width" appearance="outline">
  <mat-label>{{field.props!['label']}}</mat-label>
  <mat-error *ngIf="FormControl.hasError('required')">{{field.validation.messages['required']}}</mat-error>
  <input [readonly]="true" matInput  (dateChange)="currentPeriodClicked($event)"  [formControl]="formControl" [formlyAttributes]="field" [min]="minFromDate" [max]="maxFromDate" [matDatepicker]="frompicker" [required]="this.opt.required" />
  <mat-datepicker-toggle matSuffix [for]="frompicker" [disabled]="field.props?.disabled"></mat-datepicker-toggle>
  <mat-datepicker #frompicker  [disabled]="field.props?.readonly || false"  ></mat-datepicker>
  <mat-error *ngIf="formControl.hasError('dateRangeError')">Invalid {{this.field.props.label}}</mat-error>
  <mat-error *ngIf="formControl.hasError('invalid')">{{this.field.errorMessage}}</mat-error>
  <mat-error *ngIf="formControl.hasError('invalid_date')">{{errorMessage}}</mat-error>

  </mat-form-field> 
`,
})

export class DateInput extends FieldType<any> implements OnInit {

  opt: any
  minFromDate!: any;
  maxFromDate!: any | null;
  minToDate!: Date | null;
  maxToDate!: Date;
  required: any
  currentField: any
  disabled: boolean = true
  secondDate: any
  firstDate: any
  errorMessage:any

  public get FormControl() {
    return this.formControl as FormControl;
  }
  constructor(private datePipe: DatePipe) {
    super();
  }
  ngOnInit(): void {
    debugger
    this.currentField = this.field
    this.required = this.field.props?.required
    this.opt = this.field.props


    if (this.opt?.attributes?.hide == "past_date") {
      this.minFromDate = moment().add(this.opt.attributes.add_days || 0, 'day')
    }

    if(this.opt?.attributes?.hide =="past_future_date"){
      if(this.opt.attributes.min){
        this.minFromDate = moment(this.opt?.attributes.min)
      }
      
      if(this.opt.attributes.max >=0){
        this.maxFromDate = moment().add(this.opt.attributes.max, 'day')
      }
      if(this.opt.attributes.parent_field && this.model[this.opt.attributes.parent_field]){
       this.minFromDate = moment(this.model[this.opt.attributes.parent_field])
      }
      
    }
    if (this.model.isEdit == true && this?.opt?.dynamic == true) {
      this.minFromDate = this.formControl.value
    }

    if (this.model.isEdit == true && this?.opt?.showAllDate == true) {
      this.minFromDate = []
      this.maxFromDate = []
    }

    if (this.opt.attributes.hide == "future_date") {
      this.maxFromDate = moment().add(this.opt.attributes.add_days || 0, 'day')
    }

    console.log(this.opt);

    if (this.model.isEdit == true && this?.opt?.overrideFromDate?.dynamic == true) {
      // let field =  this.opt.overrideFromDate.ToDAtekey
      const todate: any = this.form.get(this.opt.overrideFromDate.ToDAtekey)
      // console.log(todate);
      // console.log(this.opt.overrideFromDate.ToDAtekey);
      this.minFromDate = this.formControl.value

      this.maxFromDate = moment(todate?.value);
      console.log(this.minFromDate, this.maxFromDate);

      // (this.field.hooks as any).afterViewInit = (f: any) => {
      // const parentControl = this.form.get(field)
      todate?.valueChanges.subscribe((val: any) => {
        console.log(val);

        this.maxFromDate = val
      })

      // }
    }


    if (this.currentField.parentKey != "") {
      debugger
      (this.field.hooks as any).afterViewInit = (f: any) => {
        let field = this.currentField.parentKey
        const parentControl = this.form.get(field)

        if (parentControl) {
          // Call the function to handle the initial value
          if (parentControl.value) {
            this.handleParentControlValue(parentControl.value);
          }
          // Subscribe to value changes for future changes
          parentControl?.valueChanges.subscribe((val: any) => {
            // Call the function to handle changes
            this.handleParentControlValue(val);
          });
        }

        // parentControl?.valueChanges.subscribe((val: any) => { 
        // })

      }
    }

    if (this.opt.local == true) {
      sessionStorage.setItem(this.field.key, this.model[this.field.key])
    }

    if(this.field.check_validation && this.model[this.field.key]){
      const dateToCompare = moment(this.model[this.field.key]);
      // Check if 'yourDate' is in the past compared to the current date
      if (dateToCompare.isBefore(moment())) {
        this.errorMessage=this.field.validation?.messages.error_msg
        this.field.formControl.setErrors({ invalid_date: true }); 
        this.errorMessage = this.field.validation.messages.error_msg
    }
  }
  }
  // currentPeriodClicked(data:any){}



  handleParentControlValue(value: any) {
    debugger

    if (this.field.currentToParentDate == true) {
      const dateRangeValidator = (control: AbstractControl): { [key: string]: any } | null => {
        const childValue = control.value;
        // Check if the child value is outside the date range
        if (childValue && (childValue < this.minFromDate || childValue > this.maxFromDate)) {
          return { 'dateRangeError': true };
        }
        return null;
      };
      // Assign the custom validator to the child form control
      this.formControl.setValidators([Validators.required, dateRangeValidator]);
      this.formControl.updateValueAndValidity();


      this.minFromDate = new Date()
      this.maxFromDate = value
    } else {

      this.minFromDate = value
      if(this.opt.attributes.max >=0){
        this.maxFromDate = moment().add(this.opt.attributes.max, 'day')
      }
    }

  }

  invalid = false
  jobEndDate:any
  currentPeriodClicked(data: any) {
    debugger
    if(this.field.props.isRepeatedDate){
    let countryDualPermit = JSON.parse(sessionStorage.getItem("Country dual permit") || '')
    let engineerExperiance = JSON.parse(sessionStorage.getItem("engineerExperience") || '')
    if (!this.model.id) {
      if (this.field.props.isRepeatedDate == true && countryDualPermit == false) {
        // const lastObject = engineerExperiance[engineerExperiance.length - 1];

        const dateRangeValidator = (control: AbstractControl): { [key: string]: any } | null => {
         
          // if (data.value.isBefore(lastObject.job_end_date)) {
          //   this.invalid = true
          //   return { 'invalid': true };
          // }
          // this.invalid = false
          // return null;

          let selectedDate = control.value;
          if (typeof selectedDate === 'string') {
            selectedDate = moment(selectedDate, 'YYYY-MM-DDTHH:mm:ss[Z]');
          }

          for (const job of engineerExperiance) {
            const jobStartDate = new Date(job.job_start_date);
          
            if(job.job_end_date ){
              this.jobEndDate = new Date(job.job_end_date);
            }else if(job.till_continue_working === true){
              this.jobEndDate = moment()
            }
    
            if (selectedDate.isSameOrAfter(jobStartDate) && selectedDate.isSameOrBefore(this.jobEndDate)) {
  
              this.invalid = true
              return { 'invalid': true }; // Date is within a job's date range, return error
            }

          }
    
          // If no job date range matches, return validation error
          this.invalid = false
          return null;


        };
        // Assign the custom validator to the child form control
        this.formControl.setValidators([Validators.required, dateRangeValidator]);
        this.formControl.updateValueAndValidity();
  
      }
    }
  }

    if (this.field.valtidateDate == true) {
      if (this.field.childKey) {
        if (typeof this.model[this.field.childKey] === 'string') {
          // Parse the string date to a Moment.js object
          this.secondDate = moment(this.model[this.field.childKey]);
        } if (this.model[this.field.childkey2] === true) {
          // Parse the string date to a Moment.js object
          this.secondDate = moment()
        }
        else {
          this.secondDate = this.model[this.field.childKey];
        }
        this.firstDate = data.value
        this.formControl.setValue(data.value)

      } else if (this.field.parentKey) {
        if (typeof this.model[this.field.parentKey] === 'string') {
          // Parse the string date to a Moment.js object
          this.firstDate = moment(this.model[this.field.parentKey]);
        } else {
          this.firstDate = this.model[this.field.parentKey];
        }
        this.secondDate = data.value
        this.formControl.setValue(data.value)
      }

      let yearsDiff = this.secondDate.year() - this.firstDate.year();
      let monthsDiff = this.secondDate.month() - this.firstDate.month();

      if (monthsDiff < 0) {
        yearsDiff--;
        monthsDiff += 12;
      }

      let a = `${yearsDiff}.${monthsDiff}`;
      const cleanStr = a.replace(/[^0-9.-]/g, ''); // Remove non-numeric characters
      const number = parseFloat(cleanStr); // Parse the string as a float

      let formattedNumber;
      if (Number.isInteger(number)) {
        // If the number has no decimal part, add two decimal places
        formattedNumber = number.toFixed(2);
      } else {
        // Otherwise, remove trailing zeros after the decimal point
        formattedNumber = number
      }

      this.field.formControl.parent.controls[this.field.props.onValueChangeUpdate.key].setValue(formattedNumber);
    }

    // if (moment.isMoment(value)) {
    // If the property is a moment object, convert it to ISO string
    const momentObject = moment(this.field.formControl.value);
    const adjustedMoment = momentObject.add(5.5, 'hours');
    const adjustedISOString = adjustedMoment.toISOString();
    // obj[key]= adjustedISOString
    this.field.formControl.setValue(adjustedISOString)
    // obj[key] = moment.utc(value);
    // }

    // if(this.field.currentToParentDate == true){
    //   this.subscribeOnValueChangeEvent()
    // }

    if (this.opt.local == true) {
      sessionStorage.setItem(this.field.key, this.model[this.field.key])
    }


    if(this.field.check_condition){

      let data= this.field.parentKey.split(".").reduce((o:any, i:any) =>
      o[i], this.model
     );
    
     var futureMonth = moment(data).add(18, 'years').format();
     if(this.model[this.field.key] <= futureMonth ){
      this.formControl.setErrors({"invalid_date":true})
      this.errorMessage=this.field.validation.messages.error_msg + " "+moment(futureMonth).format("DD-MMM-YYYY")
     } else {
      this.formControl.setErrors(null)
     }


    }


  }

}