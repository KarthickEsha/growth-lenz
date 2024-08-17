import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
// import { FormControl } from '@angular/forms';
import { FieldType } from '@ngx-formly/core';
import { DateInput } from './datepicker';
import * as moment from 'moment';


@Component({
    selector: 'app-checkbox-input',
    template: `
    <style>
    .checkbox {
      margin: 0px 7px 25px 10px;
  }
    </style>
    <div class="checkbox">
    <mat-checkbox class="example-margin" (change)="onCheckboxChange($event)" [formControl]="FormControl">{{ field.props!['label'] }}</mat-checkbox>

  </div>

  `,

})
export class CheckboxInputFieldComponent extends FieldType implements OnInit {
   
    error: any
    placeholder: any
    required: any
    public get FormControl() {
        return this.formControl as FormControl;
      }

// constructor(private dateInput:DateInput){
//     super();
// }

    ngOnInit(): void {
        this.required = this.field.props?.required
        this.error = this.field.props?.['errorMessage']
        this.placeholder = this.field.props?.['placeholder']

    }

    currentDate:any
onCheckboxChange(event: any) {
    debugger
    const key = this.field.props?.['onValueChange']?.key;
    // this.dateInput.currentPeriodClicked(event)
    if (event.checked) {
        // this.dateInput.currentPeriodClicked(event)
        // this.DateInput.currentPeriodClicked()
    this.currentDate = new Date();
    
      if (key) {
        const control = this.field.formControl?.parent?.get(key) as FormControl;
        if (control) {
          control.setValue(this.currentDate);
          this.currentPeriodClicked()
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
  }

  firstDate:any
  secondDate:any
  currentPeriodClicked(){
    debugger
//  if (this.field.parentKey){
//       if (typeof this.model[this.field.parentKey] === 'string') {
//         // Parse the string date to a Moment.js object
//         this.firstDate = moment(this.model[this.field.parentKey]);
//       } else {
//         this.firstDate = this.model[this.field.parentKey];
//       }
//       this.secondDate = data.value
//       this.formControl.setValue(data.value)
//     }


if(typeof this.model['job_start_date'] === 'string'){
    this.firstDate = moment(this.model['job_start_date'])
}else{
    this.firstDate = this.model['job_start_date']
}

// this.secondDate  = moment(this.currentDate).format('_d: ddd MMM D YYYY HH:mm:ss [GMT]Z (z)');
this.secondDate  = moment(this.currentDate)
// this.secondDate = this.currentDate

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

const key = this.field.props?.['onValueChangeUpdate']?.key;
if (key) {
    const control = this.field.formControl?.parent?.get(key) as FormControl;
    if (control) {
      control.setValue(formattedNumber);
    }
  }

// this.field.formControl.parent.controls[this.field.props.onValueChangeUpdate.key].setValue(formattedNumber);
    
  }
   
}


