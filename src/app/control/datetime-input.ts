import { DatePipe } from "@angular/common";
import { Component, OnInit, AfterViewInit, ViewChild } from "@angular/core";
import { FormControl } from "@angular/forms";
import { ThemePalette } from "@angular/material/core";

import { FieldType } from "@ngx-formly/core";
import * as moment from "moment";

@Component({
  selector: "datetime-input",
  template: `
    <p>{{ this.field.props?.label }}</p>
    <div style="margin:5px 5px;top:0px">
      <p-calendar
        id="customCalendar"
        class="max-w-full"
        dateFormat="dd/mm/yy"
        hourFormat="12"
        min
        [minDate]="currentDate"
        [formControl]="formControl"
        [formlyAttributes]="field"
        [(ngModel)]="date"
        [showTime]="true"
        [showIcon]="true"
        [style]="{ height: '40px', width: '100%' }"
        (onSelect)="onDateSelect($event)"
      ></p-calendar>
    </div>
    <p style="color:red; font-size:12px;">{{ this.errorMessage }}</p>
  `,
})
export class DateTimeInput
  extends FieldType<any>
  implements AfterViewInit, OnInit
{
  date: Date[] | undefined;
  @ViewChild("picker") picker: any;
  errorMessage!: string;
  // public date!: moment.Moment;
  hideTime = false;
  placeholder: any;
  currentDate = moment().toDate();
  required: any;
  currentField: any;
  selected_date!: any;
  ngAfterViewInit(): void {}

  public get FormControl() {
    return this.formControl as FormControl;
  }
  constructor(private datePipe: DatePipe) {
    super();
  }
  ngOnInit(): void {
    debugger;
    this.required = this.field.props?.required;
    this.placeholder = this.field.props?.placeholder;
    this.currentField = this.field; 
    if(this.model.isEdit == true){
      this.selected_date = new Date (this.model.start_date_time)
      this.date=this.selected_date
    }

    if(this.model.isclone == true){
      this.selected_date = new Date (this.model.start_date_time)
      this.date=this.selected_date
    }

    if (this.currentField.parentKey != "") {
      debugger;
      (this.field.hooks as any).afterViewInit = (f: any) => {
        let field = this.currentField.parentKey;
        const parentControl = this.form.get(field);
        parentControl?.valueChanges.subscribe((val: any) => {
          // this.minFromDate = val
        });
      };
    }
  }

  // onDateSelect(event: any) {
  //   debugger;
  //   if (event instanceof Date) {
  //     const selectedTime = this.formatTime(event);
  //     console.log("Selected Time:", selectedTime);

  //     const formattedFrom = this.formatTime(
  //       new Date(`2000-01-01 ${this.model.business_hours_from}`)
  //     );
  //     const formattedTo = this.formatTime(
  //       new Date(`2000-01-01 ${this.model.business_hours_to}`)
  //     );

  //     if (
  //       this.compareTimes(selectedTime, formattedFrom) >= 0 &&
  //       this.compareTimes(selectedTime, formattedTo) <= 0
  //     ) {
  //       this.errorMessage = "Selected time is within business hours.";
  //     } else {
  //       this.errorMessage = "Selected time is outside business hours.";
  //     }
  //   }
  // }

  onDateSelect(event: any) {
    console.log(event);
    // if(this.model.isHomeUser == true && this.model.start_date_time && this.model.end_date_time) {
    //   if (event instanceof Date) {
    //     const selectedTime = this.formatTime(event);
  
    //     const formattedFrom = this.formatTime(moment(`2000-01-01 ${this.model.start_date_time}`, 'YYYY-MM-DD hh:mm A'));
    //     const formattedTo = this.formatTime(moment(`2000-01-01 ${this.model.end_date_time}`, 'YYYY-MM-DD hh:mm A'));

    //     console.warn(formattedFrom);
    //     console.warn(formattedTo);
  
    //     if (moment(selectedTime, 'hh:mm A').isBetween(moment(formattedFrom, 'hh:mm A'), moment(formattedTo, 'hh:mm A'))) {
    //       this.errorMessage = ''
    //     } else {
    //       this.errorMessage = 'Start and End date & time is required.'
    //     }
    //   }
    // }
    
    if(this.model.isCorporateCustomer == true) {
    if (event instanceof Date) {
      const selectedTime = this.formatTime(event);

      const formattedFrom = this.formatTime(moment(`2000-01-01 ${this.model.business_hours_from}`, 'YYYY-MM-DD hh:mm A'));
      const formattedTo = this.formatTime(moment(`2000-01-01 ${this.model.business_hours_to}`, 'YYYY-MM-DD hh:mm A'));

      if (moment(selectedTime, 'hh:mm A').isBetween(moment(formattedFrom, 'hh:mm A'), moment(formattedTo, 'hh:mm A'))) {
        this.errorMessage = ''
      } else {
        this.errorMessage = 'Start date and time is beyond business hours.'
      }
    }
  }
  }

  formatTime(date: Date | moment.Moment): string {
    return moment(date).format('hh:mm A');
  }
}
