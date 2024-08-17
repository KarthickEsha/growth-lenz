import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { FormControl } from "@angular/forms";
import { FieldType } from "@ngx-formly/core";
import { Subscription } from "rxjs";
import { DataService } from "../services/data.service";
@Component({
  selector: "matprefix-input",
  template: `
    <style>
      .border {
        border: 1px solid rgb(158, 158, 158) !important;
        margin-bottom: 37px;
        border-radius: 4px;
        height: 50px;
        text-align: center;
      }
      ::ng-deep.mat-mdc-form-field-icon-prefix, .mat-mdc-form-field-icon-suffix {
        padding: 0 4px 0 0;
        width: max-content !important;
    }

    .span.ng-tns-c1205077789-36 {
      vertical-align: text-top;
  }
    </style>
    <mat-form-field>
      <span matPrefix>{{ prefix }}</span>
      <input
        (change)="onselect($event)"
        matInput
        placeholder="{{ this.field.props.placeholder }}"
        [formControl]="FormControl"
        [formlyAttributes]="field"
        [required]="this.field.props.required"
        [readonly]="field.props.readonly"
      />
      <mat-error *ngIf="this.field.props.required">{{field.validation.messages['pattern']}}</mat-error>
    </mat-form-field>
  `,
})
export class MatPrefixInput extends FieldType<any> implements OnInit {
  opt: any;
  //default prop setting
  valueProp: any;
  labelProp: any;
  onValueChangeUpdate: any;
  label: any;
  dropdownList = [];
  currentField: any;
  prefix: any;
  country_code:any
  parent_field:any
  data:any
  test:any
test2:any
authdata:any
private apiCalled = false;
  constructor(private dataService: DataService,private cdr: ChangeDetectorRef) {
    super();
    this.authdata= sessionStorage.getItem("org_id")
  }

  public get FormControl() {
    return this.formControl as FormControl;
  }

  ngOnInit(): void {
    debugger
    this.label = this.field.props?.label;
    this.opt = this.field.props || {};
    this.currentField = this.field;
    this.onValueChangeUpdate = this.opt.onValueChangeUpdate;
    this.parent_field=this.field?.props.parent_field
   

if(this.field.concat){
let data =this.field.parent_field.split(".").reduce((o: any, i: any) => o[i], this.model);
this.prefix=data
this.cdr.detectChanges()
}

    if (this.currentField.parentKey != "") {
      if(this?.opt?.type=="Simple"){
// console.log(this.opt);
this.prefix=sessionStorage.getItem(this.currentField.parentKey)
if(this.model[this.field.key]!=undefined){
this.prefix  =''
} else{
  this.prefix=this.prefix+ "-"
}
this.cdr.detectChanges()
// console.log();

      }
      (this.field.hooks as any).afterViewInit = (f: any) => {
        const parentControl = this.form.get(this.currentField.parentKey); //this.opt.parent_key);
        parentControl?.valueChanges.subscribe((val: any) => {
          var selectedOption :any;
          selectedOption = this.field.parentKey.split(".").reduce((o: any, i: any) => o[i], this.model);
          if (selectedOption != undefined) {
            this.opt.multifilter_condition.conditions.map((res:any)=>{
              if(res.value!=undefined){
                res.value=selectedOption
              }
            
            })
            let filter_condition={filter:[
              this.opt.multifilter_condition
            ]}
            this.dataService.getDataByFilter(this.opt?.optionsDataSource?.multifilter,filter_condition).subscribe((res:any)=>{
                this.data=res.data[0].response[0]
                let number= this.field.key.split(".").reduce((o:any, i:any) =>{
                  if(o==undefined || i==undefined){
                    return undefined
                  } else {
                   return  o[i]
                  }
                },this.model
               );
              
               
                if (number==undefined) {
                  this.prefix = this.data[this.opt?.parent_field];
                  this.cdr.detectChanges()
                
                } else {
                 let call_code  =  this.field.columnfield.split(".").reduce((o:any, i:any) =>
                 o[i], this.model
                );
                  this.prefix=call_code
                  this.cdr.detectChanges()
                  this.model["calling_code"]=this.prefix 
                }
              });
          }
        });
      };
    }

    // Bind Calling code based on the Organization( Customer / SAAS)
  if(this.field.props?.user_type){
    let collection_name
    let user_type=sessionStorage.getItem('user_type')
    let org_id=sessionStorage.getItem('org_id')
if(user_type == 'SAAS'){
 collection_name = this.opt.collectionName1
} else {
  collection_name = this.opt.collectionName2
}
    this.dataService.getDataById(collection_name,org_id).subscribe((res: any) => {
      let country_code
      let data =res.data
      if(user_type == 'SAAS' && data !=null){
      country_code= this.opt.field1.split(".").reduce((o:any, i:any) => o[i], data);
      } else {
        country_code=this.opt.field2.split(".").reduce((o:any, i:any) => o[i], data);
      }
    
     let call_code= this.field.columnfield.split(".").reduce((o:any, i:any) =>{
      if(o==undefined || i==undefined){
        return undefined
      } else {
       return  o[i]
      }
    },this.model
   );

     let mobile_number = this.field.key.split(".").reduce((o:any, i:any) =>{
      if(o==undefined || i==undefined){
        return undefined
      } else {
       return  o[i]
      }
    },this.model
   );
      
      if(country_code !=undefined && mobile_number==undefined){
        this.dataService.getDataById('country',country_code).subscribe((res: any) => {
     this.prefix = res.data.calling_code
     this.cdr.detectChanges()
     this.model['calling_code']=this.prefix
      })
    } else {
      this.prefix = call_code
      this.cdr.detectChanges()
     this.model['calling_code']=this.prefix
    // this.formControl.setValue(this.model[this.field.key])
    }
     })
  }
  

    if(this.field.getdata=='local'){
      debugger
    let calling_code=sessionStorage.getItem("countrycode")
      //  Multifilter API
      if(this.opt.optionsDataSource.multifilter){
        this.opt.multifilter_condition.conditions.map((res:any)=>{
          if(res.value!=undefined){
            res.value=calling_code
          }
        
        })
        let filter_condition={filter:[
          this.opt.multifilter_condition
        ]}
        this.dataService.getDataByFilter(this.opt?.optionsDataSource?.multifilter,filter_condition).subscribe((res:any)=>{
          this.data = res.data[0].response[0]
          if(this.model[this.field.key]==undefined){
           
            this.prefix=this.data[this.parent_field]
            this.cdr.detectChanges()
             this.test2=this.prefix
            } else{
            //   let length=this.data[this.parent_field].length
            //  let data=this.model[this.field.key]
             
              this.prefix=this.data[this.parent_field]
              this.cdr.detectChanges()
              this.model["calling_code"]=this.prefix
              this.formControl.setValue(this.model[this.field.key])
              // if(data.length>10){
              //   let split_data= data.slice(length);
              //   this.formControl.setValue(split_data)
              //   this.prefix=this.data[this.parent_field]
              // }
             
            }
        })
     
       }
        
    }
  }

  onselect(event: any) {
    this.model[this.field.props.parent_field]=this.prefix
  }

}
