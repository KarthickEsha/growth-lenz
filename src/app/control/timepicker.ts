// import { DatePipe } from '@angular/common';
// import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, Renderer2 } from '@angular/core';
// import { FormControl } from '@angular/forms';
// import { ThemePalette } from '@angular/material/core';

// import { FieldType } from '@ngx-formly/core';
// import * as moment from 'moment';

// @Component({
//   selector: 'time-input',
//   template: `
//   <style>
// ::ng-deep.mat-toolbar.mat-primary {
//   background-color: #013688 !important;
//   color: #fff;
// }

// ::ng-deep.mat-mdc-mini-fab.mat-primary {
//   --mdc-fab-container-color: #013688;
//   --mdc-fab-icon-color: #fff;
//   --mat-mdc-fab-color: #fff;
// }

// ::ng-deep.mat-mdc-fab.mat-primary, .mat-mdc-mini-fab.mat-primary {
//   --mdc-fab-container-color: #013688;
//   --mdc-fab-icon-color: #fff;
//   --mat-mdc-fab-color: #fff;
// }

// ::ng-deep.mat-mdc-button.mat-primary {
//   --mdc-text-button-label-text-color:  #013688;
// }

// .error-font{
//   font-size: 13px;
//   margin-top: -17px;
// }
//   </style>
//   <mat-form-field appearance="fill">
//     <mat-label>{{field.props!['label']}}</mat-label>
//     <input readonly  [placeholder]="field.props!['placeholder']"  [formControl]="FormControl"  [formlyAttributes]="field" matInput [ngxMatTimepicker]="picker" [required]="this.field.props.required" />
//     <ngx-mat-timepicker class="custom-timepicker"  #picker></ngx-mat-timepicker>
//     <mat-icon
//     matSuffix
//     [ngxMatTimepicker]="picker"

//     >schedule</mat-icon
//   >
//   </mat-form-field>

// `,
// })
// export class TimeInput extends FieldType<any> implements  OnInit {
// opt:any

//   public get FormControl() {
//     return this.formControl as FormControl;
//   }
//   constructor(private datePipe: DatePipe) {
//     super();
//   }
//   ngOnInit(): void {
//   }
// }

import { DatePipe } from "@angular/common";
import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChild,
  ElementRef,
  Renderer2,
} from "@angular/core";
import { FormControl } from "@angular/forms";
import { ThemePalette } from "@angular/material/core";

import { FieldType } from "@ngx-formly/core";
import * as moment from "moment";
import { DataService } from "../services/data.service";

@Component({
  selector: "time-input",
  template: `
    <style>
      ::ng-deep.mat-toolbar.mat-primary {
        background-color: var(--sidenav-color) !important;
        color:  var(--menu-font); !important;
      }

      ::ng-deep.mat-mdc-mini-fab.mat-primary {
        --mdc-fab-container-color:   var(--sidenav-color) !important;
        --mdc-fab-icon-color:var(--sidenav-color) !important;
        --mat-mdc-fab-color: var(--menu-font); !important;
      }


      ::ng-deep.mat-mdc-button.mat-primary {
        --mdc-text-button-label-text-color: black
      }

      .error-font{
        font-size: 13px;
        margin-top: -17px;
      }
    </style>
    <mat-form-field appearance="outline">
      <mat-label>{{ field.props!["label"] }}</mat-label>
      <input
        readonly
        [placeholder]="field.props!['placeholder']"
        (ngModelChange)="handleTimepickerChange($event)"
        [formControl]="FormControl"
        [formlyAttributes]="field"
        matInput
        [(ngModel)]="defaultValue"
        [ngxMatTimepicker]="picker"
        [required]="this.field.props.required"
      />

      <ngx-mat-timepicker
        class="custom-timepicker"
        #picker
      ></ngx-mat-timepicker>
      <mat-icon matSuffix [ngxMatTimepicker]="picker">schedule</mat-icon>
    </mat-form-field>
     <mat-error *ngIf="this.formControl.hasError('sameHours')" style="font-size: 12px;">Business Hours To time is lesser than Business Hours From</mat-error>
    <mat-error *ngIf="this.formControl.hasError('minHours')" style="font-size: 12px;">Should exceed at least {{this.field.props.mins}} hrs</mat-error>
     <mat-error *ngIf="this.formControl.hasError('maxHours')" style="font-size: 12px;">Should not exceed above {{this.field.props.maxs}} hrs</mat-error>
     <mat-error *ngIf="this.formControl.hasError('invalid') && this.field.check_condition" style="font-size: 12px;">{{error_msg}}</mat-error>
  `, 
})
export class TimeInput extends FieldType<any> implements OnInit {
  opt: any;
  fromTime: any;
  toTime: any;
  date: any
  combine: any;
  defaultValue: any
  isError: boolean = false;
  error_msg:any
  // hoursDifference:any
  error: any;
  hoursDifference: number | undefined;

  public get FormControl() {
    return this.formControl as FormControl;
  }
  constructor(private datePipe: DatePipe,private dataService:DataService) {
    super();
  }
  ngOnInit(): void {
    this.setDefaultValues();
    console.warn(this.defaultValue);
    this.field.props.validateTime;
    if(this.model.isEdit == true){
      this.error = null;
      this.formControl.setErrors(null);
    }

    if (this.props?.local == true &&  this.model[this.field.key]==undefined) {
      sessionStorage.setItem(this.field.key, this.field.props.defaultValue)
    }

    if (this.opt?.local == true &&  this.model[this.field.key]!=undefined) {
      sessionStorage.setItem(this.field.key, this.model[this.field.key])
    }
    if(this.field.props.attribute){   
    let data= this.field.key.split(".").reduce((o:any, i:any) =>
    {if(o == undefined){
      return
    }else{
   return  o[i]
    } }, this.model);
if(data != undefined){
  this.defaultValue = data
}

  }
 
    this.formControl.valueChanges.subscribe(() => {
      this.handleTimepickerChange(event);
    });
    this.handleTimepickerChange(this.formControl.value)
  }

  handleTimepickerChange(event: any) {

    if (this.field.props?.validateTime == true) {
      if (this.field.parentKey) {
        let a = this.field.parentKey;
        if (this.field.parentKey == "availability_time") {
          this.fromTime = this.model[a].from;
          this.toTime = this.model[this.field.valueKey].to;
          this.calculateHoursDifference();
        } else {
          this.fromTime = this.model[a];
          this.toTime = this.model[this.field.key];
          this.calculateHoursDifference();
        }
      } else if (this.field.childKey) {
        let a = this.field.childKey;
        this.toTime = this.model[a];
        this.fromTime = this.model[this.field.key];
        this.calculateHoursDifference();
      }
    }

    if (this.field?.props?.local == true && this.model[this.field.key]!=undefined) {
      sessionStorage.setItem(this.field.key, this.model[this.field.key])
    }

  }

  setDefaultValues() {
    debugger
    const format = "h:mm A";
    this.defaultValue = this.field?.props?.defaultValue;
    if (this.field.key == "business_hours_from") {
      const fromMoment = moment(this.model.business_hours_from, format);
      this.defaultValue = fromMoment.isValid() ? fromMoment.format(format) : this.defaultValue;
    }

    if (this.field.key == "business_hours_to") {
      const toMoment = moment(this.model.business_hours_to, format);
      this.defaultValue = toMoment.isValid() ? toMoment.format(format) : this.defaultValue;
    }
  }

  addedMoment: any;
  calculateHoursDifference() {
    const format = "h:mm A"; // Time format
    const fromMoment = moment(this.fromTime, format);
    const toMoment = moment(this.toTime, format);

  //   console.warn(fromMoment.utc().format() );   
  //  fromMoment.utc().format("h:mm A")
  //   toMoment.utc().format("h:mm A")
  

    // let minLimit: any;
    // let maxLimit: any;

    // if (this.field.props.compareDate === true) {
    //   minLimit = moment(this.model.start_date_time, format);
    //   maxLimit = moment(this.model.target_date_time, format);
    // }
    

    // if (this.field.props.compareHomeUserDate === true) {
    //   minLimit = moment(this.model.start_date_time, format);
    //   maxLimit = moment(this.model.work_end_time, format);
    // }

    let format24 = "hh:mm A";
    let formattedTime = fromMoment.format(format24);
    let formattedTimeTo = toMoment.format(format24);
    let isFromAM = formattedTime.includes('AM');
    let isToAM = formattedTimeTo.includes('AM');
    console.error(isFromAM);
    console.error(isToAM);

    if (fromMoment.isValid() && toMoment.isValid()) {
      // Calculate the difference in hours and minutes
      let duration: any = moment.duration(toMoment.diff(fromMoment));
      console.log(duration);

      if(isFromAM == false && isToAM == false) {
        if (toMoment.isSame(fromMoment)) {
          this.isError = true;
        }
        if(toMoment.isAfter(fromMoment)) {
          this.isError = true;
        }
        if(toMoment.isBefore(fromMoment)) {
          duration = moment.duration(toMoment.add(1, 'day').diff(fromMoment));
          this.isError = false;
        }
      } else if(isFromAM == true && isToAM == true) {
        if (toMoment.isSame(fromMoment)) {
          this.isError = true;
        }
        if(toMoment.isAfter(fromMoment)) {
          this.isError = true;
        }
        if(toMoment.isBefore(fromMoment)) {
          duration = moment.duration(toMoment.add(1, 'day').diff(fromMoment));
          this.isError = false;
        }
      } else {
        duration = moment.duration(toMoment.add(1, 'day').diff(fromMoment));
        this.isError = false;
      }

      // Get the hours and minutes separately
      const hoursDifference = duration.hours();
      const minutesDifference = duration.minutes() % 60;
      console.warn(hoursDifference);
      console.warn(minutesDifference);

      // if (
      //   this.field.props.compareDate === true &&
      //   !moment(toMoment, "hh:mm A").isBetween(
      //     moment(minLimit, "hh:mm A"),
      //     moment(maxLimit, "hh:mm A")
      //   )
      // ) {
      //   this.error = `Time range should be between business hours`;
      //   console.warn(this.error);
      //   this.formControl.setErrors({ timeRangeError: true });
      // }
      
      
      // if (
      //   hoursDifference < this.field.props.mins ||
      //   (hoursDifference === this.field.props.mins && minutesDifference < 0)
      // ) {
      //   this.error = `Should exceed at least ${this.field.props.mins} hrs`;
      //   this.formControl.setErrors({ minHours: true }); // Set a custom error
      // } else if (
      //   hoursDifference > this.field.props.maxs ||
      //   (hoursDifference === this.field.props.maxs && minutesDifference > 0)
      // ) {
      //   this.error = `Should not exceed above ${this.field.props.maxs} hrs`;
      //   this.formControl.setErrors({ maxHours: true }); // Set a custom error
      // } 
      if (hoursDifference == null) {
        this.error = 'Time must be selected';
      } else if(this.isError == true) {
        this.formControl.setErrors({ sameHours: true });
      } else if(this.isError == false) {
        this.formControl.setErrors(null);
      } else {
        this.error = null;
        this.formControl.setErrors(null); // Clear any custom errors
        if (this.field.childKey) {
          this.error = null
          this.formControl.parent.controls[this.field.childKey].setErrors(null);
        }
        if (this.field.parentKey) {
          this.error = null
          this.formControl.parent.controls[this.field.parentKey].setErrors(
            null
          );
        }
      }
    } else {
      this.error = null;
      this.formControl.setErrors(null); // Clear any custom errors
    }
  }
}
