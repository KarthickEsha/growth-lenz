import {ChangeDetectorRef, Component,ElementRef,OnInit, TemplateRef, ViewChild,} from "@angular/core";
import { FieldType } from "@ngx-formly/core";
import { DataService } from "../services/data.service";
import { v4 as uuidv4 } from 'uuid';
import { DialogService } from "../services/dialog.service";
import { FormControl } from "@angular/forms";
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: "file-input",
  template: `

  <style>
  ul>li {
    list-style-position: outside;
  }

  ::ng-deep .custom-mat-form-field .mat-input-element[type="file"] {
    background-color: #f0f0f0; /* Replace with your desired background color */
  }

  .file-input{
    display:flex;
    margin:20px
  }

  .delete-icon {
    width: 20px;
    height: 15px;
    vertical-align: bottom;
    font-size: 16px;
    color: #3e3838;
}
  .show-file{
margin-top:4px !important
width:85%
  }
  </style>
  <div class="file-input">
  
    <input 
      #myInput
      type="file"
      multiple
      [accept]="accept_file_type"
      (change)="onFileSelected($event.target,myInput)" 
      [disabled]="this.field?.props?.readonly"
    
    />
   
    <br/>
    </div>
    <div *ngIf="this.field.props?.required && !this.formControl.value" style="color:red;">{{validation.required}}</div>

  
  <div *ngIf="this.file_datatype =='array'"  class="show-file">
  <li *ngFor="let data of this.file;let i=index"    style="margin-left:20px" >{{data.file_name}}
  <mat-icon   class="delete-icon" (click)="deleteItem(i,data)">delete</mat-icon>
</li>
  </div>

  <div *ngIf="this.file_datatype=='object' && this.file.length!=0"  style="width:85%">
  <ul style=display:flex>
  <li style="margin-left:38px" >{{this.file}}</li>
  <mat-icon   class="delete-icon" (click)="deleteItem(0,this.file)">delete</mat-icon>
  </ul>
  </div>


  <ng-template let-data #dialog_box>
  <div style="height: fit-content;">
    <div style="text-align-last: end">
      <mat-icon  (click)=this.dialogservice.closeModal()>close</mat-icon>
    </div>
    <div class="reason">
      <p style="text-align: center;">Are you sure,you want to delete this file?
      </p>
    </div>
    <div style="text-align-last: center; width: 100%; margin: 1px 1px 1px -14px;">

      <button style="margin: 5px;" mat-raised-button (click)="yes(data)">
        Yes
      </button>

      <button style="margin: 5px;" mat-button  (click)=this.dialogservice.closeModal()>
        No
      </button>
    </div>
  </div>
</ng-template>




<!--Loader while api call  -->
<div *ngIf="show_spinner">
<ngx-spinner bdColor = "rgba(0, 0, 0, 0.8)" size = "medium" color = "#fff" type = "line-spin-clockwise-fade" [fullScreen] = "true"><p style="color: white" > Processing... </p></ngx-spinner>
</div>

  `,
})
export class FileInput extends FieldType<any> implements OnInit {
  show_files:boolean=false
  @ViewChild("dialog_box", { static: true }) dialog_box!: TemplateRef<any>;
  @ViewChild('myInput') public inputElementRef!: ElementRef;
  show_spinner:boolean=false
  accept_file_type:any
  constructor(
    public dataservice:DataService,
    public dialogservice:DialogService,
    private cf: ChangeDetectorRef,
    private loader: NgxSpinnerService

  ) {
    super();
  }

selectedFiles: any[]=[]
file:any[]=[]
refid:any
show_tash_icon:boolean=false
show_button:boolean=true
file_datatype:any
file_data:any
filedata:any
validation:any


public get thisFormControl() {
  return this.formControl as FormControl;
  
}
  ngOnInit(): void {
    debugger
    this.show_spinner=false
    this.accept_file_type=this.field.accept_type || "image/*"
    this.validation=this.field.validation?.messages
    this.file_datatype=this.field.data_type || 'array'
   let data=  this.model[this.field.key]
   this.filedata=this.model
    if(data?.length!=0 && data!=undefined && this.file){
      this.show_tash_icon=true
      this.file=data
    }
  }



  reset(file:any) {
    this.file=[]
    file.value = "";
  }

   onFileSelected(target: any,value:any) {
     this.show_spinner=true
     this.loader.show();
     if(this.field.bind_key){
      if(this.model[this.field.bind_key]==undefined){
        this.file=[]
        value.value = "";
        return this.dialogservice.openSnackBar(`${this.field.error_msg}`,"OK")
      }
  
    }
     this.show_button =false
      this.selectedFiles=target.files

      if(this.field.data_type == "object"){

        this.file=target.files[0].name

      } else {
        for(let i=0;i< this.selectedFiles.length;i++){
          this.file.push({"file_name":this.selectedFiles[i].name})
        }
      }


      let id=uuidv4()

    const formData = new FormData();
    const modifiedFiles: File[] = [];
  
    // Replace file name which has empty space by underscore 
  if (this.selectedFiles && this.selectedFiles.length > 0) {
    for (let i = 0; i < this.selectedFiles.length; i++) {
      const file: File = this.selectedFiles[i];
      const fileNameWithUnderscores = file.name.replace(/\s/g, '_');
      
      // Create a new File object with the modified filename
      const modifiedFile = new File([file], fileNameWithUnderscores, { type: file.type });
      modifiedFiles.push(modifiedFile);
    }
  }

    for(let i=0; i<modifiedFiles.length;i++){
      formData.append('file', modifiedFiles[i]);
      console.log(formData)
    }


    if(this.field.bind_key){
      if(this.model[this.field.bind_key]==undefined){
        return this.dialogservice.openSnackBar(`${this.field.error_msg}`,"OK")
      }
      formData.append(this.field.refId,this.model[this.field.bind_key]);
      formData.append("category",this.field.category);
    }
   else  if(this.field.unique_key){
      formData.append(this.field.profile_field,this.model[this.field.profile_value]);
      formData.append(this.field.refId,this.model[this.field.unique_key]);
      formData.append("category",this.field.category);
    }else{
      formData.append(this.field.refId,id);
      formData.append("category",this.field.category);
    }

    
   
  // this.dataservice.fileupload(formData).subscribe((res:any)=>{
  //   debugger
  //   this.loader.hide();
  //   this.show_spinner=false
  //   if (res.data) {
  //     this.show_button=true
  //     if(this.field.data_type == "object"){
  //       this.file=res.data.file_name
  //       this.filedata=res.data
  //     } else {
  //       this.file=res.data
  //     }
  //     this.dialogservice.openSnackBar(res.message,"OK")
  //       this.field.formControl.setValue(res.data);
  //       this.cf.detectChanges()
  //   }
  // },error=>{
  //   this.loader.hide();
  //   this.show_spinner=false
  //   this.dialogservice.openSnackBar(error.error?.message, "OK")
  //   if(error?.error?.file_size_exceed == true){
  //     this.file=[]
  //     this.filedata=[]
  //      value.value = "";
  //      this.cf.detectChanges();
  //   }
  // })



    }  

    toggleButtons(index: number, show: boolean): void {
      this.file[index].show_icon = show;
    }
    deleteItem(index: number,data:any): void {
      debugger
      if(this.field.data_type == "object"){

        data=Object.assign(this.filedata,{"index":index})
        this.prompt(data)
      } else {
        data=Object.assign(data,{"index":index})
        this.dialogservice.openDialog(this.dialog_box, "30%", null, data);
      }
      
     
    }
    yes(item:any){
      let collection:any
      if(this.model[this.field.parent_key]!=undefined){
        collection="delete-file/"+this.field.collectionName+"/"+this.model[this.field.parent_key]+"/"+this.field.key 
      }else {
        collection="delete-file/"+this.field.collectionName+"/"+item[this.field.Id]+"/"+this.field.key 
      }
      
      let id =this.model[this.field.parent_key]
//       this.dataservice.deleteById(collection,item.id).subscribe((res:any)=>{
//       this.dialogservice.openSnackBar(res.message,"OK")
//       if(this.field.data_type == "object"){
//         let file:any=this.file
//         this.file= file.replace(/\([^)]*\)/g, '');
//         this.inputElementRef.nativeElement.value='' 
//         this.cf.detectChanges();
//       }else{
//         this.file.splice(item.index,1)
//         this.inputElementRef.nativeElement.value='' 
//       }
      
//       this.dialogservice.closeModal()
//       this.cf.detectChanges();
     
// })
    }


  prompt(item:any){
  let collection="delete-file/"+this.field.collectionName+"/"+item[this.field.profile_value]+"/"+this.field.category
    if (confirm("Do you wish to delete this file?")) {
      // this.dataservice.deleteById(collection,item.id).subscribe((res:any)=>{
       
      //     this.dialogservice.openSnackBar(res.message,"OK")
      //     this.file=[]
      //     this.filedata=[]
      //     this.inputElementRef.nativeElement.value='' 
      //     this.formControl.setErrors({ invalid: true });
      //     this.cf.detectChanges();        
      // },error=>{

      //   if(error?.error?.file_size_exceed == true){
      //     this.file=[]
      //     this.filedata=[]
      //     this.inputElementRef.nativeElement.value='' 
      //     this.formControl.setErrors({ invalid: true });
      //   }
      // });
    }
   
  }
}