import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { DataService } from '../services/data.service';
import { FormControl } from '@angular/forms';
import { FieldType, FieldTypeConfig } from '@ngx-formly/core';

@Component({
 selector: 'autocomplete-input',
 template: `
<style>
  ::ng-deep.ng-select-container.ng-appearance-outline .ng-value {
    padding-left: .25em;
    margin: 5px !important;
}
::ng-deep.ng-select-single .ng-select-container .ng-value-container .ng-input {
    position: absolute;
    left: none !important;
    width: 100%;
}
::ng-deep .ng-select-container.ng-appearance-outline {
  padding: 0 .5em;
  min-height: 63px;
  padding-left:10px
}
::ng-deep .ng-select-container .ng-value-container .ng-input>input {
    padding:6px 12px!important;
    width:95% !important;
}

</style>

  
  <ng-select style="margin:15px 0px 10px 2px"  [items]="this.opt.options"
  [bindLabel]="labelProp"
  [bindValue]="valueProp"
  placeholder={{field.props.placeholder}}
  [formControl]="FormControl"     
  [formlyAttributes]="field"
  (change)="onchange_data($event)"
  [readonly]="this.opt.readonly" 
  [required]="this.field.props.required" appearance='outline' 
  >
</ng-select>
<mat-error *ngIf="this.field.props.required  && this.field.show_error && !this.formControl.value" style="margin-bottom:10px;margin-left:4px;">{{field.validation.messages['required']}}</mat-error>

 `,
})
export class AutoComplete extends FieldType<any>implements OnInit {
  
  opt: any;
  data: any
  currentField: any
  //default prop setting
  valueProp = "id"
  labelProp = "name"
  dropdown: any
  selectedValue: any
  input_readonly:any = "false"
  
  constructor(private dataService:DataService,public cf: ChangeDetectorRef,){
    super();
  }

  public get FormControl() {
    return this.formControl as FormControl;
    
  }


  ngOnInit(): void {
    this.opt = this.field.props || {};
    this.labelProp = this.opt.labelProp;
    this.valueProp = this.opt.valueProp;
    this.currentField = this.field
    let data=this.model[this.field.key]
    
        
    if(data!=undefined){
      this.getdata()
    }
 

  if(this.currentField.parentKey!= "") {

      (this.field.hooks as any).afterViewInit = (f:any) => {
          const parentControl = this.form.get(this.field.parentKey)//this.opt.parent_key);
          parentControl?.valueChanges.subscribe((val:any) =>{
            console.log(val)
            if(val!=undefined){
              this.selectedValue= val
              this.getdata()
            }
          })
         
        }
     }



  }

getdata(){
  debugger
  if(this.opt.optionsDataSource.multifilter){
    this.opt.multifilter_condition.conditions.map((res:any)=>{
     
      if(res.getdata=="local" && res.value==""){
        res.value=sessionStorage.getItem(res.field)
      } 


       
      if(res.getdata=="model"){
         res.value=this.model[res.field]
       } 
    
    })
    let filter_condition={filter:[
      this.opt.multifilter_condition
    ]}
    this.dataService.getDataByFilter(this.opt?.optionsDataSource?.multifilter,filter_condition).subscribe((res:any)=>{
     if(res.data!=null){
      this.dropdown=res.data[0].response
      if(this.field.address_label){
     this.dropdown.forEach((value:any)=>{
      let item= value.address
      
       let text=""
       if(item.street){
        text += item.street +","
         }
      if(item.area_name){
        text += item.area_name+","
         }
      if(item.city){
        text += item.city+","
         }
         if(item.zipcode){
          text += item.zipcode+","
           }
      if(item.state){
        text += item.state+","
      }
         
      if(item.country){
        text += item.country
         }
      
        value['full_address']=text
      })
    }
     } else {
      this.dropdown=[]
      this.formControl.setValue(null)
     }
      
     this.cf.detectChanges()
     this.opt.options=this.dropdown
     if(this.model[this.field.key]!=undefined){
      this.model[this.field.props.ref]=this.dropdown[0]
      this.formControl.setValue(this.model[this.field.key])
     }
     console.log(this.dropdown)
    
    })
}

}


onchange_data(data:any){
  if(this.field.countrycode==true){
    this.model[this.field.props.ref]=data
    const GOOGLE_MAPS_API_KEY = 'AIzaSyCfFOJKcxzq3BMnJPZBZ52P80r3kKGTOhw';
   let column= data['address'][this.field.column]
    // to bind the country code from the lat and long 
   let url=`https://maps.googleapis.com/maps/api/geocode/json?latlng=${column[1]},${column[0]}&key=${GOOGLE_MAPS_API_KEY}`
   fetch(url).then(res=>res.json()).then(data=>{
    let parts=data.results[0].address_components
    parts.forEach((res:any)=>{
    if(res.types.includes('country')){
    sessionStorage.setItem("countrycode",res.short_name) 
      }
    })
   })
  }
}
 
  }