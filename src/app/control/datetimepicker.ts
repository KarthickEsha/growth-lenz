import { DatePipe } from "@angular/common";
import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChild,
  OnChanges,
  SimpleChanges,
  ElementRef,
} from "@angular/core";
import { FormControl } from "@angular/forms";
import { ThemePalette } from "@angular/material/core";
import { AngularEditorConfig } from "@kolkov/angular-editor";
import { FieldType, FormlyFieldConfig } from "@ngx-formly/core";
import * as moment from "moment-timezone";

@Component({
  selector: "datetimepicker",
  template: `
    <!-- <mat-form-field style="width:100%">
    <input matInput [ngxMatDatetimePicker]="pickerCustomIcon" placeholder="Choose a date"
    [formControl]="FormControl" [min]="minDate" >
    <ngx-mat-datepicker-toggle matSuffix [for]="pickerCustomIcon" ></ngx-mat-datepicker-toggle>
    <ngx-mat-datetime-picker #pickerCustomIcon [showSpinners]="showSpinners" [showSeconds]="showSeconds"
      [stepHour]="stepHour" [stepMinute]="stepMinute"  [touchUi]="touchUi"
      [color]="color" [enableMeridian]="enableMeridian" [disableMinute]="false" [hideTime]="hideTime">
      <ngx-mat-datepicker-actions>
        <button mat-button ngxMatDatepickerCancel>Cancel</button>
        <button mat-raised-button color="primary" ngxMatDatepickerApply (click)="getData()">Apply</button>
      </ngx-mat-datepicker-actions>
    </ngx-mat-datetime-picker>
  </mat-form-field> -->
    <mat-form-field style="width:100%">
    <mat-label>{{this.field.props?.label}}</mat-label>
      <input readonly
        matInput #dateInput
        [ngxMatDatetimePicker]="pickerCustomIcon"
        placeholder="{{ this.field.props?.label }}"
        [formControl]="FormControl"
        [min]="minDate"
        [max]="maxDate"
        [required]="this.opt.required"
        (click)="onclickDateChange()"
        (blur)="onclickDateChange()"
      />
      <ngx-mat-datepicker-toggle
        matSuffix
        [for]="pickerCustomIcon"
      ></ngx-mat-datepicker-toggle>
      <ngx-mat-datetime-picker
        #pickerCustomIcon
        [showSpinners]="showSpinners"
        [showSeconds]="showSeconds"
        [stepHour]="stepHour"
        [stepMinute]="stepMinute"
        [touchUi]="touchUi"
        [color]="color"
        [enableMeridian]="enableMeridian"
        [hideTime]="hideTime"
      >
        <ngx-mat-datepicker-actions>
          <button mat-button ngxMatDatepickerCancel>Cancel</button>
          <button
            mat-raised-button
            color="primary"
            ngxMatDatepickerApply
            (click)="handleTimepickerChange()"
          >
            Apply
          </button>
        </ngx-mat-datepicker-actions>
      </ngx-mat-datetime-picker>
      <mat-error *ngIf="FormControl.hasError('required')"
        >This field is required</mat-error
      >
      <mat-error *ngIf="FormControl.hasError('maxHours')"
        >Selected Date & Time should be greater than current date
      </mat-error>
      <mat-error *ngIf="FormControl.hasError('lesserThan')"
        >Selected Date & Time should be greater than start date & time
      </mat-error>
      <mat-error *ngIf="FormControl.hasError('fiveMintues')"
        >Minutes must be in-between of slots (00, 15, 30, 45)
      </mat-error>
      <mat-error *ngIf="FormControl.hasError('firstGreaterThan')"
        >Selected Date & Time should be lesser than end date & time
      </mat-error><mat-error *ngIf="FormControl.hasError('secondLesserThan')"
        >Selected Date & Time should be greater than start date & time
      </mat-error>
      <mat-error *ngIf="FormControl.hasError('minimumHours')"
        >Estimated Hours should be minimum 1 hour
      </mat-error>
      <mat-error *ngIf="FormControl.hasError('maximumHours')"
        >Estimated Hours should below {{maxWorkHours}} hours
      </mat-error>
      <mat-error *ngIf="FormControl.hasError('invalidFrom') || FormControl.hasError('invalidTo')">
      Selected time is outside the business hours ({{this.model.business_hours_from}} to {{this.model.business_hours_to}})
</mat-error>
      <mat-error *ngIf="FormControl.hasError('invalidFrom2') || FormControl.hasError('invalidTo2')">
      Selected time is outside the business hours 09:00 AM to 06:00 PM
</mat-error>
      <mat-error>{{this.error}}</mat-error
      >
    </mat-form-field>
  `,
})
export class FormlyFieldDateTimePicker
  extends FieldType<any>
  implements  OnInit
{
  @ViewChild("picker1") picker1: any;
  @ViewChild('dateInput') dateInput: ElementRef<HTMLInputElement> | undefined;
  error: any;
  fromTime: any;
  toTime: any;
  public date!: moment.Moment;
  public showSpinners = true;
  public showSeconds = false;
  public touchUi = false;
  public enableMeridian = false;
  public minDate!: Date;
  public maxDate!: Date; // Set to the current date
  public stepHour = 1;
  public stepMinute = 15;
  public color: ThemePalette = "primary";
  public defaultTime = [new Date().setHours(0, 0, 0, 0)];
  hideTime = false;
  parent: any;
  opt:any
  private isFirstLoad = true;
  maxWorkHours:any
 
  public get FormControl() {
    return this.formControl as FormControl;
  }
  constructor(private datePipe: DatePipe) {
    super();
  }

  ngOnInit(): void {
    debugger;
    this.subscribeOnValueChangeEvent();
    this.minDate = moment().toDate();
    this.opt = this.field.props
    // if(this.model.isclone == true || this.model.isEdit == true) {
    //   this.check = true
    // }
    this.handleTimepickerChange();
  }

  ngAfterViewChecked() {
    if (this.dateInput && this.formControl && this.formControl.value != undefined) {
      const formattedDate = this.datePipe.transform(this.formControl.value, 'dd-MMM-yyyy, HH:mm');
      if (formattedDate) {
        (this.dateInput as ElementRef).nativeElement.value = formattedDate;
      }
    }
  }

  onclickDateChange() {
    if (!this.formControl.value) {
      return
    }
    (this.dateInput as ElementRef).nativeElement.value = this.formatDate(this.formControl.value)
  }

  subscribeOnValueChangeEvent() {
    // on ParentKey changes logic to be implemented

    if (this.field.parentKey! != "") {
      (this.field.hooks as any).afterViewInit = (f: any) => {
        const parentControl = this.form.get(this.field.parentKey); //this.opt.parent_key);
        parentControl?.valueChanges.subscribe((val: any) => {
          this.minDate = val;

          // if(val > this.model[this.field.key] ){
          //   // this.formControl.setErrors({ invalidStartDate : true });
          //   this.error = "Selected date should be greater than start date and time"
          // }

          if(this.opt?.attributes?.maxDate){
            this.maxDate = val
            this.minDate = new Date()
            if (this.opt.local == true) {
              sessionStorage.setItem(this.field.key, this.model[this.field.key])
            }
          }
        });
      };
    }
  }

  handleTimepickerChange() {
    this.error = null
  
    if (this.field.props.validateDateAndTime == true) {
      if (this.field.parentKey) {
        let a = this.field.parentKey;
        if (this.field.parentKey == "availability_time") {
          this.fromTime = this.model[a].from;
          this.toTime = this.model[this.field.valueKey].to;
          this.getData();
        } else {
          this.fromTime = this.model[a];
          this.toTime = this.model[this.field.key];
          this.getData();
        }
      } else if (this.field.childKey) {
        let a = this.field.childKey;
        this.toTime = this.model[a];
        this.fromTime = this.model[this.field.key];
        console.log(this.fromTime);
        
        this.getData();
      }
    }

    if (this.opt.get_datalocal == true) {
      debugger
      let date :any= sessionStorage.getItem(this.opt.get_parent_field)
      this.maxDate=new Date(date)
       let parent_key1 :any = sessionStorage.getItem(this.field?.parentkey1)
       parent_key1=moment(parent_key1,'h:mm A')
       var parent_key2 :any= sessionStorage.getItem(this.field?.parentkey2)
       parent_key2=moment(parent_key2,'h:mm A')
       let date1 :any= moment(this.model[this.field.key]).format('h:mm A')
       let date2 :any= moment(this.model[this.field.key])
       let currentDate = moment().startOf('day');
       let currentTime = moment().format('h:mm A');

     console.log(date1)

     
if(moment(date2, 'dd MM yyyy h:mm A').isSame(currentDate, 'day')){
  if (date1 != undefined && moment(date1, 'h:mm A').isBefore(moment(currentTime,'h:mm A'))) { 
   this.error = "Time should be greater than the current time";
   this.field.formControl.setErrors({ invalid: true });
 } else{
  this.field.formControl.setErrors(null);
 }
 } else {
  this.field.formControl.setErrors(null);
 }
  
   //  Compare the times
     if(this.model[this.field.key]==undefined) return 
if ( date1 != undefined && (moment(date1, 'h:mm A').isBefore(parent_key1) && moment(date1, 'h:mm A').isAfter(parent_key2))) {
  this.error=this.field.validation.messages.errormsg
  this.field.formControl.setErrors({invalid:true})
} else{
  this.field.formControl.setErrors(null);
}

if (moment(this.model[this.field.key]).isBefore(moment())) {
  this.error=this.field.validation.messages.erromsg2
  this.field.formControl.setErrors({invalid:true})
 } else{
  this.field.formControl.setErrors(null);
}


     }   
     (this.dateInput as ElementRef).nativeElement.value = this.formatDate(this.formControl.value)  
  }

  formatDate(dateString: string): string {
    const isValidDate = moment(dateString, 'DD-MMM-YYYY HH:mm', true).isValid();
    if (!isValidDate && dateString) {
      return '';
    }
    return isValidDate ? moment(dateString, 'DD-MMM-YYYY HH:mm').format('DD-MMM-YYYY HH:mm') : dateString;
  }

  totalHours: any;
  BusinessFrom: any;
  BusinessTo: any;
  finalMinutes: any;

  getData(): void {
    debugger;
    console.log(this.form.value);
    const fromTime = this.fromTime
    const toTime = this.toTime

    const jobBusinessFrom = this.model.business_hours_from;
    const jobBusinessTo = this.model.business_hours_to;

    this.BusinessFrom = moment(this.model.business_hours_from, 'h:mm A').format('HH:mm');
    this.BusinessTo = moment(this.model.business_hours_to, 'h:mm A').format('HH:mm');

    let BusinessFrom = moment(this.model.business_hours_from, 'h:mm A')
    let BusinessTo = moment(this.model.business_hours_to, 'h:mm A')

    const format = "h:mm A"; // Time format
    const fromDate = moment(fromTime, format);
    const toDate = moment(toTime, format);

    if (this.field.props?.compareDAndT == true) {

      let fromTime = this.fromTime
      let toTime = this.toTime

      const format = "HH:mm"; 
      let fromDate = moment(moment(fromTime).local(), format);

      let toDate: any;

      if(toTime == undefined) {
        toDate = undefined
      } else {
        toDate = moment(moment(toTime).local(), format);
      }

      let StartDate = fromDate.format("YYYY-MM-DD");
      let NormalDate = toDate?.format("YYYY-MM-DD");


      const fromDateFormat = moment(
        fromDate,
        "ddd MMM DD YYYY HH:mm:ss [GMT]ZZ"
      );
      
      const timeFromString = fromDateFormat.format("h:mm A");
      const toDateFormat = moment(toDate, "ddd MMM DD YYYY HH:mm:ss [GMT]ZZ");
      const timeToString = toDateFormat.format("h:mm A");

      const fromDateFromMoment = moment(timeFromString, "h:mm A");
      const toDateToMoment = moment(timeToString, "h:mm A");

      let daysCount = moment(NormalDate).diff(StartDate, "days");
     
   
      const fromMinutes = fromDateFromMoment.minutes();
      const toMinutes = toDateToMoment.minutes();

      if (this.field?.key == "start_date_time" && fromMinutes % 15 !== 0) {
        return this.formControl.setErrors({ fiveMintues: true });
      }

      if (this.field?.key == "target_date_time" && toMinutes % 15 !== 0) {
        return this.formControl.setErrors({ fiveMintues: true });
      }

      if (fromDateFromMoment.isValid() || toDateToMoment.isValid()) {
        if(fromMinutes % 15 === 0 && toMinutes % 15 === 0) {
          if (this.field.key == "start_date_time") {
            if (fromDateFormat.isAfter(toDateFormat)) {
              this.formControl.setErrors({ firstGreaterThan: true });
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
          }
          
          if(this.field.key == "target_date_time") {
            if (toDateFormat.isBefore(fromDateFormat)) {
              this.formControl.setErrors({ secondLesserThan: true });
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
          }
  
          
          if(this.field.key == "start_date_time"){
            const currentDate = moment();
            if (daysCount === 0 && fromDateFormat.isSame(currentDate, 'day')){
              if(!(fromDateFromMoment.isAfter(moment()))) {
                this.formControl.setErrors({ maxHours: true });
              } 
            }  
          }
          
  
          if (fromDateFromMoment.isValid() && toDateToMoment.isValid()) {
  
             // Parse the start and end dates
             let fromTime: Date;
             if (typeof this.fromTime === 'string') {
                 fromTime = new Date(this.fromTime);
             } else {
                 fromTime = this.fromTime;
             }
             
             let toTime: Date;
             if (typeof this.toTime === 'string') {
                 toTime = new Date(this.toTime);
             } else {
                 toTime = this.toTime;
             }         


      // Calculate the difference in milliseconds
      const differenceInMs = Math.abs(toTime.getTime() - fromTime.getTime());

      // Convert milliseconds to hours and minutes
      const hours = Math.floor(differenceInMs / (1000 * 60 * 60));
      const minutes = Math.floor((differenceInMs % (1000 * 60 * 60)) / (1000 * 60));
      let hourwithMinute = `${hours}.${minutes}`

      if(hours < 1){
        this.formControl.setErrors({ minimumHours: true });
      }

      let user_data:any = sessionStorage.getItem('user_data')
      let data = JSON.parse(user_data)
      this.maxWorkHours = data.job_post_Config.dispatch_maximum_work_hours_allowed

      if(hourwithMinute > this.maxWorkHours){
        this.formControl.setErrors({ maximumHours: true });
      }

      // Format the result
      if(!this.model.isEdit || !this.isFirstLoad){
        const formattedTime = `${hours} hrs : ${minutes} mins`;

                    this.field.formControl.parent.controls[
                      this.field.props.childKey1
                    ].setValue(formattedTime);

        }
        this.isFirstLoad = false;

          }
        } else {
          console.warn("Please select valid start and end minutes");
        }
      } else {
        console.warn("Please select valid start and end date and time");
      }
    }
    else  if (this.field.props?.dispatchCompare == true) {

      let fromTime = this.fromTime
      let toTime = this.toTime

      const format = "HH:mm"; 
      let fromDate = moment(moment(fromTime).local(), format);

      let toDate: any;

      if(toTime == undefined) {
        toDate = undefined
      } else {
        toDate = moment(moment(toTime).local(), format);
      }

      let StartDate = fromDate.format("YYYY-MM-DD");
      let NormalDate = toDate?.format("YYYY-MM-DD");


      const fromDateFormat = moment(
        fromDate,
        "ddd MMM DD YYYY HH:mm:ss [GMT]ZZ"
      );
      
      const timeFromString = fromDateFormat.format("h:mm A");
      const toDateFormat = moment(toDate, "ddd MMM DD YYYY HH:mm:ss [GMT]ZZ");
      const timeToString = toDateFormat.format("h:mm A");

      const fromDateFromMoment = moment(timeFromString, "h:mm A");
      const toDateToMoment = moment(timeToString, "h:mm A");

      let daysCount = moment(NormalDate).diff(StartDate, "days");
     
   
      const fromMinutes = fromDateFromMoment.minutes();
      const toMinutes = toDateToMoment.minutes();

      if (this.field?.key == "start_date_time" && fromMinutes % 15 !== 0) {
        return this.formControl.setErrors({ fiveMintues: true });
      }

      if (this.field?.key == "target_date_time" && toMinutes % 15 !== 0) {
        return this.formControl.setErrors({ fiveMintues: true });
      }

      if (fromDateFromMoment.isValid() || toDateToMoment.isValid()) {
        if(fromMinutes % 15 === 0 && toMinutes % 15 === 0) {
          if (this.field.key == "start_date_time") {
            if (fromDateFormat.isAfter(toDateFormat)) {
              this.formControl.setErrors({ firstGreaterThan: true });
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
          }
          
          if(this.field.key == "target_date_time") {
            if (toDateFormat.isBefore(fromDateFormat)) {
              this.formControl.setErrors({ secondLesserThan: true });
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
          }
  
          
          if(this.field.key == "start_date_time"){
            const currentDate = moment();
            if (daysCount === 0 && fromDateFormat.isSame(currentDate, 'day')){
              if(!(fromDateFromMoment.isAfter(moment()))) {
                this.formControl.setErrors({ maxHours: true });
              } 
            }  
          }
          
  
          if (fromDateFromMoment.isValid() && toDateToMoment.isValid()) {
  
             // Parse the start and end dates
             let fromTime: Date;
             if (typeof this.fromTime === 'string') {
                 fromTime = new Date(this.fromTime);
             } else {
                 fromTime = this.fromTime;
             }
             
             let toTime: Date;
             if (typeof this.toTime === 'string') {
                 toTime = new Date(this.toTime);
             } else {
                 toTime = this.toTime;
             }         


      // Calculate the difference in milliseconds
      const differenceInMs = Math.abs(toTime.getTime() - fromTime.getTime());

      // Convert milliseconds to hours and minutes
      const hours = Math.floor(differenceInMs / (1000 * 60 * 60));
      const minutes = Math.floor((differenceInMs % (1000 * 60 * 60)) / (1000 * 60));
      let hourwithMinute = `${hours}.${minutes}`

      if(hours < 1){
        this.formControl.setErrors({ minimumHours: true });
      }

      let user_data:any = sessionStorage.getItem('user_data')
      let data = JSON.parse(user_data)
      this.maxWorkHours = data?.job_post_config?.dispatch_maximum_work_hours_allowed

      if(hourwithMinute > this.maxWorkHours){
        this.formControl.setErrors({ maximumHours: true });
      }

      // Format the result
      if(!this.model.isEdit || !this.isFirstLoad){
        const formattedTime = `${hours} hrs : ${minutes} mins`;

                    this.field.formControl.parent.controls[
                      this.field.props.childKey1
                    ].setValue(formattedTime);

        }
        this.isFirstLoad = false;

          }
        } else {
          console.warn("Please select valid start and end minutes");
        }
      } else {
        console.warn("Please select valid start and end date and time");
      }
    }
    
    else if (this.field.props?.compare == true) {
      console.error("Corporate Customer");
      const format = "HH:mm"; 
      const fromDate = moment(moment(fromTime).local(), format);
      let toDate: any;

      if(toTime == undefined) {
        toDate = undefined
      } else {
        toDate = moment(moment(toTime).local(), format);
      }

      let StartDate = fromDate.format("YYYY-MM-DD");
      let NormalDate = toDate?.format("YYYY-MM-DD");

      // let hoursCount = moment(BusinessTo).diff(moment(BusinessFrom), "hours");
      let hoursCount: any = moment.duration(BusinessTo.diff(BusinessFrom));
      if (BusinessTo.isBefore(BusinessFrom)) {
        hoursCount = moment.duration(BusinessTo.add(1, 'day').diff(BusinessFrom));
      }

      this.totalHours = 0;

      const fromDateFormat = moment(
        fromDate,
        "ddd MMM DD YYYY HH:mm:ss [GMT]ZZ"
      );
      const timeFromString = fromDateFormat.format("h:mm A");
      const toDateFormat = moment(toDate, "ddd MMM DD YYYY HH:mm:ss [GMT]ZZ");
      const timeToString = toDateFormat.format("h:mm A");

      const jobBusinessFromMoment = moment(jobBusinessFrom, "h:mm A")
      const jobBusinessToMoment = moment(jobBusinessTo, "h:mm A")
      const jobBusinessToMomentPM = moment(jobBusinessTo, "h:mm A").add(1, 'day')
      const fromDateFromMoment = moment(timeFromString, "h:mm A");
      const fromDateFromMomentAM = moment(timeFromString, "h:mm A").add(1, 'day')
      const toDateToMoment = moment(timeToString, "h:mm A");
      const toDateToMomentPM = moment(timeToString, "h:mm A").add(1, 'day')
      let format24 = "hh:mm A";
      let formattedBFTime = jobBusinessFromMoment.format(format24);
      let formattedBTTime = jobBusinessToMoment.format(format24);
      let formattedTimeTo = toDateToMoment.format(format24);
      let formattedTimeFrom = fromDateFromMoment.format(format24);
      let isFromBFAM = formattedBFTime.includes('AM');
      let isFromBTAM = formattedBTTime.includes('AM');
      let isEndAM = formattedTimeTo.includes('AM');
      let isStartAM = formattedTimeFrom.includes('AM');

      console.error(isFromBFAM);
      console.error(isFromBTAM);
      console.error(isStartAM);
      console.error(isEndAM);

      let noofhours: any;
      let finalMinutes: any;
      let staticHours: any;
      const hoursDifference = hoursCount.hours();
      let daysCount = moment(NormalDate).diff(StartDate, "days");
      console.error(daysCount);
      if(isFromBFAM == false && isFromBTAM == true) {
        staticHours = Math.abs((daysCount - 2) * hoursDifference);
      } else {
        if(isFromBFAM == true && isFromBTAM == true) {
          if(daysCount > 1) {
            staticHours = Math.abs((daysCount - 1) * hoursDifference);
          } else {
            staticHours = Math.abs((daysCount) * hoursDifference);
          }
        } else {
          staticHours = Math.abs((daysCount - 1) * hoursDifference);
        }
      }

      const fromMinutes = fromDateFromMoment.minutes();
      const toMinutes = toDateToMoment.minutes();

      if (this.field?.key == "start_date_time" && fromMinutes % 15 !== 0) {
        return this.formControl.setErrors({ fiveMintues: true });
      }

      if (this.field?.key == "target_date_time" && toMinutes % 15 !== 0) {
        return this.formControl.setErrors({ fiveMintues: true });
      }

      if (fromDateFromMoment.isValid() && toDateToMoment.isValid()) {
        if(fromMinutes % 15 === 0 && toMinutes % 15 === 0) {
          if (this.field.key == "start_date_time") {
            if (fromDateFormat.isAfter(toDateFormat)) {
              this.formControl.setErrors({ firstGreaterThan: true });
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
          }
          
          if(this.field.key == "target_date_time") {
            if (toDateFormat.isBefore(fromDateFormat)) {
              this.formControl.setErrors({ secondLesserThan: true });
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
          }
  
          if(this.field.key == "start_date_time" && isFromBFAM == false && isFromBTAM == false){
            if(isStartAM == true) {
              if (
                !(fromDateFromMomentAM.isSameOrAfter(jobBusinessFromMoment) &&
                fromDateFromMoment.isBefore(jobBusinessToMomentPM))
              ) {
                this.formControl.setErrors({ invalidTo: true });
              }
            } else {
              if (
                !(fromDateFromMoment.isSameOrAfter(jobBusinessFromMoment) &&
                fromDateFromMoment.isBefore(jobBusinessToMomentPM))
              ) {
                this.formControl.setErrors({ invalidTo: true });
              }
            }
          }
          else if(this.field.key == "start_date_time" && isFromBFAM == true && isFromBTAM == true){
            if(isStartAM == false) {
              if (
                !(fromDateFromMomentAM.isSameOrAfter(jobBusinessFromMoment) &&
                fromDateFromMoment.isBefore(jobBusinessToMomentPM))
              ) {
                this.formControl.setErrors({ invalidTo: true });
              }
            } else {
              if (
                !(fromDateFromMoment.isSameOrAfter(jobBusinessFromMoment) &&
                fromDateFromMoment.isBefore(jobBusinessToMomentPM))
              ) {
                this.formControl.setErrors({ invalidTo: true });
              }
            }
          }
          else if(this.field.key == "start_date_time" && isFromBFAM == false){
            if(isStartAM == true) {
              if (
                fromDateFromMomentAM.isSameOrAfter(jobBusinessFromMoment) &&
                fromDateFromMoment.isBefore(jobBusinessToMomentPM)
              ) {
                this.formControl.setErrors({ invalidTo: true });
              }
            } else {
              if (
                !(fromDateFromMoment.isSameOrAfter(jobBusinessFromMoment) &&
                fromDateFromMoment.isBefore(jobBusinessToMomentPM))
              ) {
                this.formControl.setErrors({ invalidTo: true });
              }
            }
          }
          else if(this.field.key == "start_date_time"){
            const currentDate = moment();
            if (daysCount === 0 && fromDateFormat.isSame(currentDate, 'day')){
              if(!(fromDateFromMoment.isAfter(moment()))) {
                this.formControl.setErrors({ maxHours: true });
              } else {
                if (
                  !(fromDateFromMoment.isSameOrAfter(jobBusinessFromMoment) &&
                  fromDateFromMoment.isBefore(jobBusinessToMoment))
                ) {
                  this.formControl.setErrors({ invalidFrom: true });
                }
              }
            } else {
              if (
                !(fromDateFromMoment.isSameOrAfter(jobBusinessFromMoment) &&
                fromDateFromMoment.isBefore(jobBusinessToMoment))
              ) {
                this.formControl.setErrors({ invalidFrom: true });
              }
            }
          }
          else if(this.field.key == "target_date_time" && isFromBFAM == false && isFromBTAM == false){
            if(isEndAM == true) {
              if (
                !(toDateToMoment.isAfter(jobBusinessFromMoment) &&
                toDateToMoment.isSameOrBefore(jobBusinessToMomentPM))
              ) {
                this.formControl.setErrors({ invalidTo: true });
              } 
            } 
            else {
              const toTime = moment(toDateToMomentPM.format("hh:mm A"), "hh:mm A");
              const jobBusinessFromTime = moment(jobBusinessFromMoment.format("hh:mm A"), "hh:mm A");
              const jobBusinessToTime = moment(jobBusinessToMomentPM.format("hh:mm A"), "hh:mm A");
              if (toTime.isValid() && jobBusinessFromTime.isValid() && jobBusinessToTime.isValid()) {
                  const toTimeHourMinute = toTime.format("HH:mm");
                  const jobBusinessFromTimeHourMinute = jobBusinessFromTime.format("HH:mm");
                  const jobBusinessToTimeHourMinute = jobBusinessToTime.format("HH:mm");
                  if (toTimeHourMinute > jobBusinessToTimeHourMinute && toTimeHourMinute <= jobBusinessFromTimeHourMinute) {
                    this.formControl.setErrors({ invalidTo: true });
                  } 
              }
            }
          }
          else if(this.field.key == "target_date_time" && isFromBFAM == true && isFromBTAM == true){
            if(isEndAM == false) {
              if (
                !(toDateToMoment.isAfter(jobBusinessFromMoment) &&
                toDateToMoment.isSameOrBefore(jobBusinessToMomentPM))
              ) {
                this.formControl.setErrors({ invalidTo: true });
              } 
            } 
            else {
              const toTime = moment(toDateToMomentPM.format("hh:mm A"), "hh:mm A");
              const jobBusinessFromTime = moment(jobBusinessFromMoment.format("hh:mm A"), "hh:mm A");
              const jobBusinessToTime = moment(jobBusinessToMomentPM.format("hh:mm A"), "hh:mm A");
              if (toTime.isValid() && jobBusinessFromTime.isValid() && jobBusinessToTime.isValid()) {
                  const toTimeHourMinute = toTime.format("HH:mm");
                  const jobBusinessFromTimeHourMinute = jobBusinessFromTime.format("HH:mm");
                  const jobBusinessToTimeHourMinute = jobBusinessToTime.format("HH:mm");
                  if (toTimeHourMinute > jobBusinessToTimeHourMinute && toTimeHourMinute <= jobBusinessFromTimeHourMinute) {
                    this.formControl.setErrors({ invalidTo: true });
                  } 
              }
            }
          }
          else if(this.field.key == "target_date_time" && isFromBFAM == false){
            if(isEndAM == false) {
              if (
                !(toDateToMoment.isAfter(jobBusinessFromMoment) &&
                toDateToMoment.isSameOrBefore(jobBusinessToMomentPM))
              ) {
                this.formControl.setErrors({ invalidTo: true });
              } 
            } else {
              if (
                !(toDateToMomentPM.isAfter(jobBusinessFromMoment) &&
                toDateToMomentPM.isSameOrBefore(jobBusinessToMomentPM))
              ) {
                this.formControl.setErrors({ invalidTo: true });
              } 
            }
          }
          else if(this.field.key == "target_date_time"){
            if (
              !(toDateToMoment.isAfter(jobBusinessFromMoment) &&
              toDateToMoment.isSameOrBefore(jobBusinessToMoment))
            ) {
              this.formControl.setErrors({ invalidTo: true });
            } 
          }
  
          let fromMinutes = fromDate?.get("minute");
          let toMinutes = toDate?.get("minute");
          let fromHours = moment(fromTime).get("hours");
          let toHours = moment(toTime).get("hours");
  
          if (fromDateFromMoment.isValid() && toDateToMoment.isValid()) {
  
            // if (fromDateFromMoment.isSameOrBefore(toDateToMoment)) {
  
            const businessFromParts = this.BusinessFrom.split(':');
            const businessFromHours = parseInt(businessFromParts[0]);
            const businessFromMinutes = parseInt(businessFromParts[1]);
  
            const businessToParts = this.BusinessTo.split(':');
            const businessToHours = parseInt(businessToParts[0]);
            const businessToMinutes = parseInt(businessToParts[1]);
           // const a=businessToHours*60+businessToMinutes
            const b = businessFromHours * 60 + businessFromMinutes
            const b1 = businessToHours * 60 + businessToMinutes-(businessFromHours * 60 + businessFromMinutes)
            console.log("hours",b1)
            const startDate = new Date();
            const startDate1 = new Date();
           
            startDate.setHours(fromHours,fromMinutes, 0, 0); 
            startDate1.setHours(toHours,toMinutes, 0, 0); 
            const endDate = new Date();
            const endDate1 = new Date();
          
            endDate.setHours(parseInt(businessToParts[0], 10), parseInt(businessToParts[1], 10), 0, 0);
            endDate1.setHours(parseInt(businessFromParts[0], 10), parseInt(businessFromParts[1], 10), 0, 0);
            const t1 = startDate1.getTime() - endDate1.getTime();
            const t2 = endDate1.getTime() - startDate1.getTime();
            const t = endDate.getTime() - startDate.getTime();
            if (t1 < 0) {
              console.log("j")
              startDate1.setDate(startDate1.getDate() + 1); // Add 1 day to handle next day time
            }
            if((isFromBFAM == true && isFromBTAM == true && toDateToMoment.isAfter(jobBusinessToMoment)) ||(isFromBFAM == false && isFromBTAM == false && toDateToMoment.isAfter(jobBusinessToMoment)) ) {
              if (t2 < 0) {
                console.log("j")
                startDate1.setDate(startDate1.getDate() + 1); // Add 1 day to handle next day time
              }
            }
            if (t < 0) {
              endDate.setDate(endDate.getDate() + 1); // Add 1 day to handle next day time
            }
            const timeDifference = endDate.getTime() - startDate.getTime();
            const timeDifference1 = endDate1.getTime() - startDate1.getTime();
            const a = timeDifference / (1000 * 60 * 60);
            const a1 = timeDifference1 / (1000 * 60 * 60);
            if(daysCount == 0) {
              finalMinutes = toHours * 60 + toMinutes - (fromHours * 60 + fromMinutes);
              noofhours = Math.floor(finalMinutes / 60);
              finalMinutes %= 60;
            } else if(daysCount == 1 && b1 < 0) {
              let hoursDifferenceNew: any;
              let minutesDifferenceNew: any;
              let hoursCount: any = moment(toDateToMoment).diff(moment(fromDateFromMoment));
              if(hoursCount == 0) {
                hoursDifferenceNew = 24
                minutesDifferenceNew = moment(toDateToMoment).diff(moment(fromDateFromMoment), 'minutes') % 60;
              } else if(hoursCount > 0) {
                hoursDifferenceNew = 24 + 1
                minutesDifferenceNew = moment(toDateToMoment).diff(moment(fromDateFromMoment), 'minutes') % 60;
              } else {
                if (toDateToMoment.isBefore(fromDateFromMoment)) {
                  hoursCount = moment.duration(toDateToMoment.add(1, 'day').diff(fromDateFromMoment));
                }
                hoursDifferenceNew = hoursCount?.hours();
                minutesDifferenceNew = hoursCount?.minutes();
              }
              finalMinutes = hoursDifferenceNew*60 + minutesDifferenceNew;
              noofhours = Math.floor(finalMinutes / 60);//(b- (toHours * 60 + toMinutes))
              finalMinutes %= 60;
            //   let hoursCount: any = moment(toDateToMoment).diff(moment(fromDateFromMoment));
  
            // console.log("count",hoursCount)
            //   if (toDateToMoment.isBefore(fromDateFromMoment)) {
            //     hoursCount = moment.duration(toDateToMoment.add(1, 'day').diff(fromDateFromMoment));
            //   }
            //   const hoursDifference = hoursCount?.hours();
            //   const minutesDifference = hoursCount?.minutes();
            //   finalMinutes = hoursDifference*60 + minutesDifference;
            //   noofhours = Math.floor(finalMinutes / 60);//(b- (toHours * 60 + toMinutes))
            //   finalMinutes %= 60;
            } else if (daysCount == 1&& b1 > 0) {
              const dummy= Math.abs(a) + Math.abs(a1)
                console.log(dummy)
                finalMinutes = this.convertHoursAndMinutesToMinutes(dummy) 
                noofhours = Math.floor(finalMinutes / 60);//(b- (toHours * 60 + toMinutes))
                console.log("hours",finalMinutes)
                finalMinutes %= 60;
            } else if(daysCount > 1 && isFromBFAM == true && isFromBTAM == true) {
              const jobBusinessToMomentPM = moment(jobBusinessToMoment, "h:mm A").add(1, 'day')
              const minutesDifferenceNew = moment(jobBusinessToMomentPM).diff(moment(fromDateFromMoment), 'minutes');
              let newhours2: any;
              let h2: any;
              let newhours1: any;
              let h1: any;
              if (toDateToMoment.isAfter(jobBusinessFromMoment)) {
                console.log("yep")
                const minutesDifferenceNew2 = moment(jobBusinessToMomentPM).diff(moment(jobBusinessFromMoment), 'minutes');
                let a2:any=minutesDifferenceNew2/60
                newhours2 = parseInt(a2)
                h2 = a2 - Math.floor(a2);
                const minutesDifferenceNew1 = moment(toDateToMoment).diff(moment(jobBusinessFromMoment), 'minutes'); //23
                let a1:any=minutesDifferenceNew1/60
                newhours1 =  parseInt(a1)
                h1=a1- Math.floor(a1);
              } else{
                console.log("Nope")
                let daa = moment(jobBusinessFromMoment).subtract(1, 'days');
                const minutesDifferenceNew1 = moment(toDateToMoment).diff(moment(daa), 'minutes'); //23
                let a1:any=minutesDifferenceNew1/60
                newhours1 =  parseInt(a1)
                h1=a1- Math.floor(a1);
              }
              let a:any=minutesDifferenceNew/60
              let newhours =  parseInt(a)             
              let h=a- Math.floor(a);
              // finalMinutes = this.convertHoursAndMinutesToMinutes(dummy)
              // noofhours = Math.floor(finalMinutes / 60);
              // noofhours = noofhours + (newhours2);
              noofhours = (newhours1 || 0) + (newhours || 0) + (newhours2 || 0);
              finalMinutes =Math.round(h*60 || 0)+Math.round(h1*60 || 0)+Math.round(h2*60 || 0) 
              console.log(noofhours, finalMinutes);
              
            } else if(daysCount > 1 && isFromBFAM == false && isFromBTAM == false) {
              const minutesDifferenceNew = moment(jobBusinessToMoment).diff(moment(fromDateFromMoment), 'minutes');
              let newhours2: any;
              let h2: any;
              let newhours1: any;
              let h1: any;
                console.log("yep")
                const jobBusinessToMomentPM = moment(jobBusinessToMoment, "h:mm A").add(1, 'day')
                const minutesDifferenceNew2 = moment(jobBusinessToMomentPM).diff(moment(jobBusinessFromMoment), 'minutes');
                let a2:any=minutesDifferenceNew2/60
                newhours2 = parseInt(a2)
                h2 = a2 - Math.floor(a2);
                const toDateToMomentPM = moment(toDateToMoment, "h:mm A").add(1, 'day')
                const minutesDifferenceNew1 = moment(toDateToMomentPM).diff(moment(jobBusinessFromMoment), 'minutes'); //23
                let a1:any=minutesDifferenceNew1/60
                newhours1 =  parseInt(a1)
                h1=a1- Math.floor(a1);
                // console.log("Nope")
                // let daa = moment(jobBusinessFromMoment).subtract(1, 'days');
                // const minutesDifferenceNew1 = moment(toDateToMoment).diff(moment(daa), 'minutes'); //23
                // let a1:any=minutesDifferenceNew1/60
                // newhours1 =  parseInt(a1)
                // h1=a1- Math.floor(a1);
              let a:any=minutesDifferenceNew/60
              let newhours =  parseInt(a)             
              let h=a- Math.floor(a);
              // finalMinutes = this.convertHoursAndMinutesToMinutes(dummy)
              // noofhours = Math.floor(finalMinutes / 60);
              // noofhours = noofhours + (newhours2);
              noofhours = (newhours1 || 0) + (newhours || 0) + (newhours2 || 0);
              finalMinutes =Math.round(h*60 || 0)+Math.round(h1*60 || 0)+Math.round(h2*60 || 0) 
              console.log(noofhours, finalMinutes);
              // const dummy= Math.abs(a) + Math.abs(a1)
              // finalMinutes = this.convertHoursAndMinutesToMinutes(dummy)
              // noofhours = Math.floor(finalMinutes / 60);              
              // noofhours = noofhours + (staticHours - hoursDifference);
              // // finalMinutes %= 60;
              // finalMinutes = Math.round(finalMinutes % 60);
            } else if(daysCount > 1) {
              const dummy= Math.abs(a) + Math.abs(a1)
              finalMinutes = this.convertHoursAndMinutesToMinutes(dummy)
              noofhours = Math.floor(finalMinutes / 60);
              noofhours += staticHours;
              finalMinutes %= 60;
            } else {
              console.warn("Im come from Else")
            }
            
            if(isFromBFAM == false && isFromBTAM == false && isStartAM == false && isEndAM == false) {
              console.error("1");
              noofhours = (noofhours * 60)
              const a:any = noofhours/60
              noofhours =  parseInt(a)
              let c:any=finalMinutes/60
              noofhours=noofhours+ parseInt(c)
              let h=c - Math.floor(c);
              let result: number = Math.round(h * 100);
              result /= 100; 
              finalMinutes=Math.ceil(result * 60)

              // const hoursDiff = jobBusinessFromMoment.diff(jobBusinessToMoment, "minutes");
              // noofhours = (noofhours * 60) - hoursDiff
              // const a:any = noofhours/60
              // noofhours =  parseInt(a)
              // let b=finalMinutes * daysCount
              // finalMinutes=b
              // let c:any=b/60
              // noofhours=noofhours+ parseInt(c)
              // let h=c - Math.floor(c);
              // let result: number = Math.round(h * 100);
              // result /= 100; 
              // finalMinutes=Math.ceil(result * 60)
            } else if(isFromBFAM == false && isFromBTAM == false && ((isStartAM == false && isEndAM == true) || (isStartAM == true && isEndAM == false) || (isStartAM == true && isEndAM == true) || (isStartAM == false && isEndAM == false))) {
              console.error("2");
              // const hoursDiff = jobBusinessFromMoment.diff(jobBusinessToMoment, "minutes");
              //  finalMinutes=finalMinutes + (hoursDiff *daysCount)
              noofhours = (noofhours * 60)
              const a:any = noofhours/60
              noofhours =  parseInt(a)
              // let b=finalMinutes -(hoursDiff*daysCount)
              // finalMinutes=b
              let c:any=finalMinutes/60
              noofhours=noofhours+ parseInt(c)
              let h=c - Math.floor(c);
              let result: number = Math.round(h * 100);
              result /= 100; 
              finalMinutes=Math.ceil(result * 60)
            } else if(isFromBFAM == true && isFromBTAM == true && isStartAM == true && isEndAM == true) {
              console.error("3");
              // const hoursDiff = jobBusinessFromMoment.diff(jobBusinessToMoment, "minutes");
              // noofhours = (noofhours * 60) - hoursDiff
              // const a:any = noofhours/60
              // noofhours =  parseInt(a)
              // let b=finalMinutes * daysCount
              // finalMinutes=b
              // let c:any=b/60
              // noofhours=noofhours+ parseInt(c)
              // let h=c - Math.floor(c);
              // let result: number = Math.round(h * 100);
              // result /= 100; 
              // finalMinutes=Math.ceil(result * 60)
              noofhours = (noofhours * 60)
              const a:any = noofhours/60
              noofhours =  parseInt(a)
              // let b=finalMinutes -(hoursDiff*daysCount)
              // finalMinutes=b
              let c:any=finalMinutes/60
              noofhours=noofhours+ parseInt(c)
              let h=c - Math.floor(c);
              let result: number = Math.round(h * 100);
              result /= 100; 
              finalMinutes=Math.ceil(result * 60)
            } else if(isFromBFAM == true && isFromBTAM == true && ((isStartAM == true && isEndAM == false) || (isStartAM == false && isEndAM == true) || (isStartAM == true && isEndAM == true) || (isStartAM == false && isEndAM == false))) {
              console.error("4");
              // const hoursDiff = jobBusinessFromMoment.diff(jobBusinessToMoment, "minutes");
              //  finalMinutes=finalMinutes + (hoursDiff *daysCount)
              noofhours = (noofhours * 60)
              const a:any = noofhours/60
              noofhours =  parseInt(a)
              // let b=finalMinutes -(hoursDiff*daysCount)
              // finalMinutes=b
              let c:any=finalMinutes/60
              noofhours=noofhours+ parseInt(c)
              let h=c - Math.floor(c);
              let result: number = Math.round(h * 100);
              result /= 100; 
              finalMinutes=Math.ceil(result * 60)
            } else {
              console.error("5");
              console.warn("-1 is not apply")
            }
  
            if (noofhours + this.model.addition_work_hours < 1) {
              this.formControl.setErrors({ minimumHours: true });
              return;
            }
  
            // let formattedTime = `${(noofhours + this.model.addition_work_hours)
            //   .toString()
            //   .padStart(2, "0")}:${finalMinutes.toString().padStart(2, "0")}`;
  
            let formattedTime = `${(noofhours)
              .toString()
              .padStart(2, "0")} hrs : ${finalMinutes.toString().padStart(2, "0")} mins`;
  
              // if (isNaN(Date.parse(formattedTime))) {
              //   formattedTime = '00:00';
              // }
  
              sessionStorage.setItem('estimatedHours', formattedTime)
  
            this.field.formControl.parent.controls[
              this.field.props.childKey1
            ].setValue(formattedTime);
            // } else {
            //   this.formControl.setErrors({ lesserThan: true });
            // }
  
          }
          
          // else {
          //   this.error = null;
          //   this.formControl.setErrors(null);
          //   if (this.field.childKey) {
          //     this.error = null
          //     this.formControl.parent.controls[this.field.childKey].setErrors(null);
          //   }
          //   if (this.field.parentKey) {
          //     this.error = null
          //     this.formControl.parent.controls[this.field.parentKey].setErrors(
          //       null
          //     );
          //   }
          // }
        } else {
          console.warn("Please select valid start and end minutes");
        }
      } else {
        console.warn("Please select valid start and end date and time");
      }
    } else {
      console.warn(
        "Start and End time is within business hours around 9 AM to 6 PM"
      );
    }

    // if the date is past throws the error
    if(this.model[this.field.key] !=undefined){
      const dateToCompare = moment(this.model[this.field.key]);
      const currentDate = moment();

      // Check if 'yourDate' is in the past compared to the current date
      if (dateToCompare.isBefore(moment())) {
        this.error=this.field.validation?.messages.errormsg
        this.field.formControl.setErrors({"invalid" : true})
      } else {
        console.log('The date is in the future or is today.');
      }
    }

    if (
      this.formControl.errors &&
      this.formControl.errors.matDatetimePickerMin &&
      this.formControl.errors.matDatetimePickerMin.min
    ) {
      this.formControl.setErrors({ maxHours: true });
    }
  }

  convertHoursAndMinutesToMinutes(value: number): number {
    const hours = Math.floor(value);
    const mi= (value - hours) ;
    const minutes=mi*60
    return hours * 60 + minutes;
  }

}
