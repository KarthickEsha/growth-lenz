import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { DataService } from '../services/data.service';
import { FormControl } from '@angular/forms';
import { FieldType, FieldTypeConfig } from '@ngx-formly/core';
import { Observable, map, startWith } from 'rxjs';
import * as _ from 'lodash';

@Component({
 selector: 'matselectautocomplete-input',
 template: `
<style>

</style>
<mat-form-field *ngIf="!this.opt.country_flag_show">
    <mat-label>{{this.opt.label}}</mat-label>
    <input
      type="text"
      required
      placeholder={{this.opt?.placeholder}}
      matInput
      [formControl]="FormControl"     
    [formlyAttributes]="field"
      [matAutocomplete]="auto"
      [readonly]="this.opt.readonly"
      (input)="onValueChanged($event)"
    />
    <mat-error *ngIf="FormControl.invalid && FormControl.errors?.['required']"
      >{{this.field.validation?.messages.required}}</mat-error
    >
    <mat-error *ngIf="FormControl.hasError('error')"
        >{{this.field.validation?.messages.error}}
      </mat-error>
    <mat-autocomplete #auto="matAutocomplete">
      <mat-option
        *ngFor="let option of filteredOptions | async"
        [value]="option[this.valueProp]"
      >
      <span [innerHTML]="option[this.labelProp]"></span>
      </mat-option>
    </mat-autocomplete>
  </mat-form-field>
  
<mat-form-field *ngIf="this.opt.country_flag_show">
    <mat-label>{{this.opt.label}}</mat-label>
    <input
      type="text"
      required
      placeholder={{this.opt?.placeholder}}
      matInput
      [formControl]="FormControl"     
    [formlyAttributes]="field"
      [matAutocomplete]="auto"
      [readonly]="this.opt.readonly"
      (input)="onValueChanged($event)"
    />
    <mat-error *ngIf="FormControl.invalid && FormControl.errors?.['required']"
      >{{this.field.validation?.messages.required}}</mat-error
    >
    <mat-error *ngIf="FormControl.hasError('error')"
        >{{this.field.validation?.messages.error}}
      </mat-error>
    <mat-autocomplete #auto="matAutocomplete">
      <mat-option
        *ngFor="let option of filteredOptions | async"
        [value]="option[this.valueProp]"
      >

      <div style="display: flex; align-items: center;">
      <img *ngIf="option.country_flag" [src]="option.country_flag" height="45px" width="50px" style="margin-right: 10px;">
      <span [innerHTML]="option[this.labelProp]"></span>
      </div>
      </mat-option>
    </mat-autocomplete>
  </mat-form-field>
 `,
})
export class MatSelectAutoComplete extends FieldType<any> implements OnInit {
  
  opt: any;
  data: any
  currentField: any
  //default prop setting
  valueProp:any = "id"
  labelProp:any = "name"
  dropdown: any
  selectedValue: any
  input_readonly:any = "false"
  filteredOptions!: Observable<any[]>;


  constructor(private dataService:DataService,public cf: ChangeDetectorRef,){
    super();
  }

  public get FormControl() {
    return this.formControl as FormControl;
    
  }


  ngOnInit(): void {
    debugger
    this.opt = this.field.props || {};
    this.labelProp = this.opt.labelProp;
    this.valueProp = this.opt.valueProp;
    this.currentField = this.field

  
      

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
  
  
      //  get by ID by given collectionName
       if(this.opt.optionsDataSource.parentcollectionName){
         let id
         if(this.field.local_data){
          id = sessionStorage.getItem(this.field.local_data)
         }
         if(id != undefined){
          this.getbyID(this.opt.optionsDataSource.parentcollectionName,id)
         }
        
       }
  
  
      //  For Corporate customer -> job -> Point of contact / client Interviwer Details Calling Code
      
  if(this.opt?.optionsDataSource?.parent_multifilter) {
   
    let parent_data =this.model.selectedProject

  let filter_condition={filter:[
    this.opt.multifilter_condition
  ]}
  this.dataService.getDataByFilter(this.opt?.optionsDataSource?.parent_multifilter,filter_condition).subscribe((res:any)=>{
        if(res.data !=null){
        let data =res.data[0].response
          if(this.field.modelref){
            data =  res.data[0].response.filter((item1:any) => parent_data[this.field.parent_column].includes(item1._id));
            this.opt.options=data
            this.filteredOptions = this.FormControl.valueChanges.pipe(
                startWith(""),
                map(value => (typeof value === "string" ? value : value.name)),
                map(name => (name ? this._filter(name) : this.opt.options.slice()))
              );
          }
          // In Project ,Onsite or Remote Country based data showed in calling dropdown in members
          else if(this.field.model_data){
            this.get_country_data(res.data[0].response,this.model)
          }
         
          else if(this.field.parent_based_data){
            
            let id = sessionStorage.getItem(this.field.id)
            this.dataService.getparentdataById(this.opt.optionsDataSource.parentcollectionName,id).subscribe((result:any)=>{
            let item = result.data
            
          // For End Client Calling Code based on Saas(On site / Remote Service Country)
            if(this.field.saas_data){
              if(this.model.work_location_type == "Remote"){
                data = res.data[0].response.filter((item2:any) => item[this.field.parent_columns[0]].includes(item2._id));
              } else {
                data = res.data[0].response.filter((item2:any) => item[this.field.parent_columns[1]].includes(item2._id));
              }
              this.opt.options=data
              this.filteredOptions = this.FormControl.valueChanges.pipe(
                  startWith(""),
                  map(value => (typeof value === "string" ? value : value.name)),
                  map(name => (name ? this._filter(name) : this.opt.options.slice()))
                );
            } 
            // In Project Sites project based calling code display
            else {
              this.get_country_data(res.data[0].response,item)
            }
          

            })
          }
  
         
         
        } else{
          this.opt.options=[]
        }
        
        this.cf.detectChanges();
      }
      )}

  
    if(this.opt?.optionsDataSource?.collectionName) {
      let name = this.opt.optionsDataSource.collectionName
      // Jsut change usng mutli filter
     
    
        this.dataService.getparentdata(name).subscribe((res: any) => {
          if(res.data !=null){
            this.opt.options=res.data
            if(this.props.country_flag_show == true){
             
              this.opt.options.forEach((option: any) => {
   
                //  option['country_flag'] =`https://www.worldometers.info/img/flags/${option._id.toLowerCase()}-flag.gif`
                option['country_flag'] = `https://flagsapi.com/${option._id}/flat/64.png`;
             });
              
              this.filteredOptions = this.FormControl.valueChanges.pipe(
                startWith(""),
                map(value => (typeof value === "string" ? value : value.name)),
                map(name => (name ? this._filter(name) : this.opt.options.slice())) // Assuming _filter function works correctly
              );

            
            }else{
            this.filteredOptions = this.FormControl.valueChanges.pipe(
                startWith(""),
                map(value => (typeof value === "string" ? value : value.name)),
                map(name => (name ? this._filter(name) : this.opt.options.slice()))
              );
            }
          } else{
            this.opt.options=[]
          }
          
          this.cf.detectChanges();
        })
      }
   
    }


  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.opt?.options.filter(
        (option:any) => option[this.valueProp].toLowerCase().indexOf(filterValue) === 0
      );
  }

  getdata(){
   
  
  if(this.opt.optionsDataSource.parentcollectionName){
    let collectionName
  if(this.model[this.field.parentcolumn]==this.field.parentvalue){
  collectionName = this.opt?.optionsDataSource?.parentcollectionName
  } else {
    collectionName = this.opt?.optionsDataSource?.parentcollectionName2
  }
  this.getbyID(collectionName,this.selectedValue)
  
  
  }
  
  
  
  }
  
  
  getbyID(collectionName:any,id:any){
    this.dataService.getparentdataById(collectionName,id).subscribe((res:any)=>{
      let data = res.data
      if(data != null){
        if(this.field.parentcolumn!= undefined){
            if(this.model[this.field.parentcolumn]==this.field.parentvalue){
                this.opt.options=res.data[this.field.getby_respone]
              } else if(this.model[this.field.parentcolumn]!=this.field.parentvalue){ 
                this.opt.options=[...res.data[this.field.getby_respone1],...res.data[this.field.getby_respone2]]
                this.opt.options =  _.uniqBy(this.opt.options, '_id');
              } 
        }
        else if(this.field.local_data){
                this.opt.options=res.data[this.field.getby_respone]
        }else {
          this.opt.options=res.data
        }
          this.filteredOptions = this.FormControl.valueChanges.pipe(
            startWith(""),
            map(value => (typeof value === "string" ? value : value.name)),
            map(name => (name ? this._filter(name) : this.opt.options.slice()))
          );
      } else {
        this.opt.options=[]
      } 
    })
  }
  
get_country_data(country_data:any,model_data:any){
  let on_site_country :any[]=[] = model_data["on_site_service_providing_countries"] || []
  let remote_site_country :any[]=[] = model_data["remote_service_providing_countries"] || []
  
  let country = [...on_site_country,...remote_site_country]
  let unique_country = [...new Set(country)];
  let filtered_country = country_data.filter((val :any) => unique_country.includes(val._id)); 
  this.opt.options=filtered_country
  this.filteredOptions = this.FormControl.valueChanges.pipe(
      startWith(""),
      map(value => (typeof value === "string" ? value : value.name)),
      map(name => (name ? this._filter(name) : this.opt.options.slice()))
    );
}


  onValueChanged(event: any) {
    const value = (event.target as HTMLInputElement).value;
    const selectedValue = this.opt.options
    const callingCodes = selectedValue.map((code: any) => code[this.valueProp]);
     if(callingCodes.length == 0){
      this.formControl.setErrors({ error: true });
    }else if (callingCodes.includes(value)) {
      this.formControl.setErrors(null);
    } else {
      this.formControl.setErrors({ error: true });
    }
  }

 
  }