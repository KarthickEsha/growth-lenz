
import { ThisReceiver } from '@angular/compiler';
import { Component, OnInit, TemplateRef, ViewChild, NgModule, AfterViewInit, ElementRef, ChangeDetectorRef } from '@angular/core';
import { AbstractControl, FormControl, Validators } from '@angular/forms';
import { FieldType, FormlyFieldConfig } from '@ngx-formly/core';
import { DataService } from '../services/data.service';
import { DialogService } from '../services/dialog.service';
import * as _ from 'lodash';
import { SharedService } from '../services/utils';

@Component({
  selector: 'select-input',
  template: `

  <!-- <div class="center"><span>{{field.props!['label']}}</span></div> -->

  <mat-form-field>
  <mat-label>{{field.props!['label']}}</mat-label>
  <mat-select
  #matSelectInput
      [formlyAttributes]="field"
      [formControl]="thisFormControl"
      [required]="this.field.props.required"
      *ngIf="!field.props.readonly"
>
  <mat-option
  *ngFor="let op of this.opt.options"
    [value]="op[this.valueProp]" (click)="selectionChange(op,$event)" (onSelectionChange)="selectionChange(op,$event)"
  >
  <span [innerHTML]="op[this.labelProp]"></span>

  </mat-option>
</mat-select>
<mat-error *ngIf="this.field.props.required">{{field.validation.messages['required']}}</mat-error>

      <input matInput readonly [formlyAttributes]="field"    [value]="selectedValue" [formControl]="thisFormControl"
*ngIf="field.props.readonly" [required]="true"/>

</mat-form-field>
  `,
})


export class SelectInput extends FieldType<any> implements OnInit {
  opt: any;
  data: any
  currentField: any
  //default prop setting

  //default prop setting
  valueProp = "id"
  labelProp = "name"
  dropdown: any
  selectedValue: any = ""
  constructor(
    public dataService: DataService,
    private cf: ChangeDetectorRef,
    private dialogService: DialogService,
    private sharedService:SharedService
  ) {
    super();
  }

  public get thisFormControl() {
    return this.formControl as FormControl;
    
  }

    ngOnInit() {
    this.opt = this.field.props || {};
    this.labelProp = this.opt.labelProp;
    this.valueProp = this.opt.valueProp;
    this.currentField = this.field

//  ?  Dynamic API Call created using Formly Form Design
    if (this?.opt?.['methodType']&& this?.opt?.['fetch'] != 'staic' ) {
          try {
            // Await the response from dataHandler
            let response =  this.dataService.dataHandler(this.opt, this.model);
            console.log("Response Received:");
            console.log(response); // Ensure that this logs the actual response, not a Promise.
        
            // Assuming buildOptions does not return a promise
            this.dataService.buildOptions(response, this.opt);
          } catch (error) {
            console.error("Error handling data:", error);
          }
          return
        }
        if (this.field.key === "modelName") {
          let model_name = sessionStorage.getItem("model_name");
          console.log(model_name);
         console.log(this.field);
         var filterCondition1 =
          {filter: [
          {
           clause: "AND",
           conditions: [
            { column: 'model_name', operator: "NOTEQUAL", value: model_name },
            { column: 'is_collection', operator: "NOTEQUAL", value: "Yes" },
           ]
          }
          ]}
          // model_config
          //! to chnage 
          // this.dataService.getotherModuleName(model_name)
          this.dataService.getDataByFilter('model_config',filterCondition1)
          .subscribe((abc: any) => {
            console.log(abc);
            
            const unmatchedNames = abc.data[0].response;
    
            // Update the options array within the subscription
            this.field.props.options = unmatchedNames.map((name: any) => {
              return { label: name.model_name, value: name.model_name };
            });
            this.opt.options = this.field.props.options;
            console.log(this.opt.options)
          });
        }
       
    
    // If the parent data(remote service) based child(currency code) data
    if(this.field.parent_data){
      this.getChildData()
    }


    //bind the calling code based on the country while edit 
    if(this.opt.onValueChangeUpdate?.local_data){
      sessionStorage.setItem(this.opt.onValueChangeUpdate?.local_data,this.model[this.field.key])
    }



    if(this.opt?.update_model_name && this.model['_id']!=undefined){
      let value =this.opt.update_field_name
      let item=this.opt.update_model_field
      let item2 = this.field.key.split('.')
      this.model[value[0]]=this.model[item2[0]][item]
    }


     if(this.opt?.optionsDataSource?.collectionName) {
      let name = this.opt.optionsDataSource.collectionName
      // Jsut change usng mutli filter
     

        this.dataService.getDataByFilter(name,{}).subscribe((res: any) => {
          this.dataService.buildOptions(res.data[0].response, this.opt);
  
          if(this.field.props.attribute){     //if the data in array of object
          let data= this.field.key.split(".").reduce((o:any, i:any) =>
            o[i], this.model
           );
           this.field.formControl.setValue(data)
           this.getSelectedValue()
          }else{
            this.field.formControl.setValue(this.model[this.field.key])
            this.getSelectedValue()
          }

          if(this.field.props.modelRefObject == 'selectedProject' || this.field?.props.updateModelDiff || this.field.props.updateModel){
            this.get_child_data()
          }
        })
    }

    if(this.currentField.parentKey!= "") {
      (this.field.hooks as any).afterViewInit = (f:any) => {
          const parentControl = this.form.get(this.currentField.parentKey)//this.opt.parent_key);
          parentControl?.valueChanges.subscribe(async (val:any) =>{
            let selectedOption:any
            if(val==undefined)return
            if(this.field.props.attribute=="array_of_object"){
              selectedOption=this.field.parentKey.split(".").reduce((o:any, i:any) =>
                o[i], this.model
               );
            }else{
              selectedOption = this.model[this.currentField.parentKey]
            }

            
            if (this?.opt?.['methodType']&& this?.opt?.['fetch'] != 'staic' ) {
              try {
                let response = await this.dataService.dataHandler(this.opt, this.model);
                this.dataService.buildOptions(response, this.opt);
              } catch (error) {
                console.error("Error handling data:", error);
              }
              return
            }


           if( selectedOption!=undefined && this.opt.optionsDataSource?.ParentcollectionName){
            this.dataService.getparentdataById(this.opt.optionsDataSource?.ParentcollectionName,selectedOption).subscribe((res: any) => {
              if(res.data==null){
           this.opt.options=[]
              }else{
                this.dataService.buildOptions(res, this.opt);
              }
              if(this.field.props.attribute){      //if the data in array of object
                let data= this.field.key.split(".").reduce((o:any, i:any) => o[i], this.model);
                 this.field.formControl.setValue(data)
                 this.getSelectedValue()
                }else{
                  this.field.formControl.setValue(this.model[this.field.key])
                  this.getSelectedValue()
                }

                if(this.field.props.updateModel){
                  this.get_child_data()
                }

              
            })
           }


           if( selectedOption!=undefined && this.opt.optionsDataSource.local_data){
            this.dataService.getparentdataById(this.opt.optionsDataSource?.local_collection_name,selectedOption).subscribe((res: any) => {
              if(res.data==null){
           this.opt.options=[]
              }else{
                let data=res.data[this.opt.column]
                
                let value:any=[]
               if(data){
                 if(data.on_site == true){
                  value.push({name:this.field.changelabelvalue[0]})
                }

                if(data.remote == true){
                  value.push({name:this.field.changelabelvalue[1]})
                }
                console.log(value,"dropdown_data")
                this.opt.options=value
                this.cf.detectChanges();
                this.field.formControl.setValue(this.model[this.field.key])
                // this.getSelectedValue()
               }
              }
            })
           
           }

            if(this.field.parent_data){
             
                this.dataService.getparentdata("entities/country").subscribe((res: any) => {
               let data = res.data
               let on_site_country :any[]=[] = this.model["on_site_service_providing_countries"] || []
               let remote_site_country :any[]=[] = this.model["remote_service_providing_countries"] || []
               
               let country = [...on_site_country,...remote_site_country]
               let unique_country = [...new Set(country)];
                this.opt.options = data.filter((val :any) => unique_country.includes(val._id));
                 this.cf.detectChanges()
                })
              
    }


           if(this.opt.custom_data && val!=undefined){
            this.get_custom_data(val)
          }

    //  Multifilter API in parent and child 
    if(this.opt?.optionsDataSource?.multifilter){
      this.opt.multifilter_condition.conditions.map((res:any)=>{
       
        if(res.value!=undefined && this.field.getdata){
         let value = sessionStorage.getItem(this.field.column)
          res.value=value
        }

        if(res.value!=undefined &&res.getdata == 'model'){
          let value = sessionStorage.getItem(res.field)
           res.value=value
         }
         if(res.value!=undefined &&res.model_data){
          let value = this.model[res.field]
           res.value=value
         }

         if(res.nested_object){
          let value=this.field.parentKey.split(".").reduce((o:any, i:any) =>
                o[i], this.model
               );
           res.value=value
         }

        if(res.getdata == "session"){
          let value = sessionStorage.getItem(res.field)
           res.value=value
         }
      
      })
      let filter_condition={filter:[
        this.opt.multifilter_condition
      ]}

      this.dataService.getDataByFilter(this.opt?.optionsDataSource?.multifilter,filter_condition).subscribe((res:any)=>{
        if(res.data==null){
          this.opt.options=[]
             }else{
               this.dataService.buildOptions(res.data[0].response, this.opt);
             }
             if(this.field.props.attribute){      //if the data in array of object
               let data= this.field.key.split(".").reduce((o:any, i:any) => o[i], this.model);
                this.field.formControl.setValue(data)
                this.getSelectedValue()
               }else{
                 this.field.formControl.setValue(this.model[this.field.key])
                 this.getSelectedValue()
               }

               if(this.field.props.updateModel){
                 this.get_child_data()
               }
        this.cf.detectChanges();
      })
}
          })
        }
     }


      //  Multifilter API
      if(this.opt?.optionsDataSource?.multifilter){
        this.opt.multifilter_condition.conditions.map((res:any)=>{
         
          if(res.value!=undefined && this.field.getdata){
           let value = sessionStorage.getItem(this.field.column)
            res.value=value
          }

          if(res.value!=undefined &&res.getdata == 'model'){
            let value = sessionStorage.getItem(res.field)
             res.value=value
           }


          if(res.getdata == "session"){
            let value = sessionStorage.getItem(res.field)
             res.value=value
           }
        
        })
        let filter_condition={filter:[
          this.opt.multifilter_condition
        ]}

        this.dataService.getDataByFilter(this.opt?.optionsDataSource?.multifilter,filter_condition).subscribe((res:any)=>{
          if(res.data !=null){
            this.dataService.buildOptions(res.data[0].response, this.opt);
          }

          // No data found in dropdown,show msg
          if(res.data == null && this.field.show_nodatafound_msg){
            this.dialogService.openSnackBar("No "+`${this.opt.label}`+" found","OK")  
            }
          
          if(this.field.onchange_parent == true){
            this.get_child_data()
          }

          if(this.field.props.attribute){    //if the data in array of object
            let data= this.field.key.split(".").reduce((o:any, i:any) =>
              o[i], this.model
             );
             this.field.formControl.setValue(data)
             this.getSelectedValue()
             
            }else{
              this.field.formControl.setValue(this.model[this.field.key])
              this.getSelectedValue()
            }
  
            if(this.field.props.modelRefObject == 'selectedProject' || this.field?.props.updateModelDiff || this.field.props.updateModel){
              this.get_child_data()
            }

          this.cf.detectChanges();
        })
  }




  if(this.opt.custom_data && this.model[this.field.key]!=undefined){
    debugger
    let val = this.model[this.field.parentKey]
    this.get_custom_data(val)
   
  }


  if(this.field?.hard_coded_data){
    let data =this.opt.options
    this.dataService.buildOptions(data, this.opt);
  }



}



  initialOnlineValues:any
  private initialOnlineValuesTaken = false;
  selectionChange(selectedObject: any,event:any) {
    debugger
    if (selectedObject && this.opt.patternToZipcode) {
      if (typeof this.opt.patternToZipcode === 'object') {
        const { key, valueProp } = this.opt.patternToZipcode;
        const pattern = selectedObject[valueProp];
        // Set pattern validator
        this.field.formControl.parent.controls[key].setValidators([Validators.pattern(pattern)]);
        this.field.formControl.parent.controls[key].updateValueAndValidity();
      }
    
    }


    if(event.isUserInput == false){
      return 
    }

    // Based on the currency code selection in project,set the currency symbol in form value
    if(this.field.add_child_field){
       this.model[this.field.add_column]=selectedObject[this.field.column_name]
       this.form.value[this.field.add_column]=selectedObject[this.field.column_name]
    }

    // In job(Dispatch/Dedicated/Schedule) Service Project based Business hours bind in model
    if(this.field.parent_based_data){
     this.field.parent_based_column.forEach((a:any)=>{
        this.model[a]=selectedObject[a]
        this.form.value[a]=selectedObject[a]
        this.field.form.controls[a].setValue(selectedObject[a])
      })
    }

    if (this.opt.setModelValues === true) {
      if (selectedObject._id === this.field.optionValues[0] && !this.initialOnlineValuesTaken) {
        this.initialOnlineValues = _.cloneDeep(this.model);
        this.initialOnlineValuesTaken = true;
      } else if (selectedObject._id === this.field.optionValues[1] && !this.initialOnlineValuesTaken) {
        this.initialOnlineValues = _.cloneDeep(this.model);
        this.initialOnlineValuesTaken = true;
      } 
      else if (selectedObject._id === this.field.optionValues[0] && this.initialOnlineValuesTaken) {
        for (const key of Object.keys(this.initialOnlineValues)) {
          this.model[key] = this.initialOnlineValues[key];
        }
      } 
    }
  


    if(this.field.emptyChildKey == true && this.model[this.field.childKey]){
      this.formControl.parent.controls[this.field.childKey].setValue(null)

    }
    


    if(this.opt.update_model_name){
      let value =this.opt.update_field_name
      this.model[value[0]]=selectedObject[value[1]]
    }

        if (selectedObject && this.opt.onValueChangeUpdate && this.opt.onValueChangeUpdate instanceof Array) {
      for (const obj of this.opt.onValueChangeUpdate) {
        this.field.formControl.parent.controls[obj.key].setValue(
          selectedObject[obj.valueProp]
        );
      }
    }
    if (selectedObject && this.opt.patternToZipcode) {
      if (typeof this.opt.patternToZipcode === 'object') {
        const { key, valueProp } = this.opt.patternToZipcode;
        const pattern = selectedObject[valueProp];
        // Set pattern validator
        this.field.formControl.parent.controls[key].setValidators([Validators.pattern(pattern)]);
        this.field.formControl.parent.controls[key].updateValueAndValidity();
      }
    
    }



    if (this.opt.modelRefObject) {
      debugger
      this.model[this.opt.modelRefObject] = selectedObject
      if(this.opt.setLabel == true){
        this.model[this.opt.labelKey1] = selectedObject[this.opt.labelKey1]
        this.model[this.opt.labelKey2] =selectedObject [this.opt.labelKey2]
      }
    }    

    if(this.opt.onValueChangeUpdate){
      this.field.form.controls[this.opt.onValueChangeUpdate.key].setValue(
        selectedObject[this.opt.onValueChangeUpdate.key]
      );
      //selectedObject={}
      if(this.opt.onValueChangeUpdate?.local_data){
        sessionStorage.setItem(this.opt.onValueChangeUpdate?.local_data,this.model[this.field.key])
      }
     
    }

    if(this.opt.onChangeUpdate){
      sessionStorage.setItem(this.opt.onChangeUpdate?.local_data,selectedObject[this.opt.onChangeUpdate.key])
    }

    if(this.opt.updateModel==true){
      this.model[this.field.key]=selectedObject[this.opt.valueProp]
      this.model[this.opt.labelProp]=selectedObject[this.opt.labelProp]
      }
      if(this.opt.updateModelDiff==true){
      this.model[this.opt.updateModelDiffName]=selectedObject[this.opt.labelProp]
      }
      if (this.field.key === "modelName") {
        let model_name = sessionStorage.getItem("model_name");
        console.log(model_name);
       console.log(this.field);
       var filterCondition1 =
        {filter: [
        {
         clause: "AND",
         conditions: [
          { column: 'model_name', operator: "NOTEQUAL", value: model_name },
         ]
        }
        ]}
        // model_config
        //! to chnage 
        // this.dataService.getotherModuleName(model_name)
        this.dataService.getDataByFilter('model_config',filterCondition1)
        .subscribe((abc: any) => {
          console.log(abc);
          
          const unmatchedNames = abc.data[0].response;
  
          // Update the options array within the subscription
          this.field.props.options = unmatchedNames.map((name: any) => {
            return { label: name.model_name, value: name.model_name };
          });
          this.opt.options = this.field.props.options;
          console.log(this.opt.options)
        });
      }
     



      if(this.field.child1){
// set the flag to identify it is user Input
      this.model['parentTrigger'] = true
     

        if(this.model[this.field.child1] != undefined){
          delete this.model[this.field.child1]
        }
        if(this.field.form.controls[this.field.child1] != undefined){
          this.field.form.controls[this.field.child1].setValue(null)
        }

        if(this.field.form.controls[this.field.child3] != undefined){
          this.field.form.controls[this.field.child3].setValue(null)
        }
      
        if(this.field.form.controls[this.field.child2] != undefined){
          this.field.form.controls[this.field.child2].setValue(null)
        }

      }





  }



  get_child_data(){
    let value=this.model[this.field.key]
  let selected_data=  this.opt.options.find((a:any)=>{
    return  a['_id'] == value
    })

    if(this.field?.props.updateModelDiff ){
      this.model[this.opt.updateModelDiffName]=selected_data[this.opt.labelProp]
    }

    if(this.field.props?.updateModel){
      this.model[this.opt.labelProp]=selected_data[this.opt.labelProp]
    }


    if(this.opt.onChangeUpdate){
      sessionStorage.setItem(this.opt.onChangeUpdate?.local_data,selected_data[this.opt.onChangeUpdate.key])
    }


    
    if (this.opt.modelRefObject) {
      this.model[this.opt.modelRefObject] = selected_data
    }   
  }


  getSelectedValue() {
 debugger
    if (this.model[this.field.key]!=undefined && this.opt.readonly){
      this.selectedValue = this.opt.options.find((o: any) => o[this.valueProp] === this.model[this.field.key])[this.labelProp]  
 }
    
    // this.formControl.setValue(this.model[this.field.key])
      // return this.selectedValue



      // if the value is not present in the dropdown ,set as error
      if(this.model[this.field.key]!=undefined && this.field.check_validation){
        let isPresent = this.opt.options.some((obj:any) => obj[this.valueProp] === this.model[this.field.key]);
        if (!isPresent) {
          this.field.formControl.setErrors({"invalid":true})
        } else {
          this.field.formControl.setErrors(null)
        }
      }

      if(this.field.props.attribute=="array_of_object" && this.field.check_validation){
      let data= this.field.key.split(".").reduce((o:any, i:any) =>
            o[i], this.model
           );
           if(data!=undefined){
            let isPresent = this.opt.options.some((obj:any) => obj[this.valueProp] === this.model[this.field.key]);
            if (!isPresent) {
              this.field.formControl.setErrors({"invalid":true})
              this.field.formControl.setValue(null)
            } else {
              this.field.formControl.setErrors(null)
            }
          }
        }
  }


//For System User,role hierarchy
  get_custom_data(val:any){
    this.dataService.getDataByFilter(this.opt.optionsDataSource.childcollectionName,{}).subscribe((res: any) => {
      if(res.data!=null ){
        let data = res.data
        let hierarchy_lvl=this.opt.hierarchy_level1
//  this.opt.options = data.filter((a:any)=>{
if(val == this.opt.check_condition[0]){
   this.opt.options = data.filter((a:any)=>{
      if((a[this.field.key] == hierarchy_lvl[0].min )||( a[this.field.key] == hierarchy_lvl[0].max)){
       return a
     }
   })
   console.log(this.opt.options ,"System User")
}

if(val == this.opt.check_condition[1]){ 
this.opt.options = data.filter((a:any)=>{
  if((a[this.field.key] == hierarchy_lvl[1].min )||( a[this.field.key] == hierarchy_lvl[1].max)){
    return a
  }
})
console.log(this.opt.options ,"Corporate Customer")
}

if(val == this.opt.check_condition[2]){

this.opt.options = data.filter((a:any)=>{
  if((a[this.field.key] == hierarchy_lvl[2].min )||( a[this.field.key] == hierarchy_lvl[2].max)){
    return a
  }
})
console.log(this.opt.options ,"SAAS")
}
if(this.model[this.field.key]){
  this.field.formControl.setValue(this.model[this.field.key])
}
this.cf.detectChanges();
      }
    })
  }



  // Subsribe the data for currency code from remote service country in Project
  getChildData():void {
    this.sharedService.currentDataList.subscribe(item => {
      if(this.field.parent_data){
        this.dataService.getparentdata("entities/country").subscribe((res: any) => {
       let data = res.data
       let on_site_country :any[]=[] = this.model["on_site_service_providing_countries"] || []
       let remote_site_country :any[]=[] = item || []
       
       let country = [...on_site_country,...remote_site_country]
       let unique_country = [...new Set(country)];
        this.opt.options = data.filter((val :any) => unique_country.includes(val._id));
         this.cf.detectChanges()
        })
      }
    });
  }
}

