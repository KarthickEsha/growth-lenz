
import { Component, OnInit, AfterViewInit, TemplateRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { FormControl } from '@angular/forms';
import { FieldType, FormlyFieldConfig } from '@ngx-formly/core';
import { values } from 'lodash';
import { Observable } from 'rxjs';
import { DataService } from '../services/data.service';
import { DialogService } from '../services/dialog.service';
import { MatDialog } from '@angular/material/dialog';
import * as _ from 'lodash';
import { FormGroup } from '@angular/forms';
@Component({
  selector: 'custompopup-input',
  template: `
  <style>
  .mat-mdc-dialog-container .mdc-dialog__surface {
    width: 100%;
    height: 100%;
    overflow: hidden !important;
}

  .mat-mdc-dialog-container::-webkit-scrollbar{
    display: none !important;

  }
  .badge {
    color: black;
    padding: 4px 8px;
    text-align: center;
    border-radius: 20px;
    border:1px solid black
  }

  .mat-button{
    display: flex;
    position:absolute;
    bottom:0;
    right:0;
  }
  .item{
    max-width: 300px;
    overflow-wrap: break-word !important;
    word-wrap: break-word !important;
    
  }

  // .bind-data{
  //     width: 50%;
  //     display: flex;
  //     flex-direction:row;
  //     grid-gap: 9px;
  //     margin: 27px -2px;
  //     flex-wrap: wrap;
  // }
  
  .mat-icon {
    -webkit-user-select: none;
    user-select: none;
    background-repeat: no-repeat;
    display: inline-block;
    fill: currentColor;
    height: 22px;
    width: 24px;
    overflow: hidden;
    font-size: 20px;
    vertical-align:middle  !important;
}
  


  .border{
    border: 1px solid rgb(158,158,158) !important;
    margin-bottom: 37px;
    border-radius: 4px;
    height: 50px;
    text-align: center;
  }
  

  .parent {
    display: flex;
    flex-wrap: wrap;
    width: 90%;
    margin: 9px 2px 10px 0px;
}

.parent   > div {
  overflow-wrap: break-word;
  max-width: 300px;
  margin: 2px;
  text-align: left;
}


.predefined-style{
  margin: 5px 12px;
  width: fit-content;
  border: 1px solid black;
  border-radius: 25px;
  padding: 1px 1px 1px 5px;
}



  
  .child{
    word-wrap: break-word;
    overflow-wrap: break-word;
    width: fit-content;
    border: 1px solid #ccc;
    padding: 10px;
    height:fit-content;
    color: black;
    padding: 2px 8px;
    border-radius: 12px;
    margin: 5px 1px 1px 1px;
    flex-direction: column;
}
  
  </style>

<div style="margin:28px 2px">
  <mat-label style="color:black;">{{field.props!['label']}}</mat-label>
  
  <button
  type="button"
       [formlyAttributes]="field"
        matTooltip="Add"
        mat-mini-fab
        (click)="onAddButonClick($event)"
        [disabled]="this.field.props.readonly" 
        style="
          margin-left: 30px;
          background-color: #B0B0B0;
          color: white;
          height: 24px;
          width: 24px;
          font-size: 9px;
          line-height: 3;
          vertical-align: middle;
        "
      >
        <mat-icon>add</mat-icon>
      </button>
      <div *ngIf="this.display_data == false">
      <div *ngIf="this.field.props?.required && !this.formControl.value" style="color:red;">{{error}}</div>
      <div  class="parent" [formControl]="FormControl" [formlyAttributes]="field" >
      <div class="child" *ngFor="let item of custom_data;let i=index" >
     {{item}}<mat-icon (click)=remove_data(i,item)>close</mat-icon>
      </div>
      </div>
</div>


<div *ngIf="this.display_data == true">
      <div *ngIf="this.field.props?.required && !this.formControl.value" style="color:red;">{{error}}</div>
      <div  class="parent" [formControl]="FormControl" [formlyAttributes]="field" >
      <div class="child" *ngFor="let item of this.custom_data;let i=index" >
     {{item[this.labelProp]}}<mat-icon  *ngIf="!this.field.props.readonly"  (click)=remove_data(i,item)>close</mat-icon>
      </div>
      </div>
</div>
      
      </div>




    <ng-template   #editViewPopup  style="height: auto">
    <div style="text-align-last: end">
    <mat-icon (click)="close()">close</mat-icon>
  </div>
  <div>
    <mat-tab-group preserveContent>
     <mat-tab  label={{this.field.label1}}>
    <div style="height:300px;margin:0px 5px 0px 5px" *ngIf="this.field.group==false">
    <ng-select
    [items]="dropdownList"
    [clearSearchOnAdd]="true"
    [multiple]="true"
    [bindLabel]="labelProp"
    [closeOnSelect]="false"
    [bindValue]="valueProp"
    [(ngModel)]="selected_data"
    (close)="onchange_data($event)"
    [isOpen]="true"
    appearance='outline'
    >
    <ng-template ng-option-tmp let-item="item" let-item$="item$" let-index="index">
      <input id="item-{{index}}" type="checkbox" [ngModel]="item$.selected" [ngModelOptions]="{standalone: true}"/>
      <span style="margin-left:5px" [innerHTML]="item[this.labelProp]"></span>
  </ng-template> 

  <ng-template ng-multi-label-tmp let-items="items" let-clear="clear">
  <div class="ng-value" *ngFor="let item of items | slice:0:2">
    <span class="ng-value-label"> {{$any(item)[this.labelProp]}}</span>
    <span class="ng-value-icon right" (click)="clear(item)"  aria-hidden="true">×</span>

  </div>
  <div class="ng-value" *ngIf="items.length > 2">
    <span class="ng-value-label">{{items.length - 2}} more...</span>
  </div>
</ng-template>
  </ng-select>
   </div>


   <div style="height:300px;margin:0px 5px 0px 5px" *ngIf="this.field.group==true">
    <ng-select
    [items]="dropdownList"
    [clearSearchOnAdd]="true"
    [multiple]="true"
    [bindLabel]="labelProp"
    groupBy="data"
    [closeOnSelect]="false"
    [bindValue]="valueProp"
    [(ngModel)]="selected_data"
    (change)="onchange_data($event)"
    [isOpen]="true"
    appearance='outline'
    >
    
    <ng-template ng-option-tmp let-item="item" let-item$="item$" let-index="index">
      <input id="item-{{index}}" type="checkbox" [ngModel]="item$.selected" [ngModelOptions]="{standalone: true}"/>
      <span style="margin-left:5px" [innerHTML]="item[this.labelProp]"></span>
  </ng-template> 
    <ng-template ng-optgroup-tmp let-item="item">
    {{item[this.labelProp]}}
</ng-template>
<ng-template ng-option-tmp let-item="item">
    {{item[this.labelProp]}}
</ng-template>


<ng-template ng-multi-label-tmp let-items="items" let-clear="clear">
  <div class="ng-value" *ngFor="let item of items | slice:0:2">
    <span class="ng-value-label"> {{$any(item)[this.labelProp]}}</span>
    <span class="ng-value-icon right" (click)="clear(item)"  aria-hidden="true">×</span>

  </div>
  <div class="ng-value" *ngIf="items.length > 2">
    <span class="ng-value-label">{{items.length - 2}} more...</span>
  </div>
</ng-template>
  </ng-select>
   </div>
     
     </mat-tab>
     
     <mat-tab *ngIf="this.field.showcustom == true"  label= {{this.field.label2}}>
     <mat-form-field appearance="fill" style="width:100%;padding:0px 8px">
     <input matInput [pattern]="this.jsonPattern" [formControl]="forminput" [(ngModel)]="username" /><span matSuffix><mat-icon (click)="addcustom()">add</mat-icon></span>
    <mat-error>{{this.error}}</mat-error>
     </mat-form-field>
   
   <div class="predefined-style" *ngFor="let a of  data;let i=index">{{a}}<mat-icon *ngIf="this.data.length!=0" (click)=remove_data_predefined(i,a)>close</mat-icon></div>
     </mat-tab>
     


     </mat-tab-group>
     </div>
     <div class="mat-button">
     <div style="margin-top:auto"><button   (click)="add()" style="margin: 5px" mat-raised-button>Add</button></div>
     <div style="margin-top:auto"><button  mat-button (click)="close()" style="margin: 5px">Cancel</button></div>
     </div>
         
    </ng-template>


  `,

})


export class CustomPopupInput extends FieldType<any> implements OnInit {
  opt: any
  //default prop setting
  valueProp :any
  labelProp :any
  onValueChangeUpdate: any
  label: any
  dropdownList :any[]= []
  selected_data:any[]=[]
  currentField:any
  username:any
  jsonPattern:any
  error:any
  custom_data:any[]=[]
  show:any
  data:any[]=[]
  predefined:any[]=[]
  forminput=new FormControl()
  selected_rowdata:any
  display_data:any
  data_length:any

  @ViewChild("editViewPopup", { static: true }) editViewPopup!: TemplateRef<any>;
  constructor(private dataService: DataService,
    private dialogService:DialogService,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef) {
    super()
  }
  
  public get FormControl() {
    return this.formControl as FormControl;
    
  }
  

  ngOnInit(): void {
    
    
    this.model['selectedFlag']=true
   this.show=this.field.showcustom
    this.label = this.field.props?.labelS
    this.opt = this.field.props || {};
    this.labelProp = this.opt.labelProp
    this.valueProp = this.opt.valueProp
    this.jsonPattern = this.field.props.pattern
    this.error = this.field.validation.messages.required
    this.custom_data=this.model[this.field.key]
    this.currentField=this.field
    this.display_data=this.field.display_name || false
    if(this.model[this.field.key]!=undefined){
      this.selected_data=this.model[this.field.key]
    }
    this.getdata()    
     }


     
     onAddButonClick(event:any){
      
     this.dialogService.openDialog(this.editViewPopup, "40%", "60%", {});
     }

     getdata(){
      if (this.opt.optionsDataSource.collectionName) {
        let name = this.opt.optionsDataSource.collectionName
        this.dataService.getDataByFilter(name,{}).subscribe((res: any) => {
          if(res.data==null) return

          this.dropdownList = res.data
          this.dataService.buildOptions(res, this.opt)

          // to bind the data in the dropdown
          if(this.model[this.field.key]!=undefined){
            this.selected_data=[]
            this.dropdownList.filter((a:any)=>{
              this.model[this.field.key].filter((b:any)=>{
                if(b==a.name){
                  this.selected_data.push(b)
                }
              })
            })

            if(this.selected_data!=undefined){
              this.data=[]
              let data=_.difference(this.model[this.field.key],this.selected_data)
              this.data=data
            }
          }
          
          

        });
      }



        if(this.field.parentkey!= "") {
          (this.field.hooks as any).afterViewInit = (f:any) => {
            
              const parentControl = this.form.get(this.currentField.parentkey)//this.opt.parent_key);
              parentControl?.valueChanges.subscribe((val:any) =>{
                if(val==undefined)return
                let selectedOption = this.model[this.field.parentkey]
                if( selectedOption!=undefined){
                  if(this.model._id != undefined){
                    if(this.model.selectedFlag != true){
                      this.custom_data = []
                      this.selected_data = [] 
                    
        this.field.formControl.setValue(null)
        this.cdr.detectChanges(); 
                    }
                  }else{

                    if( selectedOption!=undefined && this.model.selectedFlag != true &&this.model._id == undefined){
                      this.custom_data = []
                      this.selected_data=[]
                      
        this.field.formControl.setValue(null)
        this.cdr.detectChanges(); 
                    }

                    
                    
                    
                  }
                   if(this.opt.optionsDataSource.multifilter){
                    this.opt.multifilter_condition.conditions.map((res:any)=>{
              
                      if(res.getdata){
                        res.value=this.model[this.field.parentkey]
                      }
                      
                      // if(res.value==""){
                      //   res.value=this.model[this.field.parentkey]
                      // }
                    })
                    let filter_condition={filter:[
                      this.opt.multifilter_condition
                    ]}


                   this.dataService.getDataByFilter(this.opt?.optionsDataSource?.multifilter,filter_condition).subscribe((res:any)=>{
                    //this.dropdownList = res.data[0].response
                     this.model.selectedFlag = false
                     if(res.data == null) return 
                     if(this.field.child_filter){
                       this.dropdownList = res.data[0].response[0].result 
                     } else {
                       this.dropdownList = res.data[0].response
                     }
                      this.custom_data=[]
                    if(this.field.display_name && this.model[this.field.key]!=undefined){
                      this.selected_rowdata=[]
                      if(this.dropdownList.length!=undefined){
                        this.dropdownList.filter((a:any)=>{
                          let data= this.model[this.field.key]
                          data.map((b:any)=>{
                           if(b==a['_id']){
                             this.custom_data.push(a)
                           }
                          })
                         })
                      }

                      // if(this.dropdownList[1]?.data?.length!=undefined){
                      //   this.dropdownList[1]?.data?.filter((a:any)=>{
                      //    let data= this.model[this.field.key]
                      //    data.map((b:any)=>{
                      //     if(b==a['_id']){
                      //       this.custom_data.push(a)
                      //     }
                      //    })
      
                      //   })
                      // }

                      // In model,skill name 
      if(this.opt.updateModel){
        let skill_name:any=[]
        this.custom_data.forEach((res:any)=>{
          skill_name.push(res.name)
        })
        this.model[this.opt.updateModelDiffName]=skill_name
      }
                      
                    }
                     this.cdr.detectChanges()

                   })
                          
                }
              }
                
              })
             
            }
         }




         
         if(this.opt.optionsDataSource.multifilter){
         // this.opt.multifilter_condition.conditions.map((res:any)=>{
            // if(res.operator=="IN"){
            //   res.value=val
            // }

            // if(res.value==""){
            //   res.value=val
            // }
          
         // })
          let filter_condition={filter:[
            this.opt.multifilter_condition
          ]}


         this.dataService.getDataByFilter(this.opt?.optionsDataSource?.multifilter,filter_condition).subscribe((res:any)=>{
          if(res.data==null) return
          this.dropdownList = res.data[0].response
           // to bind the data in the dropdown
           if(this.model[this.field.key]!=undefined){
            this.selected_data=[]
            this.dropdownList.filter((a:any)=>{
              this.model[this.field.key].filter((b:any)=>{
                if(b==a.name){
                  this.selected_data.push(b)
                }
              })
            })

            if(this.selected_data!=undefined){
              this.data=[]
              let data=_.difference(this.model[this.field.key],this.selected_data)
              this.data=data
            }
          }
         })
        }
              
          


     }


     addcustom(){
        
        if(this.forminput.status=='INVALID'){
          return this.dialogService.openSnackBar(this.error,"OK")
        }
        if(this.username!=""){
          this.data.push(this.username)
          this.username=""  
        }
        
     }

     add(){
      let user_data:any=sessionStorage.getItem("user_data")
    user_data=JSON.parse(user_data)
    if(this.field.attributes == "nested_object"){
   let data= this.field.data_length.split(".").reduce((o:any, i:any) =>
         {if(o == undefined){
           return
         }else{
        return  o[i]
         } }, user_data);
         this.data_length = data || 5 
    } else {
      this.data_length = user_data[this.field.data_length] || 5  //Maximum length configuration in SAAS/ Corporate Customer
    }
    let array=[]
        for(let i=0;i<this.data.length;i++){
          array.push(this.data[i])
        }

      

        if(this.selected_data!=undefined ){
        for(let i=0;i<this.selected_data.length;i++){
         array.push(this.selected_data[i])
        }
      }

      if(array.length>this.data_length){
        return this.dialogService.openSnackBar("Maximum" +" "+`${this.data_length }`+ " " +`${this.opt.placeholder}`  +" only allowed to add", "OK")
      }

  


      if(this.custom_data!=undefined){
        this.custom_data=[...array]
      }else{
        this.custom_data=array
      }
      console.log(this.custom_data , "custom_data")
     
      // In model,skill name 
      if(this.opt.updateModel){
        let skill_name:any=[]
        this.selected_rowdata.forEach((res:any)=>{
          skill_name.push(res.name)
        })
        this.model[this.opt.updateModelDiffName]=skill_name
      }


      this.dialogService.closeModal()
      if(this.field.display_name){
        this.custom_data=this.selected_rowdata
        this.cdr.detectChanges(); 
        this.field.formControl.setValue(this.selected_data)
        
      } else {
        this.field.formControl.setValue(this.custom_data)
      }
        
     }

     close(){
      this.dialogService.closeModal()
     }

      onchange_data(event:any){
        if(Array.isArray(event)){
          this.selected_rowdata=event
          this.selected_data
        }
      }

     remove_data(index:any,data:any){
      
       
       if(this.field.display_name == true){
        this.custom_data.splice(index,1)
       // this.selected_rowdata.splice(index,1)
        this.selected_data.splice(index,1)
        this.field.formControl.setValue(this.selected_data)
       
       } else {
        this.custom_data.splice(index,1)
        this.selected_data=this.selected_data.filter((item:any) =>{return  item != data});
        this.data=this.data.filter((item:any) =>{return item !== data});
       }
     }

     remove_data_predefined(index:any,data:any){
      this.data.splice(index,1)
     }

     

}


