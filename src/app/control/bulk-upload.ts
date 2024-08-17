// import { ChangeDetectorRef, Component, ElementRef, OnInit, TemplateRef, ViewChild } from "@angular/core";
// import { FieldType } from "@ngx-formly/core";
// import { DataService } from "../services/data.service";
// import { v4 as uuidv4 } from 'uuid';
// import { DialogService } from "../services/dialog.service";
// import { FormControl } from "@angular/forms";
// import { NgxSpinnerService } from 'ngx-spinner';
// import { environment } from "src/environments/environment";
// import * as XLSX from 'xlsx';

// @Component({
//   selector: "bulk-upload",
//   template: `
//     <style>
//       ul > li {
//         list-style-position: outside;
//       }
//       ::ng-deep .custom-mat-form-field .mat-input-element[type="file"] {
//         background-color: #f0f0f0;
//       }
//       .file-input {
//         display: flex;
     
//       }
//       .delete-icon {
//         width: 20px;
//         height: 15px;
//         vertical-align: bottom;
//         font-size: 16px;
//         color: #3e3838;
//       }
//       .show-file {
//         margin-top: 4px !important;
//         width: 85%;
//       }
//     </style>
   
// <mat-label style="font-weight:bold;color:grey; margin-bottom:5px">{{this.field.props.label}}</mat-label>
//   <button mat-raised-button style="color: white; margin: 25px" (click)="downloadSampleExcel()">Download Template</button>
 
//   <!-- <div class="file-input">
//     <mat-form-field style="width: 60%; margin-top: 0" (click)="myInput.click()">
//       <mat-icon matPrefix (click)="myInput.click()">attach_file</mat-icon>
//       <input type="text" readonly matInput placeholder="Select file" />
//       <input
//         (change)="onFileSelected($event.target, myInput)"
//         [disabled]="this.field?.props?.readonly"
//         type="file"
//         multiple
//         hidden
//         #myInput
//       />
//     </mat-form-field>
//   </div> -->

//    <div class="ngx-file-drop__container">
//              <ngx-file-drop 
//          [dropZoneLabel]="'Drag and drop your files here or click to upload.'"
//          [dropZoneClassName]="'ngx-file-drop__drop-zone'">
//          <ng-template ngx-file-drop-content-tmp>
//            <div class="ngx-file-drop__content">
//            <mat-icon class="large-icon">cloud_upload</mat-icon>
//              <div (click)="myInput.click()" style="cursor: pointer;">
//                <a>Drag and drop or Select from computer</a>
//              </div>
//              <input type="file" #myInput (change)="onFileChange($event.target)" hidden>
//            </div>
//          </ng-template>
//        </ngx-file-drop>

//     </div>

 
//  <div *ngIf="file.length > 0">
//    <p>Total Inserted: {{total_inserted}}</p>
//     <p>Error Rows: {{error_rows}}</p>
//      <p>Download Excel rows: <a href="{{error_excel}}">{{error_excel}}</a></p>
//   </div>
//    <div  *ngIf="file.length > 0">
// <ag-grid-angular
// style="width: 100%; height: 500px;"
// class="ag-theme-alpine"
// [rowData]="rowData"
// [columnDefs]="columnDefs">
// </ag-grid-angular>
//    </div>
//   `,
//   styles: [`
//     ul > li {
//       list-style-position: outside;
//     }
//     ::ng-deep .custom-mat-form-field .mat-input-element[type="file"] {
//       background-color: #f0f0f0;
//     }
//     .file-input {
//       display: flex;
     
//     }
//     .delete-icon {
//       width: 20px;
//       height: 15px;
//       vertical-align: bottom;
//       font-size: 16px;
//       color: #3e3838;
//     }
//     .show-file {
//       margin-top: 4px !important;
//       width: 85%;
//     }
//        .ngx-file-drop__drop-zone {
//       border: 2px dashed #ccc;
//       padding: 20px;
//       text-align: center;
//       width: 200px;
//     }
//     .ngx-file-drop__container {
//       text-align: center;
//       margin-bottom: 5px;
//     }
//     .selected-image {
//       text-align: center;
//       margin-top: 10px;
//     }

//   `]
// })
// export class BulkUploadComponent extends FieldType<any> implements OnInit {
//   show_files: boolean = false;
//   @ViewChild("dialog_box", { static: true }) dialog_box!: TemplateRef<any>;
//   @ViewChild('myInput') public inputElementRef!: ElementRef;
//   show_spinner: boolean = false;
//   accept_file_type: any;
//   displayedColumns: string[] = ['fileName', 'fileSize', 'actions'];
//   total_inserted :any
//   error_rows :any
//   error_excel :any 
  
//   constructor(
//     public dataservice: DataService,
//     public dialogservice: DialogService,
//     private cf: ChangeDetectorRef,
//     private loader: NgxSpinnerService
//   ) {
//     super();
//   }

//   selectedFiles: any[] = [];
//   file: any[] = [];
//   refid: any;
//   show_tash_icon: boolean = false;
//   show_button: boolean = true;
//   file_datatype: any;
//   file_data: any;
//   filedata: any;
//   validation: any;
//   folderName: any;
//   docBasePath = environment.ImageBaseUrl;

//   public get thisFormControl() {
//     return this.formControl as FormControl;
//   }

//   data: any;

//   ngOnInit(): void {
//     debugger
//     this.folderName = this.field?.props?.['folderName'];
//     // this.show_spinner = false;
//     this.accept_file_type = this.field.accept_type || "image/*";
//     this.validation = this.field.validation?.messages;
//     this.file_datatype = this.field.data_type || 'array';
//     if (this.field.key.includes('.')) {
//       this.data = this.field.key.split('.').reduce((o: any, i: any) => o?.[i], this.model);
//     } else {
//       this.data = this.model[this.field.key];
//     }
//     this.filedata = this.model;
//     if (this.data?.length != 0 && this.data != undefined && this.file) {
//       this.show_tash_icon = true;
//       this.file = this.data;
//     }
   
//   }

//   reset(file: any) {
//     this.file = [];
//     file.value = "";
//   }

 

//   onFileSelected(target: any, value: any) {
//     debugger
//     // Show loader
//     this.loader.show();
//   this.onFileChange(target)

//     // Check if bind_key exists and its corresponding value is defined
//     if (this.field.bind_key && this.model[this.field.bind_key] === undefined) {
//       this.file = [];
//       value.value = "";
//       this.loader.hide();
//       return this.dialogservice.openSnackBar(`${this.field.error_msg}`, "OK");
//     }
  
//     this.show_button = false;
//     this.selectedFiles = target.files;
  
//     // Handle selected files
//     if (this.field.data_type === "object") {
//       this.file = target.files[0].name;
//     } else {
//       this.file = [];
//       for (let i = 0; i < this.selectedFiles.length; i++) {
//         this.file.push({ "file_name": this.selectedFiles[i].name, "file_size": this.selectedFiles[i].size });
//       }
//     }
  
//     const formData = new FormData();
//     const modifiedFiles: File[] = [];
  
//     // Modify filenames and prepare formData
//     if (this.selectedFiles && this.selectedFiles.length > 0) {
//       for (let i = 0; i < this.selectedFiles.length; i++) {
//         const file: File = this.selectedFiles[i];
//         const fileNameWithUnderscores = file.name.replace(/\s/g, '_');
//         const modifiedFile = new File([file], fileNameWithUnderscores, {
//           type: file.type,
//         });
//         modifiedFiles.push(modifiedFile);
//       }
//     }
  
//     for (let i = 0; i < modifiedFiles.length; i++) {
//       formData.append('files', modifiedFiles[i]);
//     }
  
//     const refId = uuidv4();
//     let Id  = this.form.value.org_id
//     // Upload files
//     this.dataservice.bulkUpload(this.folderName, Id, formData).subscribe(
//       (file_data: any) => {
//         debugger
//         // Check if file_data is an array and contains objects
//         if (Array.isArray(file_data) && file_data.length > 0 && file_data.every((item: any) => typeof item === 'object')) {
//           this.show_tash_icon = true;
//           file_data = file_data.map((x: any) => {
//             x["ref_id"] = uuidv4();
//             return x;
//           });
//           this.file = file_data;
//           this.formControl.patchValue(file_data);
//           this.cf.detectChanges();
//         } 
//         // else {
//         //   this.dialogservice.openSnackBar("Unexpected response format from server", "OK");
//         // }
//         this.loader.hide();
//       },
//       (err: any) => {
//      this.total_inserted = err.error.total_inserted
//       this.error_rows =  err.error.error_count
//       this.error_excel = err.error.errorFilePath
//         this.dialogservice.openSnackBar(err.error?.message || err.message, "OK");
//         this.loader.hide();
//       }
//     );
//   }

//   onFileChange(event: any) {
//     const target: DataTransfer = <DataTransfer>(event);

//     if (target.files.length !== 1) throw new Error('Cannot use multiple files');
//     this.file =[{}]
//     const reader: FileReader = new FileReader();

//     reader.onload = (e: any) => {
//       const bstr: string = e.target.result;
//       const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary' });

//       const wsname: string = wb.SheetNames[0];
//       const ws: XLSX.WorkSheet = wb.Sheets[wsname];

//       const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

//       this.setGridData(data);
//     };

//     reader.readAsBinaryString(target.files[0]);
//   }

//   columnDefs:any
//   rowData:any
 
//   setGridData(data: any[]) {
//     if (data.length === 0) return;

//     const headers = data[0];
//     const rows = data.slice(1);

//     this.columnDefs = headers.map((header:any) => ({ headerName: header, field: header }));
//     this.rowData = rows
//       .filter(row => row.some((cell:any) => cell !== undefined && cell !== null && cell !== '')) // Filter out empty rows
//       .map(row => {
//         const rowData: any = {};
//         row.forEach((cell: any, index: number) => {
//           rowData[headers[index]] = cell;
//         });
//         return rowData;

//       });
//       this.cf.detectChanges()
//   }
  
//   deleteItem(index: any, data: any) {
//     debugger
//     this.dialogservice.openDialog(this.dialog_box, data, "10%");
//     this.yes(data)
//   }

//   yes(data: any) {
//     debugger
//     if (this.file.length != 0) {
//       this.file = this.file.filter((item) => item.file_name !== data.file_name);
//       this.dialogservice.closeModal();
//       this.formControl.patchValue(this.file);
//     }
//   }


//   downloadSampleExcel(data: any){
// debugger
//     this.dataservice.getSampleExcel().subscribe((res:any)=>{
//       res.data[0].response[0].download_link

//     })


//     this.dataservice.getSampleExcel(data).subscribe((res: any) => {
//       const downloadLink = res.data[0].response[0].download_link;
    
//       if (downloadLink) {
//         const anchor = document.createElement('a');
//         anchor.href = downloadLink;
//         anchor.download = ''; // You can set the filename here if you want
//         document.body.appendChild(anchor);
//         anchor.click();
//         document.body.removeChild(anchor);
//       } else {
//         console.error('Download link not found');
//       }
//     }, (error: Error) => {
//       console.error('Error fetching download link:', error);
//     });
    
//   }
// }