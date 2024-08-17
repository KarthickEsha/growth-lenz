import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Input, Output, SimpleChange, SimpleChanges, TemplateRef, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from 'src/app/services/data.service';
import { DialogService } from 'src/app/services/dialog.service';
import { FormService } from 'src/app/services/form.service';
import { DatatableComponent } from '../component/datatable/datatable.component';
import { FormlyFieldConfig, FormlyFormOptions } from '@ngx-formly/core';
import { FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import * as moment from 'moment';
import { v4 as uuidv4 } from 'uuid';


@Component({
  selector: 'nestedform',
  template: `<mat-card style="width: 98%; margin: auto">
  <div style="text-align-last: end" *ngIf="config.editMode == 'popup'">
    <mat-icon (click)="cancel()">close</mat-icon>
  </div>
  <mat-card-header style="flex: 1 1 auto;">
    <div  style="width: 100%">
      <h2 style="text-align: center;" class="page-title">{{ pageHeading }} - {{ formAction }}</h2>
    </div>
  </mat-card-header>

  <mat-card-content style="padding-top: 10px">
    <div>
      <form [formGroup]="form" *ngIf="config">
        <formly-form
          [model]="model"
          [fields]="fields"
          [form]="form"
          [options]="options"
        >
        </formly-form>
      </form>
    </div>
  </mat-card-content>
  <mat-card-actions>
    <div style="text-align-last: end; width: 100%">
    <button
    style="margin: 5px;  background:rgb(59,146,155)"
    mat-raised-button
    color="warn"
    (click)="frmSubmit(this.config)"
  >
    {{ butText }}
  </button>
      <button
        style="margin: 5px"
        mat-button
        (click)="cancel()"
        *ngIf="config.onCancelRoute"
      >
        Cancel
      </button>
    </div>
  </mat-card-actions>
</mat-card>
<div *ngIf="isDataError">
  <mat-icon color="warn">error</mat-icon>
  <span>Given ID is not valid</span>
</div>




`,

})
export class Nestedform {
  form = new FormGroup({});
  pageHeading: any
  formAction = 'Add'
  butText = 'Save'
  id: any
  keyField: any
  isDataError = false
  config: any = {}
  authdata: any
  options: any = {};
  fields!: FormlyFieldConfig[]
  Old_modelData:any
  paramsSubscription !: Subscription;
  @Input('formName') formName: any
  @Input('listdata') listdata: any
  @Input('mode') mode: string = "page"
  @Input('model') model: any = {}
  @Output('onClose') onClose = new EventEmitter<any>();
 

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private formService: FormService,
    private dataService :DataService, 
    public dialogService: DialogService
  ) {
   
  }
 storeData:any;
 
  ngOnInit() {
    // this.postData()
    this.initLoad()
    let getdata:any =sessionStorage.getItem(this.config.field_name)
    this.storeData =JSON.parse(getdata)    
  }

  ngOnChanges(changes: SimpleChanges) {
    const currentItem: SimpleChange = changes['item'];
    if (this.formName && this.model) {
      this.id = this.model['_id']
      this.initLoad()
    }
  }

  frmSubmit(data: any) {
    debugger
    var defaultValues = this.config.form.defaultValues || []
    if(this.formAction === "Add"){
      this.loadDefaultValues(defaultValues,this.form.value,this.model)
    }
    
    let pushData :any[] = [];
    if (!this.form.valid) {
      this.dialogService.openSnackBar("Error in your data or missing mandatory fields", "OK")
      return;
    }
    
    if(this.config.split_data){
      let data:any=this.form.value
      let item:any={}
      item[this.config?.split_data]=this.model[this.config.split_data]
     //data[this.config?.split_column]=this.model[this.config.split_data].concat(data[this.config?.split_column]) 
     data=Object.assign(this.form.value,item)
    }
    if (this.formAction === "Add") {
      var defaultValues = this.config.form.defaultValues || []
      this.loadDefaultValues(defaultValues,data,this.model)
      if(this.config.save_data == "local"){
        let getdata: any = sessionStorage.getItem(this.config.field_name);
        let existingData: any[] = JSON.parse(getdata) || [];
      
        if (existingData.length >= this.config.max_length) {
          this.dialogService.openSnackBar("Maximum" +" "+`${this.config.max_length}`+" "+"contacts are allowed to add", "OK")
          // Maximum limit reached, display an error message or handle the case as desired
          return;
        }

        if(this.config.accept=='primary_contact' && existingData.length == 0 && this.model.contact_type !='Primary Contact' ){
         return this.dialogService.openSnackBar("Primary Contact should be added", "OK")
        }

    

         //To check the duplicate mail ID and mobile Number
         if(this.config.check_validation && existingData.length >= 1){
          let valid_email = existingData.filter((a:any)=>{ return a[this.config.validation_field[0]] == this.model[this.config.validation_field[0]]})
          let valid_number = existingData.filter((a:any)=>{return  a[this.config.validation_field[1]] == this.model[this.config.validation_field[1]]})

          if(valid_email.length>=1){
            return this.dialogService.openSnackBar("Duplicate" +" "+`${this.model[this.config.keyField]}`, "OK")
          }
          if(valid_number.length>=1){
            return this.dialogService.openSnackBar("Duplicate" +" "+`${this.model[this.config.validation_field[1]]}`, "OK")
          }

        }


        // let duplicate_mobile_no=existingData.filter((a:any)=>{
        //   let formcontrol:any=this.form.value
        //   return a['mobile_number']== formcontrol['mobile_number']
        // })

        // if(duplicate_mobile_no.length!=0){
        //   return this.dialogService.openSnackBar("Duplicate" +" "+`${this.model['mobile_number']}`, "OK")
        // }
        
        const primaryContact = existingData.find(
          (item: any) => item[this.config.check_condition] === "Primary Contact"
        );
        const secondaryContact = existingData.find(
          (item: any) => item[this.config.check_condition] === "Secondary Contact"
        );
      
        if (this.model[this.config.check_condition] === "Primary Contact" && primaryContact) {
          this.dialogService.openSnackBar("Primary contact already exists", "OK")
          // A primary contact already exists, display an error message or handle the case as desired
          return;
        }
        if (this.model[this.config.check_condition] === "Secondary Contact" && secondaryContact) {
          this.dialogService.openSnackBar("Secondary contact already exists", "OK")
          // A primary contact already exists, display an error message or handle the case as desired
          return;
        }
      
        for (let item of existingData) {
          pushData.push(item);
        }
        let id = uuidv4()
        Object.assign(this.model, { "uid": id })
      Object.assign(this.form.value, { "uid": id })
        pushData.push(this.form.value);
        sessionStorage.setItem(this.config.field_name,JSON.stringify(pushData));
        this.goBack()
      }

      if(this.config.save_data=="api"){
        let getdata: any = sessionStorage.getItem(this.config.field_name);
        let existingData: any[] = JSON.parse(getdata) || [];
      
        if (existingData.length >= this.config.max_length) {
          this.dialogService.openSnackBar("Maximum" +" "+`${this.config.max_length}`+" "+"members are allowed to add", "OK")
          // Maximum limit reached, display an error message or handle the case as desired
          return;
        }
           //To check the duplicate mail ID and mobile Number
           if(this.config.check_validation && existingData.length >= 1){
            let valid_email = existingData.filter((a:any)=>{ return a[this.config.validation_field[0]] == this.model[this.config.validation_field[0]]})
            let valid_number = existingData.filter((a:any)=>{return  a[this.config.validation_field[1]] == this.model[this.config.validation_field[1]]})
  
            if(valid_email.length>=1){
              return this.dialogService.openSnackBar("Duplicate" +" "+`${this.model[this.config.keyField]}`, "OK")
            }
            if(valid_number.length>=1){
              return this.dialogService.openSnackBar("Duplicate" +" "+`${this.model[this.config.validation_field[1]]}`, "OK")
            }

          }



          //To check the duplicate mail ID and mobile Number with the dropdown data
          if(this.config.check_validation && this.listdata.length >= 1){
            let valid_email = this.listdata.filter((a:any)=>{ return a[this.config.validation_field[2]] == this.model[this.config.validation_field[0]]})
            let valid_number = this.listdata.filter((a:any)=>{return  a[this.config.validation_field[1]] == this.model[this.config.validation_field[1]]})
  
            if(valid_email.length>=1){
              return this.dialogService.openSnackBar("Duplicate" +" "+`${this.model[this.config.keyField]}`, "OK")
            }
            if(valid_number.length>=1){
              return this.dialogService.openSnackBar("Duplicate" +" "+`${this.model[this.config.validation_field[1]]}`, "OK")
            }

          }


        if(this.config.accept=='primary_contact' && existingData.length == 0 && this.model.contact_type !='Primary Contact' ){
          return this.dialogService.openSnackBar("Primary Contact should be added", "OK")
         }
       
        // let duplicate_mobile_no=existingData.filter((a:any)=>{
        //   let formcontrol:any=this.form.value
        //   return a['mobile_number']==formcontrol['mobile_number']
        // })

        // if(duplicate_mobile_no.length!=0){
        //   return this.dialogService.openSnackBar("Duplicate" +" "+`${this.model['mobile_number']}`, "OK")
        // }

        for (let item of existingData) {
          pushData.push(item);
        }
        let id = uuidv4()
        Object.assign(this.model, { "uid": id })
      Object.assign(this.form.value, { "uid": id })



      if(this.config.dynamic_field){
        let value:any = this.form.value
        value[this.config.dynamic_field[1]]=this.model['role_name']

        
        
        if(value[this.config.dynamic_field[1]] == "Project Admin" || value[this.config.dynamic_field[1]] == "Project admin" ){
          value['role_id']=5
        } else if(value[this.config.dynamic_field[1]] == "User"){
          value['role_id']=6
        } else {
          value['role_id']=7
        }
      }
        pushData.push(this.form.value);
        sessionStorage.setItem(this.config.field_name,JSON.stringify(pushData));
        this.goBack()
      }

      if(this.config.merge_data){
        this.onClose.emit(this.model
          )
      }
  
 
} 
 else if (this.formAction === "Edit") {

  if(this.config.save_data == "local"){

    if(this.config.check_condition=='contact_type'){
      let item:any=this.form.value
      item[this.config.check_condition]=this.model[this.config.check_condition]
    }

    let getdata: any = sessionStorage.getItem(this.config.field_name);
    let data: any[] = JSON.parse(getdata) || [];

    let Formaction = sessionStorage.getItem("formAction")
    if(Formaction == "EDIT" && this.model.uid != undefined){
      var clone_data:any=data.filter((a:any)=>{
        return  a[this.config.keyField1]!=this.model[this.config.keyField1]
       })

      }
    
    else if(Formaction == "EDIT" &&  this.model.uid == undefined){
    var clone_data:any=data.filter((a:any)=>{
      return  a[this.config.keyField]!=this.model[this.config.keyField]
     })


     let id = uuidv4()
     Object.assign(this.form.value, { "uid": id })
    }

   

    if(Formaction == "ADD"){
      var clone_data:any=data.filter((a:any)=>{
        return  a[this.config.keyField1]!=this.model[this.config.keyField1]
       })

       let id = uuidv4()
       Object.assign(this.form.value, { "uid": id })

      }


        //To check the duplicate mail ID and mobile Number
     if(this.config.check_validation && clone_data.length >= 1){
      let valid_email = clone_data.filter((a:any)=>{ return a[this.config.validation_field[0]] == this.model[this.config.validation_field[0]]})
      let valid_number = clone_data.filter((a:any)=>{return  a[this.config.validation_field[1]] == this.model[this.config.validation_field[1]]})

      if(valid_email.length>=1){
        return this.dialogService.openSnackBar("Duplicate" +" "+`${this.model[this.config.keyField]}`, "OK")
      }
      if(valid_number.length>=1){
        return this.dialogService.openSnackBar("Duplicate" +" "+`${this.model[this.config.validation_field[1]]}`, "OK")
      }

    }

   
  
      clone_data.push(this.form.value)
      console.log(clone_data)
  
    

    // Add the updated form value
    pushData=clone_data

    sessionStorage.removeItem(this.config.field_name);
    sessionStorage.setItem(this.config.field_name,JSON.stringify(pushData));
    this.goBack()
     
    }

    if(this.config.save_data=="api"){
      let getdata: any = sessionStorage.getItem(this.config.field_name);
      let data: any[] = JSON.parse(getdata) || [];
        // Add existing data excluding the matching item
        let Formaction = sessionStorage.getItem("formAction")

        
        if(Formaction == "EDIT" && this.model.uid != undefined){
          var clone_data:any=data.filter((a:any)=>{
            return  a[this.config.keyField1]!=this.model[this.config.keyField1]
           })

          }
        
        else if(Formaction == "EDIT" &&  this.model.uid == undefined){
        var clone_data:any=data.filter((a:any)=>{
          return  a[this.config.keyField]!=this.model[this.config.keyField]
         })


         let id = uuidv4()
         Object.assign(this.form.value, { "uid": id })
        } 


         

        if(Formaction == "ADD"){
          var clone_data:any=data.filter((a:any)=>{
            return  a[this.config.keyField1]!=this.model[this.config.keyField1]
           })

           let id = uuidv4()
           Object.assign(this.form.value, { "uid": id })

          }

            //To check the duplicate mail ID and mobile Number
            if(this.config.check_validation && clone_data.length >= 1){
              let valid_email = clone_data.filter((a:any)=>{ return a[this.config.validation_field[0]] == this.model[this.config.validation_field[0]]})
              let valid_number = clone_data.filter((a:any)=>{return  a[this.config.validation_field[1]] == this.model[this.config.validation_field[1]]})
    
              if(valid_email.length>=1){
                return this.dialogService.openSnackBar("Duplicate" +" "+`${this.model[this.config.keyField]}`, "OK")
              }
              if(valid_number.length>=1){
                return this.dialogService.openSnackBar("Duplicate" +" "+`${this.model[this.config.validation_field[1]]}`, "OK")
              }
            }

                 //To check the duplicate mail ID and mobile Number with the dropdown data
          if(this.config.check_validation && this.listdata.length >= 1){
            let valid_email = this.listdata.filter((a:any)=>{ return a[this.config.validation_field[2]] == this.model[this.config.validation_field[0]]})
            let valid_number = this.listdata.filter((a:any)=>{return  a[this.config.validation_field[1]] == this.model[this.config.validation_field[1]]})
  
            if(valid_email.length>=1){
              return this.dialogService.openSnackBar("Duplicate" +" "+`${this.model[this.config.keyField]}`, "OK")
            }
            if(valid_number.length>=1){
              return this.dialogService.openSnackBar("Duplicate" +" "+`${this.model[this.config.validation_field[1]]}`, "OK")
            }

          }

        
          if(this.config.dynamic_field){
            let value:any = this.form.value
            value[this.config.dynamic_field[1]]=this.model['role_name']

            if(value[this.config.dynamic_field[1]] == "Project Admin"){
              value['role_id']=5
            } else if(value[this.config.dynamic_field[1]] == "User"){
              value['role_id']=6
            } else {
              value['role_id']=7
            }
          }

         let new_data:any=this.form.value
         clone_data.push(this.form.value)
       
       // Add the updated form value
       pushData=clone_data
   
       sessionStorage.removeItem(this.config.field_name);
       if(this.config.apiCall==true){
        let item={
         "user_designation":this.model.designation,
         "status":this.model.status
        }
  if(this.model.api_call == true){
     
            //designation update
            this.dataService.update(this.config.update_collectionName,this.model[this.config.update_field],item).subscribe((res:any)=>{
              if(res.status == 200){
                let data=res.data
                this.dialogService.openSnackBar(res.message,"OK")
                pushData.map((a:any)=>{
                  if(a[this.config.keyField] == this.model[this.config.keyField]){
                    a['api_call']=true
                    a[this.config.update_field]=this.model[this.config.update_field]
                    a[this.config.dynamic_field[0]]=this.model[this.config.dynamic_field[0]]
                    a[this.config.dynamic_field[1]]=this.model['name']
                  }
                })
                sessionStorage.setItem(this.config.field_name,JSON.stringify(pushData));
                this.goBack()
              }
                },(error:any)=>{
                  this.dialogService.openSnackBar(error.error.message,"OK")
                })
  } else {
    sessionStorage.setItem(this.config.field_name,JSON.stringify(pushData));
    this.goBack()
  }
       
       
       } else {
        sessionStorage.setItem(this.config.field_name,JSON.stringify(pushData));
        this.goBack()
       }
  
     
    }
    

    if(this.config.merge_data){
      this.onClose.emit(this.model
        )
    }
  }
 
  }

  initLoad() {
    this.formService.LoadInitData(this)
   this.Old_modelData=this.model

  }

  goBack(data?: any) {
        this.onClose.emit() 
  }



   //default values type
   loadDefaultValues(defaultValues:any,formData:any,model:any) {     
    //sync way
    defaultValues.map((obj:any)=>{
     let val
       if (obj.type=="date") {
        formData[obj.colName] = moment().utc().startOf('day').add(obj.addDays || 0 ,'day').format(obj.format||'yyyy-MM-DDT00:00:00.000Z')
      }else if (obj.type == "exp") {
        if (obj.source == "local") {
         
          val =JSON.parse(localStorage.getItem(obj.value) || '');
          let data = val[obj.object][obj.object1]
          formData[obj.colName] = data
        }
      } else if (obj.type == "local_data") {
          val =sessionStorage.getItem(obj.value) || '';
          formData[obj.colName] = val
        
      }else if (obj.type == "boolean") {
        formData[obj.colName] = obj.value
      
    }
//      else if (obj.value.startsWith('@')) {
//       val= obj.value.slice(1)
//      formData[obj.colName] = model[val]
//  } 
      else {
        formData[obj.colName] = obj.value
      }
    })
  }

data:any
storage:any


  resetBtn(data?: any) {
    this.model = {}
    this.formAction = this.model.id ? 'Edit' : 'Add'
    this.butText = this.model.id ? 'Update' : 'Save';

  }

  cancel() {
    this.onClose.emit()
  }

  close(){

  }


}