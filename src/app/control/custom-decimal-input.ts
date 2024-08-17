import { ChangeDetectorRef, Component, EventEmitter, OnInit, Output } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { FieldType } from "@ngx-formly/core";
import * as moment from "moment";
import { DataService } from "../services/data.service";

@Component({
  selector: "app-custom-decimal-input",
  template: `
  <style>
       ::ng-deep.mat-mdc-form-field-icon-prefix, .mat-mdc-form-field-icon-suffix {
        padding: 0 4px 0 0;
        width: max-content !important;
    }

    .span.ng-tns-c1205077789-36 {
      vertical-align: text-top;
  }
    </style>
    <mat-form-field class="numbers">
      <mat-label [style.margin-left]="this.props.labelshow ? '20px' : '0'">{{ this.label }}</mat-label>
      <span matPrefix *ngIf="this.opt.show_prefix">{{ prefix }}</span>
      <input
        matInput
        type="number"
        onlyDecimal
        [placeholder]="this.opt.placeholder"
        [required]="required"
        [readonly]="readonly"
        #input
        [formlyAttributes]="field"
        [formControl]="FormControl"
        (input)="onModelChange($event)"
      />
      <mat-error *ngIf="required">{{ this.validationError }}</mat-error>
    </mat-form-field>
    <div *ngIf="!(this.form.value.addition_work_hours >= 0 && this.form.value.addition_work_hours <= 6) && showNumberMsg === true" style="font-size: 11px; color: red;">
    Additional hours should be between 0 to 6
</div>
      <div *ngIf="showDateMsg" style="font-size: 11px; color: black;">
        Your working end time is greater than business end time so your end date & time is {{this.showDataInPop.format("YYYY-MM-DD hh:mm A")}}
    </div>
    <div>
      <mat-checkbox (change)="checkbox($event)" [(ngModel)]="check"
    *ngIf="this.form.value.addition_work_hours >= 1 && condition == true"
  >
    {{content}}
  </mat-checkbox>
  <div *ngIf="!showErrorMessage">
    <div *ngIf="(form.get('accept_cancellation_concern')?.hasError('required') || 
              form.get('accept_cancellation_concern')?.touched) && this.form.value.addition_work_hours >= 1 " style="font-size: 12px; color: red;">
      This field is required
    </div>
    </div>

    <div *ngIf="show_custom_error" style="font-size: 12px; color: red;">
    {{show_custom_errormsg}}
</div>
</div>

  `,
})
export class CustomDecimalInputType extends FieldType<any> implements OnInit {
  label: any;
  required: any;
  intNumber: any;
  error: any;
  opt: any;
  validationError: any;
  pattern: any;
  check:boolean=false
  showErrorMessage:boolean=false;
  fromTime: any;
  toTime: any;
  jobPrice: any
  readonly: any;
  condition: any;
  content:any= "Yes, I agree to pay for the additional hours if needed"
  date: any;
  prefix: any
  currentField: any
  show_custom_error:boolean = false
  show_custom_errormsg:any
  showDataInPop: any
  numberValidation: any
  showDateMsg: boolean = false
  showNumberMsg: boolean = false
  constructor(private dialog: MatDialog, public dataService: DataService, private cdr: ChangeDetectorRef) {
    super();
  }

  public get FormControl() {
    return this.formControl as FormControl;
  }
  ngOnInit(): void {
    this.opt = this.props;
    this.label = this.field.props?.label;
    this.numberValidation = this.field.props?.numberValidation;
    this.check = this.model.accept_cancellation_concern || false
    this.currentField = this.field

    this.required = this.field.props?.required;
    this.condition = this.field.props?.conditionForNumbers;
    this.form.get("accept_cancellation_concern")?.setErrors({
      required: true
    });
    if (this.condition == true) {
      (this.form as FormGroup).addControl("accept_cancellation_concern", new FormControl(false, Validators.required))
    }
    this.pattern = this.field.props.pattern;
    this.readonly = this.field.props.readonly || false;
    this.validationError = this.field.validation.messages.pattern

    if (this.model.isEdit == true && this.field.props?.conditionForNumbers == true) {
      this.check = this.model.accept_cancellation_concern
      // this.dataService.postData("get-job-price/", this.model._id, this.model).subscribe((res: any) => {
      //   this.jobPrice = res.data.job_price
      // })
    }

    
    if(this.model[this?.field.key]!=null && this.opt.required == true){
      this.formControl.setErrors(null);
      this.showErrorMessage = true
    }

    if(this.model.accept_cancellation_concern == true){
      this.showErrorMessage = true
    }

    if (this.model.isclone == true) {
      this.check = this.model.accept_cancellation_concern
    }



    if (this.currentField.parentKey != "") {
      (this.field.hooks as any).afterViewInit = (f: any) => {
     
        const parentControl = this.form.get(this.currentField.parentKey)

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

      }
    }
    // If additional hours greater than 1,error msg show
    if(this.opt.conditionForNumbers){
      if(this.model.addition_work_hours >= 1 && this.model.accept_cancellation_concern == false){
        this.form.get("accept_cancellation_concern")?.setErrors({
          required:true
        });
        this.model['accept_cancellation_concern']=true

      }

      if(this.model.addition_work_hours == 0){
        (this.form as FormGroup).get('accept_cancellation_concern')?.setValue(false);
        this.model['accept_cancellation_concern']=false
      }
    }

    if(this.opt.check_price && this.model._id!= undefined && this.model[this.field.key] >0 && this.model.isAddHours == true){
      this.dataService.update("get-job-price/", this.model._id, this.model).subscribe((res: any) => {
          this.jobPrice = res.data.job_price
          if (this.jobPrice !=undefined) {
            this.jobPrice =  this.jobPrice.toLocaleString();
           } 
          this.content = "Yes, I agree to pay "+`${this.jobPrice}` +" for the "+ this.model[this.field.key]+" additional hours if needed"
          this.cdr.detectChanges()
          this.model['addition_hours_price']=this.jobPrice
        })
    }

    if(this.opt.model_data){
      const doc = new DOMParser().parseFromString(this.model[this.opt.field_name], 'text/html');
          this.prefix = doc.documentElement.textContent || "";
          this.cdr.detectChanges()
    }

    
  }

  // Function to handle the value of the parent control
  handleParentControlValue(value: any) {
    if (this.opt.parentCollectionName && value!=undefined) {
      this.dataService.getparentdataById(this.opt.parentCollectionName, value).subscribe((res: any) => {
        let data = res.data
        if (data != undefined) {
          const doc = new DOMParser().parseFromString(data[this.opt.field_name], 'text/html');
          this.prefix = doc.documentElement.textContent || "";
          this.cdr.detectChanges()
        }
      })
    }
    if(this.opt.get_model_data && this.model[this.opt.field_name] != undefined){
      const doc = new DOMParser().parseFromString( this.model[this.opt.field_name], 'text/html');
      this.prefix = doc.documentElement.textContent || "";
      this.cdr.detectChanges()
    }
  }

  checkbox(event:any){
    console.warn(event);
    console.warn(this.check);
    const newValue = event.checked;
    this.showErrorMessage = newValue
    if(newValue==true){
      (this.form as FormGroup).get('accept_cancellation_concern')?.setValue(newValue);
      this.model['accept_cancellation_concern']=newValue
      this.form.get("accept_cancellation_concern")?.setErrors(null);
    }else{
      (this.form as FormGroup).get('accept_cancellation_concern')?.setValue(newValue);
      this.form.get("accept_cancellation_concern")?.setErrors({
        required:true
      });
      this.model['accept_cancellation_concern']=newValue
     
    }
    console.warn(newValue);
  }

  onModelChange(value?: any) {
    if (value.target.value >= 0) {
      if (this.field.props?.conditionForNumbers == true) {
        if(value.target.value >= 0 && value.target.value <= 6) {
          console.log("im second if");
          this.showNumberMsg == false
          if (this.model.isEdit == true) {
            let additionalHours = this.model.addition_work_hours < this.form.value.addition_work_hours
            console.warn(additionalHours);
            (this.form as FormGroup).get('accept_cancellation_concern')?.setValue(this.model.accept_cancellation_concern);
          }
  
          if (this.model.isclone == true) {
            if(this.model.addition_work_hours == "" || this.model.addition_work_hours == null || this.model.addition_work_hours == undefined) {
              (this.form as FormGroup).get('accept_cancellation_concern')?.setValue(false);
              this.model['accept_cancellation_concern']=false
            } else {
              let additionalHours = this.model.addition_work_hours < this.form.value.addition_work_hours
              console.warn(additionalHours);
              (this.form as FormGroup).get('accept_cancellation_concern')?.setValue(this.model.accept_cancellation_concern);
              this.model['accept_cancellation_concern']=true
            }
          }
  
          // If additional hours greater than 1,error msg show
          if(this.opt.conditionForNumbers){
            if(this.model.addition_work_hours >= 1 && this.model.accept_cancellation_concern == false){
              this.form.get("accept_cancellation_concern")?.setErrors({
                required:true
              });
            }
  
            if(this.model.addition_work_hours == 0){
              (this.form as FormGroup).get('accept_cancellation_concern')?.setValue(false);
              this.model['accept_cancellation_concern']=false
              this.form.get("accept_cancellation_concern")?.setErrors(
                null
              );
            }
            if(this.model.addition_work_hours >= 1){

              this.check = false
              this.model["accept_cancellation_concern"]=false
            }
          }
  
        // const a = sessionStorage.getItem('estimatedHours')
  
        if(this.model.business_hours_from && this.model.business_hours_to) {
        console.error("Corporate Customer Additional Hours");
        const a = this.model.job_estimated_hours
        let estimatedHours: any = a;
        let awhValue = this.model.addition_work_hours;
  
        console.log(a);
        console.log(awhValue);
    
        let [hours, minutes] = estimatedHours?.split(':');
        let estimatedHoursNumeric: any = parseInt(hours, 10) + parseInt(minutes, 10) / 60;
        let finalAns: any;
        finalAns = estimatedHoursNumeric + awhValue;
  
  
        let fromTime = this.model.start_date_time
        let toTime = this.model.target_date_time
        let BusinessFrom = moment(this.model.business_hours_from, 'h:mm A');
        let BusinessTo = moment(this.model.business_hours_to, 'h:mm A');
        let format24 = "hh:mm A";
        let formattedTimeFrom = BusinessFrom.format(format24);
        let formattedTimeTo = BusinessTo.format(format24);
        let isFromAM = formattedTimeFrom.includes('AM');
        let isToAM = formattedTimeTo.includes('AM');
  
        const format = "HH:mm"; 
        let fromDate = moment(moment(fromTime).local(), format);
        let toDate: any;
        let diffHours: any;
  
        if(toTime == undefined) {
          toDate = undefined
        } else {
          toDate = moment(moment(toTime).local(), format);
        }
  
  
        let StartDate = fromDate.format("YYYY-MM-DD");
        let NormalDate = toDate.format("YYYY-MM-DD");
        let fromMinutes =moment(fromTime).get("minutes");
        let toMinutes = moment(toTime).get("minutes");
        let daysCount = moment(NormalDate).diff(StartDate, "days");
  
        if(isFromAM === false) {
          let fromHours: any = moment(fromTime, format24);
          let toHours: any = moment(toTime, format24);
          if (toHours.isBefore(fromHours)) {
            toHours.add(24, 'hours');
          }
          if(daysCount >= 2) {
            let diff = toHours.diff(fromHours, 'hours');
            diffHours = diff - ((daysCount - 1) * 24);
            console.error(diffHours);
          } else {
            diffHours = toHours.diff(fromHours, 'hours');
            console.error(diffHours);
          }
        } else if(isFromAM === true && isToAM === true) {
          let fromHours: any = moment(fromTime, format24);
          let toHours: any = moment(toTime, format24);
          if (toHours.isBefore(fromHours)) {
            toHours.add(24, 'hours');
          }
          if(daysCount >= 2) {
            let diff = toHours.diff(fromHours, 'hours');
            diffHours = diff - ((daysCount - 1) * 24);
            console.error(diffHours);
          } else {
            diffHours = toHours.diff(fromHours, 'hours');
            console.error(diffHours);
          }
        } else {
          if(daysCount == 0 && fromMinutes && toMinutes) {
            let fromHours =moment(fromTime).get("hours");
            let toHours = moment(toTime).get("hours");
            diffHours = toHours - fromHours;
          } else if(daysCount >= 1 && fromMinutes && toMinutes) {
            let fromHours =moment(fromTime).get("hours");
            let toHours = moment(toTime).get("hours");
            diffHours = toHours - fromHours;
          } else if(daysCount >= 1 && fromMinutes) {
            let fromHours =moment(fromTime).get("hours");
            let toHours = moment(toTime).get("hours");
            diffHours = (toHours - fromHours) - 1;
          } else if(daysCount == 0 && fromMinutes) {
            let fromHours =moment(fromTime).get("hours");
            let toHours = moment(toTime).get("hours");
            diffHours = (toHours - fromHours) - 1;
          } else {
            let fromHours =moment(fromTime).get("hours");
            let toHours = moment(toTime).get("hours");
            diffHours = toHours - fromHours;
          }
        }
  
        let hoursCount: any;
        let hoursDifference: any;
        if(isFromAM === false) {
          hoursCount = moment(BusinessTo).diff(moment(BusinessFrom));
          if (BusinessTo.isBefore(BusinessFrom)) {
            hoursCount = moment.duration(BusinessTo.add(1, 'day').diff(BusinessFrom));
          }
          if(daysCount >= 2) {
          hoursDifference = hoursCount.hours();
          } else if(daysCount == 1) {
            hoursDifference = 0;
          } else {
            hoursDifference = hoursCount.hours();
          }
        } else if(isFromAM === true && isToAM === true) {
          hoursCount = moment(BusinessTo).diff(moment(BusinessFrom));
          if (BusinessTo.isBefore(BusinessFrom)) {
            hoursCount = moment.duration(BusinessTo.add(1, 'day').diff(BusinessFrom));
          }
          if(daysCount >= 2) {
          hoursDifference = hoursCount.hours();
          } else if(daysCount == 1) {
            hoursDifference = 0;
          } else {
            hoursDifference = hoursCount.hours();
          }
        } else {
          hoursCount = moment(BusinessTo).diff(moment(BusinessFrom), 'hours');
          hoursDifference = hoursCount;
        }
  
        let noofhours: any;
        if(isFromAM === true && isToAM === true) {
          noofhours = (daysCount * hoursDifference) - hoursDifference;
        } else if(isFromAM === false && isToAM === false) {
          noofhours = (daysCount * hoursDifference) - hoursDifference;
        } else {
          noofhours = daysCount * hoursDifference;
        }
  
        let totalHour = diffHours + noofhours
  
        let finalLastHours = totalHour + this.model.addition_work_hours
    
        let finalHours = Math.floor(finalLastHours);
        
        let formattedHours = finalHours.toString().padStart(2, '0');
        let finalResult = `${formattedHours}:${minutes}`;
    
        // if(this.field.props.childKey1){
        //   this.field.formControl.parent.controls[
        //     this.field.props.childKey1
        //   ].setValue(finalResult);  
        // }
  
        let fromBusinessHours = moment(BusinessFrom).get("hours");
        let toBusinessHours = moment(BusinessTo).get("hours");
        let toEndHours = moment(toTime).get("hours");
        let endBussinessHours = toEndHours + this.model.addition_work_hours;
        if(isFromAM == true && isToAM == true) {
          this.showDateMsg = false
        } else if(isFromAM == false && isToAM == false) {
          this.showDateMsg = false
        } else {
          this.showDateMsg = (endBussinessHours - toBusinessHours) > 1
        }
         if ((endBussinessHours - toBusinessHours) > 1) {
          let addOneDay: any;
            const val = fromBusinessHours + this.model.addition_work_hours;
            if(isFromAM === false && (isToAM === false || isToAM === true)) {
              addOneDay = moment(toTime, "h:mm A").subtract(12, 'hours');
            } else {
              addOneDay = moment(toTime, "h:mm A").add(1, 'day');
            }
            const finalDateAdd = addOneDay.hours(val);
            this.model['additonal_hours']
            if(this.opt.additional_hours_move_next_day){
              this.model['addition_hours_move_next_day']=true
            }
            this.showDataInPop = finalDateAdd
         } else {
          if(this.opt.additional_hours_move_next_day){
            this.model['addition_hours_move_next_day']=false
          }
         }
  
        } else {
        const a = this.model.job_estimated_hours
        let estimatedHours: any = a;
        let awhValue = this.model.addition_work_hours;
    
        let [hours, minutes] = estimatedHours.split(':');
        let estimatedHoursNumeric = parseInt(hours, 10) + parseInt(minutes, 10) / 60;
        let finalAns: any;
        finalAns = estimatedHoursNumeric + awhValue;
  
        let fromTime = this.model.start_date_time
        let toTime = this.model.target_date_time
  
        const fromDate111 = "9:00 AM"
        const toDate111 = "6:00 PM"
        const jobBusinessFromMoment = moment(fromDate111, "h:mm A");
        const jobBusinessToMoment = moment(toDate111, "h:mm A");
        
        const format = "HH:mm"; 
        let fromDate = moment(moment(fromTime).local(), format);
        let toDate: any;
        let fromMinutes =moment(fromTime).get("minutes");
        let toMinutes =moment(toTime).get("minutes");
  
        if(toTime == undefined) {
          toDate = undefined
        } else {
          toDate = moment(moment(toTime).local(), format);
        }
  
        let fromHours =moment(fromTime).get("hours");
        let toHours = moment(toTime).get("hours");
  
        let StartDate = fromDate.format("YYYY-MM-DD");
        let NormalDate = toDate.format("YYYY-MM-DD");
  
        let hoursCount = moment(jobBusinessToMoment).diff(moment(jobBusinessFromMoment), "hours");
        let daysCount = moment(NormalDate).diff(StartDate, "days");
        let noofhours = daysCount * hoursCount;
        let totalHour: any;
  
        if(daysCount == 0 && fromMinutes && toMinutes) {
          totalHour = toHours - fromHours + noofhours
        } else if(daysCount >= 1 && fromMinutes && toMinutes) {
          totalHour = toHours - fromHours + noofhours
        } else if(daysCount == 0 && fromMinutes) {
          totalHour = ((toHours - fromHours) - 1) + noofhours
        } else if(daysCount >= 1 && fromMinutes) {
          totalHour = ((toHours - fromHours) - 1) + noofhours
        } else {
          totalHour = toHours - fromHours + noofhours
        }
  
        let finalLastHours = totalHour + this.model.addition_work_hours
    
        let finalHours = Math.floor(finalLastHours);
        
        let formattedHours = finalHours.toString().padStart(2, '0');
        let finalResult = `${formattedHours}:${minutes}`;
        console.error(finalResult);
    
        // if(this.field.props.childKey1){
        //   this.field.formControl.parent.controls[
        //     this.field.props.childKey1
        //   ].setValue(finalResult);  
        // }
        }
        
        // let totalHours = 0;
        //  if (totalHours >= 2) {
        //   if(this.model.isEdit == true) {
        //     const data:any = confirm(`Your business hours end time is greater than your working end time so your price will higher ${this.jobPrice}!`);
        //   }
        //  }
        } else {
          this.showNumberMsg = true
          this.formControl.setErrors({ invalid: true });
        }
      } else if(this.field.props?.conditionForRateCard == true) {

        if (this.field.props.validateTime == true) {
          if (this.field.parentKey) {
            let a = this.field.parentKey;
            if (this.field.parentKey == "availability_time") {
              this.fromTime = this.model[a].from;
              this.toTime = this.model[this.field.valueKey].to;
              // this.calculateHoursDifference();
            } else {
              this.fromTime = this.model[a];
              this.toTime = this.model[this.field.key];
              // this.calculateHoursDifference();
            }
          } else if (this.field.childKey) {
            let a = this.field.childKey;
            this.toTime = this.model[a];
            this.fromTime = this.model[this.field.key];
            // this.calculateHoursDifference();
          }
        }
        let currentValue = this.fromTime
        let parentVal = this.toTime
        if(currentValue >= parentVal) {
          this.formControl.setErrors({ minValue : true})
        } else {
          this.error = null;
          this.formControl.setErrors(null);
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
        console.log('Outer');
      }


    } else {
      if(this.field.props.numberValidation) {
        this.showNumberMsg = true
      }
      this.formControl.setErrors({ invalid: true });
    }


    if(this.field.array_of_object){
  let data =  this.field.key.split(".").reduce((o:any, i:any) =>
      o[i], this.model
     );
     if(data == null && this.opt.required == true){
      this.formControl.setErrors({ required: true });
     }
    } 
    if(this.model[this?.field.key]==null && this.opt.required == true && this.field.array_of_object == undefined){
      this.formControl.setErrors({ required: true });
    }

    if(this.opt.check_price && this.model.isAddHours == true){
      if( this.formControl.value < this.formControl.defaultValue){
        this.show_custom_error= true
        this.show_custom_errormsg = this.field.validation.messages.errormsg + " "+ this.formControl.defaultValue
        this.formControl.setErrors({ invalid: true });
      } else {
        this.show_custom_error= false
        this.formControl.setErrors(null);
      }


    }


    if(this.opt.accept_min_number){
      if((value.target.value < this.opt.min_number) || (value.target.value > this.opt.max_number)){
        this.formControl.setErrors({ invalid: true });
        return this.field.validation.messages.pattern
      }
    }

      if(this.opt.accept_max_number && value.target.value!=""){
      let user_data:any=sessionStorage.getItem("user_data")
    user_data=JSON.parse(user_data)
    let max_number
    if(this.field.attributes == "nested_object"){
      let data= this.field.data_length.split(".").reduce((o:any, i:any) =>
            {if(o == undefined){
              return
            }else{
           return  o[i]
            } }, user_data);
            max_number = data || 5 
       } else {
        max_number = user_data[this.field.data_length] || 5  //Maximum length configuration in SAAS/ Corporate Customer
       }


      if((value.target.value <= 0) || (value.target.value > max_number)){
        this.formControl.setErrors({ invalid: true });
        this.validationError =  this.field.validation?.messages?.error_msg1+" "+max_number+" "+this.field.validation?.messages?.error_msg2
      }  else {
        this.formControl.setErrors(null);
        
      }
    }

    if (this.opt.check_condition) {
      this.formControl.setErrors(null);
    let item1 :any= value['target'].value
    let item :any
    if(item1!=''){
     item=JSON.parse(item1)
    }
   
    this.formControl.setErrors(null); this.form.get(this.field.key)?.setErrors(null)
      
   

    let id = sessionStorage.getItem(this.opt.parentID)
    this.dataService.getDataById(this.opt.collectionName, id).subscribe((res: any) => {
      let data = res.data
      if (this.model[this.opt.parentKey] == "L1" && item < data.l1_engineer_price) {
        this.validationError = this.field.validation.messages.error + " " + `${data.l1_engineer_price}` + " " + "(Minimum Price)"
        this.form.get(this.field.key)?.setErrors({ required: true })
        this.formControl.setErrors(this.field.validation.messages.pattern);
      } 

      if (this.model[this.opt.parentKey] == "L1" && item  ==data.l1_engineer_price) {
        this.form.get(this.field.key)?.setErrors(null)
        this.formControl.setErrors(null);
        console.log(this.formControl)
      } 

      //  if (this.decimalInput.model[this.decimalInput.opt.parentKey] == "L1" && this.decimalInput.model[this.decimalInput.field.key] == data.l1_engineer_price) {
      //   this.decimalInput.form.get(this.decimalInput.field.key)?.setErrors(null)
      //   this.decimalInput.formControl.setErrors(null);
      // } 

      if (this.model[this.opt.parentKey] == "L2" && item < data.l2_engineer_price) {
        this.validationError = this.field.validation.messages.error + " " + `${data.l2_engineer_price}` + " " + "(Minimum Price)"
        this.form.get(this.field.key)?.setErrors({ required: true })
      } 

      if (this.model[this.opt.parentKey] == "L3" && item < data.l3_engineer_price) {
        this.validationError = this.field.validation.messages.error + " " + `${data.l3_engineer_price}` + " " + "(Minimum Price)"
        this.form.get(this.field.key)?.setErrors({ required: true })
      } 

      
    })

  }

  if(this.opt.compare_amt){
    let item1 :any= value['target'].value
    let item :any
    if(item1!=''){
     item=JSON.parse(item1)
    }
    if(item > this.model[this.opt.compare_field]){
      this.validationError = this.field.validation.messages.error + " " + `${this.model[this.opt.compare_field]}`
        this.form.get(this.field.key)?.setErrors({ required: true })
    }

  }


  if(this.opt.check_price && this.model._id!= undefined && this.model[this.field.key] >0 && this.model.isAddHours == true){
    if(this.model.addition_hours_price !=undefined){
    delete this.model.addition_hours_price
    }
    this.dataService.update("get-job-price/", this.model._id, this.model).subscribe((res: any) => {
        this.jobPrice = res.data.job_price
        this.model['addition_hours_price']=this.jobPrice
        if (this.jobPrice !=undefined) {
          this.jobPrice =   this.jobPrice.toLocaleString();
         } 
        let currencySymbolChar = this.convertHtmlEntityToChar(res.data.currency_symbol);
        this.content = "Yes, I agree to pay "+`${currencySymbolChar}`+" "+`${this.jobPrice}` +" for the "+ this.model[this.field.key]+" additional hours if needed"
        this.cdr.detectChanges()
      })
  }
  }


  convertHtmlEntityToChar(htmlEntity: string): string {
    const doc = new DOMParser().parseFromString(htmlEntity, 'text/html');
    return doc.documentElement.textContent || "";
  }
}