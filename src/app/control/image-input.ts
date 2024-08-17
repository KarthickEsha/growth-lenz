// import { ChangeDetectorRef, Component, OnInit, SimpleChanges } from '@angular/core';
// import { FieldType } from '@ngx-formly/core';

// import { DataService } from '../services/data.service';
// import { DialogService } from '../services/dialog.service';

// @Component({
//     selector: 'image-input',
//     template: `

//   <style>
//   .mat-mdc-raised-button{
//     color: white;
// }
//   .mat-raised-button{
//     color:white
//   }
  
//   .delete-icon {
//     position: absolute;
//     top: 4px;
//     right: 4px;
//     color: #ffffff;
//     background-color: rgba(0, 0, 0, 0.6);
//     border-radius: 50%;
//     padding: 2px;
//     cursor: pointer;
//   }
  
//   </style>

//   <mat-label>{{field.props!['label']}}</mat-label>
//   <div>
// <input
//    #myInput
//   type="file"
//   accept="image/*"
//   name="myfile"
//   (change)="onSelectFile($event,myInput)"
//   style="margin-top: 30px;"
// />
// </div>

// <div 
// style="margin-top: 40px; 
//  display: flex; gap: 12px" >

//   <img width="200" height="133" style="object-fit:contain"    [src]="image"  
//   /> 

// </div>  
//   `,
// })
// export class ImageInput extends FieldType<any>  implements OnInit{
 
//   public file: any;
//   urls:any[]=[];
//   refId:any
//   image:any
//   show_button:boolean=true
// constructor(
//   public dataservice:DataService,
//   public dialogservice:DialogService,
//   private cf: ChangeDetectorRef
// ){
//   super();
// }


// ngOnInit(): void {
//   debugger

//   console.log(this.refId)
//   this.image=this.model[this.field.key]
// }

//     onSelectFile(event:any,value:any) {
     

//       if(this.field.bind_key){
//         if(this.model[this.field.bind_key]==undefined){
//           this.file=[]
//           value.value = "";
//           return this.dialogservice.openSnackBar(`${this.field.error_msg}`,"OK")
//         }
    
//       }
//       this.show_button =false
//         let i: number = 0;
//         for (const singlefile of event.target.files) {
//           this.file = singlefile
//           var reader = new FileReader();
//           reader.readAsDataURL(singlefile);
//           this.urls.push(singlefile);
//           this.cf.detectChanges();
//           i++;
//           console.log(this.urls);
//           reader.onload = (event) => {
//             const url = (<FileReader>event.target).result as string;
//             this.image=url
//             this.cf.detectChanges();
//           };
//         }


          
//       let ref=this.field.props.refId
//       this.refId=this.model[ref]
//       const formData = new FormData();
//       if(this.field.bind_key){
//         if(this.model[this.field.bind_key]==undefined){
//           return this.dialogservice.openSnackBar(`${this.field.error_msg}`,"OK")
//         }
//         formData.append('file',this.file);
//         formData.append(this.field.refId,this.model[this.field.bind_key]);
//         formData.append("category",this.field.category);
//       }
//       this.dataservice.imageupload(formData).subscribe((res:any)=>{
//         if(res.data){
//           this.formControl.setValue(res.data.file_path)
//           this.dialogservice.openSnackBar("File Uploaded successfully", "OK")
//           this.show_button =true
//         }
      
//       })
       
       
//     }


//     reset(file:any){
//       file.value = ""
//       this.image=""
//       this.formControl.setvalue("")
//     }

   
   
//   }

import { ChangeDetectorRef, Component, OnInit, SimpleChanges } from '@angular/core';
import { FieldType } from '@ngx-formly/core';

import { DataService } from '../services/data.service';
import { DialogService } from '../services/dialog.service';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from 'src/environments/environment';

@Component({
 selector: 'image-input',
 template: `

<style>
.mat-mdc-raised-button{
 color: white;
}
.mat-raised-button{
 color:white
}

.delete-icon {
 position: absolute;
 top: 4px;
 right: 4px;
 color: #ffffff;
 background-color: rgba(0, 0, 0, 0.6);
 border-radius: 50%;
 padding: 2px;
 cursor: pointer;
}

</style>

<mat-label>{{field.props!['label']}}</mat-label>
<div>
<input
 #myInput
type="file"
accept="image/*"
name="myfile"
(change)="onSelectFile($event)"
style="margin-top: 30px;"
 
/>
<button style="margin-left:2px;margin-right:10px" type="button" color="warn" mat-raised-button (click)="reset(myInput)">

 <span class="glyphicon glyphicon-trash"></span> Reset
 </button>

 <button
 type="button"
 (click)="upload()"
 
 mat-raised-button
 style="color: white;"
 >
 Upload
 </button>
</div>

<div *ngIf="this.multiples"
style="margin-top: 40px;
 display: flex; gap: 12px;" >
  <img width="200" height="133"
 [src]="multiples" 
 />
</div>
<div *ngIf="imageUrl" style="margin-top: 40px; display: flex; gap: 12px;">
 <div *ngFor="let image of [imageUrl]; let index = index">
 <img width="200" height="133" [src]="image" />
 </div>
</div>
`,
})
export class ImageInput extends FieldType<any> implements OnInit {
    
 public file: any;
 multiples:any;
 urls: any[] = [];
 // override id: any
 // id:any
 imageUrl :any
//  response: any
 
 constructor(
 public dataService: DataService,
 private cf: ChangeDetectorRef,
 public dialogService: DialogService,
 private route: ActivatedRoute
 ) {
 super();
 }


 ngOnInit(): void {

    console.log(this.id);
if(this.model.isEdit){
    // To Implemt
    console.log(this.formControl.value);
    console.log(this.model);
    
 this.imageUrl=  environment?.ImageBaseUrl+this.model[this.field.key].storage_name
}
 }

 onSelectFile(event: any) {
    this.imageUrl=''
 this.file = event.target.files[0]
console.log(this.file);

 
 let i: number = 0;
 for (const singlefile of event.target.files) {
 var reader = new FileReader();
 reader.readAsDataURL(singlefile);
 this.urls.push(singlefile);
 this.cf.detectChanges();
 i++;
 console.log(this.urls);
 reader.onload = (event) => {
 const url = (<FileReader>event.target).result as string;
 this.multiples=url;
 console.log(url);
 
 this.cf.detectChanges();
 };
 }
 }


 reset(file: any) {
debugger
 file.value = ""
 this.multiples =null
 this.imageUrl = null   
this.formControl.setValue("")  
  
 }
 
 refId: any
 upload() {
    if(!this.file){
        return this.dialogService.openSnackBar("Select the File First","OK")
    }
let ref=this.field.props.refId
 this.refId=this.model[ref]
 const formData = new FormData();
 if(this.field.bind_key){
 if(this.model[this.field.bind_key]==undefined){
 return this.dialogService.openSnackBar(`${this.field.bind_key.toUpperCase().replace('_', ' ')} Is Missing`,"OK")
 } 
 formData.append('file',this.file);
 formData.append(this.field.refId,this.model[this.field.bind_key]);
//  formData.append("details_type",this.field.details_type);
//  formData.append("role",this.field.role);
 
 }
 
  
 this.dataService.imageupload(this.field.role,this.model[this.field.bind_key],formData).subscribe((res: any) => {
 if (res.data) {
 this.formControl.setValue(res.data[0])
 this.dialogService.openSnackBar("File Uploaded successfully", "OK")
 }
 })
 }

}