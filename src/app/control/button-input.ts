import { Component, OnInit, AfterViewInit, ViewChild, TemplateRef, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { FieldType, FormlyFieldConfig } from '@ngx-formly/core';
import * as _ from 'lodash';
import { Observable } from 'rxjs';
import { DataService } from '../services/data.service';
import { FormService } from '../services/form.service';
import { DynamicFormComponent } from '../component/dynamic-form/dynamic-form.component';
import { DialogService } from '../services/dialog.service';
import { HttpClient } from '@angular/common/http';
import { v4 as uuidv4 } from 'uuid';
@Component({
 selector: 'button-input',
 template: `
 <style>
 /* .icon{
margin-bottom: 20px;


 } */
 .label {
   font-weight: bold;
   color: #555;
   margin-left:3px;
   margin-right:10px
 }
 .list-item {
   margin-bottom: 10px;
   margin-left:5px
 }
  .storedDate {
   display: grid;
   grid-template-rows: auto auto;
   align-items: center;
 }
  .name-row {
   display: flex;
   align-items: center;
 }
  .bullet-point {
   margin-right: 5px;
 }
 
 .contact-row {
   display: flex;
   align-items: center;
 }
  .contact {
   margin-left: 10px;
 }
  .button-group {
   display: none;
   margin-left: 10px;
 }
  .storedDate:hover .button-group {
   display: inline-block;
 }
  .contact_heading{
   font-weight: normal;
 font-size: 16px;
 font-family: 'PT Sans Narrow';
 color: gray;
 }
  ::ng-deep .ng-select .ng-select-container {
   cursor: default;
   display: flex;
   outline: none;
   overflow: hidden;
   position: relative;
   width: 100%;
   margin-top: -13px !important;
}


 </style>
  <div class=icon style="display:flex">
  <mat-label *ngIf="this.field?.props.show_label!==false"    class="label">{{field.props!['label']}}</mat-label>
<div >
  <ng-select *ngIf="this.field.props.showDropdown == true"
  style="width:680px;margin-left:3px;"
 [dropdownPosition]="'bottom'"
 [bindLabel]="labelProp"
[(ngModel)]="selecteddata"
 [items]="dropdownList"
 [clearSearchOnAdd]="true"
 [multiple]="true"
 [clearable]="clear()"
 placeholder="Select {{field.props!['placeholder']}}"
 [closeOnSelect]="false"
 (change)="onItemSelect($event)"
 
 appearance='outline'
 >


 <ng-template ng-option-tmp let-item="item"  let-item$="item$" let-index="index">
 <input id="item-{{index}}" type="checkbox" [readonly]="item.disabled"   [ngModel]="item$.selected" [disabled]="item.disabled"  [value]="item[this.labelProp]"  [ngModelOptions]="{standalone: true}"/>
 <span style="margin-left:5px;font-style:bold">{{$any(item)[this.labelProp]}}</span>
 </ng-template>





<ng-template ng-multi-label-tmp let-items="items">
<div class="ng-value" *ngFor="let item of items | slice:0:2">
<span class="ng-value-label"> {{$any(item)[this.labelProp]}}</span>
</div>
 <div class="ng-value" *ngIf="items.length > 2">
   <span class="ng-value-label">{{items.length - 2}} more...</span>
 </div>
</ng-template>


 </ng-select>


 </div>
     <button
       [formlyAttributes]="field"
       matTooltip="Add"
       mat-mini-fab
       (click)="onAddButonClick()"
       style="
       margin-left: 30px;
       background-color: #B0B0B0;
       color: white;
       height: 24px;
       width: 24px;
       font-size: 9px;
       line-height: 3;
       vertical-align: middle;"
     >
       <mat-icon>add</mat-icon>
     </button>
   </div>
   <mat-error *ngIf="this.field.props.required && !this.formControl.value" style="margin-top:10px;margin-left:4px;">{{field.validation.messages['required']}}</mat-error>
 


<div *ngFor="let item of storedDate ; let i=index " class="list-item" (mouseenter)="toggleButtons(i, true)" (mouseleave)="toggleButtons(i, false)" >
<span class="contact_heading" *ngIf="item.contact_type">{{ item.contact_type}}</span>
<li class="name"  style="color:black">{{ item.first_name }} {{ item.last_name }}</li>
<div style="display: flex;flex-direction: row;margin-left:10px">
<span class="contact"  style="color:black">{{ item.email_id }}, {{get_mobile_number(item)}}</span>
<span style="color:black" *ngIf="item.user_designation_name">, {{item.user_designation_name}}</span>
<span *ngIf="this.field.role_update">, {{item.status == "InActive"?"Deactive":"Active"}}</span>
<div  *ngIf="item.availability_date_time" class="contact"  style="color:black">,{{item.availability_date_time | date : "dd/MM/yyyy , hh:mm a" }}</div>
<span *ngIf="item.showButtons">
 <mat-icon *ngIf="show_delete_icon(item)" (click)="deleteItem(i)">delete</mat-icon>
 <mat-icon (click)="editItem(item)">edit</mat-icon>
</span>
</div>
</div>




<div *ngIf="this.listData" >
<div  class="list-item" *ngFor="let field of  this.listData; let i=index" (mouseenter)="toggleButtons_listdata(i, true)" (mouseleave)="toggleButtons_listdata(i, false)">
<li class="name"  style="color:black">{{field.contact.first_name}} {{field.contact.last_name}}</li>
<div style="display: flex;flex-direction: row;margin-left:10px">
<span class="contact"  style="color:black">{{ field.contact.email_id }}, {{get_system_user_number(field)}}</span>
<span style="color:black" *ngIf="field.user_designation_name">, {{field.user_designation_name}}</span>
<span style="color:black" >, {{field.status == "InActive"?"Deactive":"Active"}}</span>
<span *ngIf="field.showButtons">
<mat-icon  matTooltip={{tooltip}}    (click)="editroleItem(field)">edit</mat-icon>
</span>
</div>
</div>
</div>




<ng-template  #editViewPopup>
<nestedform (onClose)="close($event)" [formName]="formName" [model]="data" [listdata]="listData"></nestedform>
</ng-template>


<ng-template #dialog_box2>
<nestedform (onClose)="close($event)" [formName]="this.field.form_name" [model]="data" ></nestedform>
</ng-template>

<ng-template let-data #dialog_box>
 <div style="height: fit-content;">
   <div style="text-align-last: end">
     <mat-icon  (click)=this.dialogService.closeModal()>close</mat-icon>
   </div>
   <div class="reason">
     <p style="text-align: center;">{{this.field.delete_confirm_message}}
     </p>
   </div>
   <div style="text-align-last: center; width: 100%; margin: 1px 1px 1px -14px;">


     <button style="margin: 5px;" mat-raised-button (click)="yes(data)">
       Yes
     </button>


     <button style="margin: 5px;" mat-button  (click)=this.dialogService.closeModal()>
       No
     </button>
   </div>
 </div>
</ng-template>

 `,


})


// (close)="onItemSelect($event)"


// <div *ngIf="this.listData">
// <div  class="list-item" *ngFor="let field of  this.listData; let i=index">
// <li class="name"  style="color:black">{{field.contact.first_name}} {{field.contact.last_name}}</li>
// <div style="display: flex;flex-direction: row;margin-left:10px">
// <span class="contact"  style="color:black">{{field.contact.email_id}} {{field.contact.mobile_number}}</span>
// </div>
// </div>
// </div>




// <mat-form-field style="width:40%; margin-left:25px" *ngIf="this.field.props.showDropdown == true">
// <mat-label>{{field.props!['label']}}</mat-label>
// <mat-select
// #matSelectInput
//     [formlyAttributes]="field"
//     [formControl]="thisFormControl"
// >
// <mat-option
// *ngFor="let op of this.opt.options"
//   [value]="op[this.valueProp]" (click)="selectionChange(op)"
// >
// <span [innerHTML]="op[this.labelProp]"></span>


// </mat-option>
// </mat-select>
// </mat-form-field>






export class ButtonInput extends FieldType<any> implements OnInit {
 pageHeading: any
 collectionName: any
 mode: any
 label: any
 formName: any
 data:any={}
 public fields!: FormlyFieldConfig[]
 config: any
 onClose = new EventEmitter<any>();
 opt: any;
 // data: any
 currentField: any
 dropdownList = []
 valueProp = "id"
 labelProp = "name"
 dropdown: any
 selecteddata: any
 firstName:any
 lastName:any
 emailId:any
 mobileNumber:any
 button_text:any
 tooltip:any

 public get thisFormControl() {
   return this.formControl as FormControl;
 }






 @ViewChild("editViewPopup", { static: true }) editViewPopup!: TemplateRef<any>;
 @ViewChild("dialog_box", { static: true }) dialog_box!: TemplateRef<any>;
 @ViewChild("dialog_box2", { static: true }) dialog_box2!: TemplateRef<any>;
 storedDate: any[]=[];
 constructor(
   public dialogService: DialogService,
   private httpclient: HttpClient,
   public dataservice: DataService,
   private cf: ChangeDetectorRef,
 ) { super()
   }



   get_data(data:any){
     if(data == undefined) {return}
let item=data.contact.first_name +" "+data.contact.last_name +", "+data.contact.email_id 
return item
   }
  

 ngOnInit(): void {

  if(this.field.parentkey!= "") {
    debugger
    (this.field.hooks as any).afterViewInit = (f:any) => {   
        const parentControl = this.form.get(this.currentField.parentkey)
        parentControl?.valueChanges.subscribe((val:any) =>{
          if(val != undefined && this.field.on_select_parent_key && this.model.parentTrigger === true){
            this.storedDate =[]
            sessionStorage.removeItem(this.field.key)
            this.field.formControl.setValue(null)
          } 
        })}}

 
// if(this.opt.showDropdown == true){
 // if(this.field.props.showDropdown == true){


   this.opt = this.field.props || {};
   this.labelProp = this.opt.labelProp;
   this.valueProp = this.opt.valueProp;
   this.formName = this.field.props?.attributes
   this.currentField = this.field
   this.tooltip=this.field?.tooltip


   if(this.opt?.optionsDataSource?.multifilter!=undefined){
     this.opt.multifilter_condition.conditions.map((res:any)=>{
     
       if(res.value!=undefined && this.field.getdata){
        let value = sessionStorage.getItem(this.field.column)
         res.value=value
       }
    
     })
     let filter_condition={filter:[
       this.opt.multifilter_condition
     ]}
     this.dataservice.getDataByFilter(this.opt?.optionsDataSource?.multifilter,filter_condition).subscribe((res:any)=>{
       // this.dataservice.buildOptions(res.data[0].response, this.opt);
       // this.cf.detectChanges();
       this.dropdownList = res.data[0].response
       if(this.dropdownList != undefined){
         this.dropdownList.forEach((a:any)=>{
           a['name']=a.contact.first_name +" "+a.contact.last_name +", "+a.contact.email_id 
         })

         let model_data =this.model[this.field.key]
       if(this.model[this.field.key] != undefined){
       let array= this.dropdownList.filter(function (obj: any) {
          return model_data.some(function (obj2: any) {
           if(obj._id == obj2.email_id){
             obj['disabled']= true
           }
            return obj._id == obj2.email_id 
          });
        });
        this.selecteddata=array
        this.cf.detectChanges();
        console.log(array)
      }
       }
  
       // this.cf.detectChanges();
       // this.dataservice.buildOptions(res.data, this.opt);


     })
}
// } 





   this.label = this.field.props?.label
   this.formName = this.field.props?.attributes
   this.storedDate=this.model[this.field.key]


   if(this.field.apiCall == true){
     this.storedDate.forEach((a:any)=>{
       a.api_call=true
     })
   }

   console.log(this.storedDate,"hghdsfffffffffff")
   if( this.storedDate?.length!=0 && this.storedDate!=undefined){
     this.field.formControl.setValue(this.storedDate)
     sessionStorage.setItem(this.field.key, JSON.stringify(this.storedDate));
   }


// thisFormControl =this.storedDate
let getData:any =sessionStorage.getItem(this.field.key)
this.storedDate =JSON.parse(getData)

 if(this.listData != undefined){
     let data = [...this.storedDate, ...this.listData]
     this.field.formControl.setValue(data)
 } else{
   this.field.formControl.setValue(this.storedDate)
 }

 }


//   clear(data:any){
// debugger
//   }

clear(){
  // clear symbol based on formaction for project
  let data = sessionStorage.getItem('formAction')
  if(data == "EDIT"){
     return false
  } else {
    return true
  }
}


 ngOnDestroy() {
   console.log("Component will be destroyed");
  sessionStorage.removeItem(this.field.key)
 }
 close_icon() {
   this.dialogService.closeModal()
 }

 get_system_user_number(data:any){
let item = data.contact.calling_code+" "+data.contact.mobile_number
return item
 }


 get_mobile_number(data:any){

  if(data.calling_code){
    let item = data.calling_code +" "+data.mobile_number
    return item
  } else {
    return data.mobile_number
  }
   
 }

 show_delete_icon(data:any){

  if(this.field.delete_formaction == true && data.api_call == true){
    return false
  } else if(this.field.delete_formaction == true && data.api_call == undefined){
    return true
  } else {
return true
  }



 }
 // checkbox(event:any){
 //   debugger
 //   if(event.target.checked == false){


 //   }
 // }
 selectedItem:any
 dropdownData: any[] = [];
 listData:any[]=[]
 onItemSelect(datas:any) {
  this.listData=datas.filter((a:any)=>{
    return  a.disabled == undefined
      })
  let id = uuidv4()
  this.listData.forEach((a:any)=>{
    a['uid']=id
  })
   if(this.listData.length > 0){
     if(this.storedDate != undefined){
     let data = [...this.listData, ...this.storedDate]
     this.field.formControl.setValue(data)
   }else{
     this.field.formControl.setValue(this.listData)
   }
   } else {

    if(this.storedDate != undefined){
      this.field.formControl.setValue(this.storedDate)
    } else {
      this.field.formControl.setValue(this.listData)
    }
   }
  
 }


 selectionChange(selectedObject: any) {
 let dropdownData = [
     {
         "first_name": selectedObject.contact.first_name,
         "last_name": selectedObject.contact.last_name,
         "designation": selectedObject.designation,
         "role": selectedObject.role,
         "email_id": selectedObject.contact.email_id,
         "mobile_number": selectedObject.contact.mobile_number,
         "status": selectedObject.status
     }
 ]
this.field.formControl.setValue(dropdownData)


  this.firstName =  selectedObject.contact.first_name
  this.lastName =  selectedObject.contact.last_name
  this.emailId = selectedObject.contact.email_id
  this.mobileNumber  =  selectedObject.contact.mobile_number




  console.log(selectedObject)
   if (selectedObject && this.opt.onValueChangeUpdate && this.opt.onValueChangeUpdate instanceof Array) {
 for (const obj of this.opt.onValueChangeUpdate) {
   this.field.formControl.parent.controls[obj.key].setValue(
     selectedObject[obj.valueProp]
   );
 }
  }
 }




 // ...
  toggleButtons(index: number, show: boolean): void {
   this.storedDate[index].showButtons = show;
 }

 toggleButtons_listdata(index: number, show: boolean): void {
   if(this.listData[index].apicall == true){
    this.listData[index].showButtons = false
   } else {
    this.listData[index].showButtons =show
   }
  
}
 onAddButonClick() { 
 this.data={}
 if( this.field.parentkey && this.model[this.field.parentkey]!=undefined){
   this.data=Object.assign(this.data,{"work_location_type":this.model[this.field.parentkey],"selectedProject":this.model[this.field.parentkey1]})
 }
 if(this.field.parentkey1 && this.model[this.field.parentkey1] == undefined){
  return this.dialogService.openSnackBar(this.field.parent1_error_msg,"OK")
} 
  if(this.field.parentarray){
    let eitherPresent = this.field.parent_columns.some((column:any) =>this.model.hasOwnProperty(column) && this.model[column].length > 0);
   
  //  Set the onsite or remote country in the model
    this.field.parent_columns.forEach((item:any) => {
      if (this.model.hasOwnProperty(item)) {
       // let data:any= {}
        this.data[item]=this.model[item]
        this.data = Object.assign(this.data)
      }
    });
    if(!eitherPresent){
      return this.dialogService.openSnackBar(this.field.parent_error_msg,"OK")  
    }
  }

   this.dialogService.openDialog(this.editViewPopup, "40%", null, {});
   this.formControl.value
 }


 close(data: any) {
  debugger
   this.dialogService.closeModal()
   let getData:any =sessionStorage.getItem(this.field.key)
  this.storedDate =JSON.parse(getData)
  if(this.field.role_update && data!=undefined){
     this.listData.forEach((a:any)=>{
       if(a._id == data.email_id){
         a[this.field.column_name[0]]=data[this.field.column_name[0]]
         a[this.field.column_name[1]]=data.name
       }
     })
  }
   if(this.listData != undefined && this.storedDate != undefined){
       let data = [...this.storedDate, ...this.listData]
       this.field.formControl.setValue(data)
   } else if(this.listData !=undefined  && this.storedDate == undefined){
    this.field.formControl.setValue(this.listData)
   } else{
     this.field.formControl.setValue(this.storedDate)
   } 
   this.cf.detectChanges();
  //  this.ngOnInit()
 }


 deleteItem(index: number): void {
   this.dialogService.openDialog(this.dialog_box, "30%", null, index);
 }
 yes(data:any){
   if(this.field.apiCall == true ){


    let row_data= this.storedDate.splice(data, 1);
   if(row_data[0]?.api_call == true){
  //    this.dataservice.deleteById(this.field.delete_endpoint,row_data[0]?.role_update_id).subscribe((res:any)=>{
  //    this.dialogService.openSnackBar(res.message,"OK")
  //    sessionStorage.setItem(this.field.key, JSON.stringify(this.storedDate));
  //  // thisFormControl =this.storedDate
  //    let getData:any =sessionStorage.getItem(this.field.key)
  //    this.storedDate =JSON.parse(getData)
  //    if(this.listData.length == 0 && this.storedDate.length == 0){
  //     this.formControl.setValue(null)
  //   }

  //   if(this.listData.length >0 && this.storedDate.length > 0){
  //     let data = [...this.listData, ...this.storedDate]
  //     this.formControl.setValue(data)
  //   }

  //   if(this.storedDate.length > 0 && this.listData.length == 0){
  //     this.formControl.setValue(this.storedDate)
  //   }

  //   if(this.storedDate.length== 0 && this.listData.length > 0){
  //     this.formControl.setValue(this.listData)
  //   }

  //    this.cf.detectChanges();
  //    this.dialogService.closeModal()
  //    })
   } else {
    
    sessionStorage.setItem(this.field.key, JSON.stringify(this.storedDate));
     this.cf.detectChanges();
     this.dialogService.closeModal()
     if(this.listData.length > 0 || this.storedDate.length > 0){
       let data = [...this.listData, ...this.storedDate]
       this.formControl.setValue(data)
     }

     if(this.listData.length == 0 && this.storedDate.length == 0){
      this.formControl.setValue(null)
    }

    if(this.listData.length >0 && this.storedDate.length > 0){
      let data = [...this.listData, ...this.storedDate]
      this.formControl.setValue(data)
    }

    if(this.storedDate.length > 0 && this.listData.length == 0){
      this.formControl.setValue(this.storedDate)
    }

    if(this.storedDate.length== 0 && this.listData.length > 0){
      this.formControl.setValue(this.listData)
    }
     this.dialogService.openSnackBar("Data has been deleted Successfully","OK")
   }
  
   } else {
     this.storedDate.splice(data, 1);
     sessionStorage.setItem(this.field.key, JSON.stringify(this.storedDate));
     this.cf.detectChanges();
     let getData:any =sessionStorage.getItem(this.field.key)
     this.storedDate =JSON.parse(getData)
     if(this.storedDate.length > 0){
      this.formControl.setValue(this.storedDate)
    } else {
      this.formControl.setValue(null)
    }
     this.dialogService.closeModal()
     this.dialogService.openSnackBar("Data has been deleted Successfully","OK")
   }
  
 }
editItem(item:any){
 this.data=item
 if( this.field.parentkey && this.model[this.field.parentkey]!=undefined){
   this.data=Object.assign(this.data,{"work_location_type":this.model[this.field.parentkey],"selectedProject":this.model[this.field.parentkey1]})
 }
 if(this.field.parentkey1 && this.model[this.field.parentkey1] == undefined){
  return this.dialogService.openSnackBar(this.field.parent1_error_msg,"OK")
} 
if(this.field.parentarray){
  let eitherPresent = this.field.parent_columns.some((column:any) =>this.model.hasOwnProperty(column) && this.model[column].length > 0);
 
//  Set the onsite or remote country in the model
  this.field.parent_columns.forEach((item:any) => {
    if (this.model.hasOwnProperty(item)) {
     // let data:any= {}
      this.data[item]=this.model[item]
      this.data = Object.assign(this.data)
    }
  });
  if(!eitherPresent){
    return this.dialogService.openSnackBar(this.field.parent_error_msg,"OK")  
  }
}
 this.dialogService.openDialog(this.editViewPopup, "40%", null, item);
}

editroleItem(item:any){
  var item1:any={
    "email_id":item._id
  }
  if(item.contact.role_id == undefined){
    item1['update_role'] = true
  } else {
    item1['update_role'] = false
  }

  if(item.designation){
   item1['designation']=item.designation
  }
  this.data = item1
  this.dialogService.openDialog(this.dialog_box2, "40%", null, this.data);
}


update_form(data:any){

}





 
}
