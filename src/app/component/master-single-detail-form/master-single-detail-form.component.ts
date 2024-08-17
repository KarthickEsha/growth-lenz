import { ActivatedRoute, Router } from '@angular/router';
import { Component, Injectable, Input, TemplateRef, ViewChild } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { DataService } from 'src/app/services/data.service';
import * as _ from 'lodash'
import { DialogService } from 'src/app/services/dialog.service';
import { FormService } from 'src/app/services/form.service';

import { environment } from 'src/environments/environment';
import { MasterButtonComponent } from './master-button';
import { ColDef, FirstDataRenderedEvent, GetRowIdFunc, GetRowIdParams, GridApi, GridReadyEvent, ServerSideTransaction } from 'ag-grid-community';
import { HelperService } from 'src/app/services/helper.service';
import { Location } from '@angular/common';
import{DropDownAgggrid}from'./dropdownAggrid'


@Component({
  selector: 'master-single-detail-form',
  templateUrl: './master-single-detail-form.component.html',
  styleUrls: ['./master-single-detail-form.component.css'],
  providers: [DataService]
})
@Injectable({
  providedIn: 'root'
})
export class MasterSingleDetailFormComponent {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public formService: FormService,
    public helperService:HelperService,
    private _location:Location,
    public dialogService: DialogService,
    private dataService: DataService
  ) {
    this.context = { componentParent: this };
    this.components = {
      buttonRenderer: MasterButtonComponent,
      multiSelect:DropDownAgggrid
    };
  }

  @Input('controls') controls: any = {
    hideFilter: false,
    hideAddButton: false,
    enableEdit: true
  }

  //main form variables
  form = new FormGroup({});
  model:any = {}
  fields!: FormlyFieldConfig[]
  isFormDataLoaded = false
  id: any
  data: any
  //detail form variables
  detailForm = new FormGroup({});
  detailModel: any = {}
  detailFields!: FormlyFieldConfig[]
  detailListFields: any = []
  detailListConfig: any = {}
  isPopupEdit: any = false


  pageHeading: any
  formAction = 'Add'
  isEditMode = false
  isDetailEditMode = false
  isDataError = false
  butText = "Add"
  detailOldData: any
  config: any = {}
  options: any = {};
  listData: any[] = []

  keyCol: any
  formName: any
  showdefaultFilter: any = "yes"

  detailDefaultFocusIndex = 0;
  tempListData: any[] = []; //! unwanted
  selectedRow: any    // pop screen
  delete: any
  components: any;
  context: any;
  public gridApi!: GridApi
  // public gridOptions: any = {
  //   flex: 1,
  //   cacheBlockSize: environment.cacheBlockSize,
  //   paginationPageSize: environment.paginationPageSize,
  //   rowModelType: environment.rowModelType,
  // };

  // overlayNoRowsTemplate =
  //   '<span style="padding: 10px; background:white ;">No Data Found</span>"';
  otherdetails: any = {}
  value: any = {}
  valueformGrupo: any = new FormGroup({})
  public getRowId: GetRowIdFunc = (params: GetRowIdParams) => `${params.data["_id"]}`;

  @ViewChild('popupEdit', { static: true }) popupEdit!: TemplateRef<any>;
  @ViewChild('otherpopupEdit', { static: true }) otherpopupEdit!: TemplateRef<any>;

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.formName = params['form']
      this.id = params['id']
      console.log(params);
      
      this.formService.LoadMasterInitData(this)

    })
  }

  onGridReady(params: GridReadyEvent<any>) {
    this.gridApi = params.api;
  }
  public defaultColDef: ColDef = {
    resizable: true,
    suppressMovable: true,
    //   filterParams: {
    //     closeOnApply:true,
    //     buttons: ['reset', 'apply'],
    // },
  };

  frmStart(event: any) {
    var data: any = this.form.value
    this.id = data['_id']
    if (this.id) {
      this.formService.LoadData(this).subscribe(isDataAvail => {
        if (!isDataAvail) { // data not available, so save the data
          this.formService.saveFormData(this).then(() => {
            this.formService.LoadDetailConfig(this)
            this.isFormDataLoaded = true
          })
        }
      })
    }
  }

  addForm(mode: any) {
    if(this.config.localSet==true) {
      sessionStorage.setItem(this.config.localSetField,this.model[this.config.localSetField])
    }
    //! send the value in local storage 
    //! amd remove in componet destroy 
    if (this.isPopupEdit) {
      this.isDetailEditMode = mode != "add"
      this.butText = 'Add'
      let data:any={}
      
      
      if (this?.config?.detailForm?.collectionName == "data_model") {
        let data: any = this.model
        sessionStorage.setItem("model_name", data.model_name)
      }
      if(this.config.isCustomFuction==true&&this.config.addfields){
      data[this.config.addfields] =this.model[this?.config?.addfields]
      data["project_id"]=this.model["project_id"]
      }
      this.dialogService.openDialog(this.popupEdit, null, null, data)
    }
    else {
      this.router.navigate([`${this.config.addRoute}`])
    }

  }

  SaveProjectTeam() {
    if (!this.detailForm.valid) {
        const invalidLabels:any = this.helperService.getDataValidatoion(this.detailForm.controls);
        this.dialogService.openSnackBar("Error in " + invalidLabels, "OK");
        this.detailForm.markAllAsTouched();
        return
      }
  
    var data :any= this.detailForm.value
  //   if(data.teammember==undefined){
  // return    this.dialogService.openSnackBar("Choose a Team Member Atleast one person","OK")
  //   }
    data.project_id=this.model["project_id"]
    
    data.project_name=this.model["project_name"]

console.log(data);
if(this.butText == "Add"){
  var defaultValues = this.config.detailForm.defaultValues || []
  this.formService.loadDefaultValues(defaultValues, data, this.model)
  this.dataService.save(this.config.detailForm.collectionName,data).subscribe(
  res => {
    this.isEditMode = false
    this.formService.resetDetailModel(this)
    this.dialogService.openSnackBar("Data has been updated successfully", "OK");              
    this.dialogService.CloseALL()
    const transaction: any = {
      add: [ data],
      };
      const result = this.gridApi.applyTransaction(transaction);
      console.log(transaction, result)
      
  },
  error => {
    this.dialogService.openSnackBar(error.message, "OK");              
    
  } //this.dialogService.openSnackBar("Data has been added successfully","OK")
)
}else{
  
var uniqueColumn = this.config.detailForm.uniqueColumn
let findIndex:any
// data[this.config.detailForm.mapColumnname] = this.model.name 
if (uniqueColumn) { //grid level validation
findIndex = this.listData.findIndex((e:any) => e[uniqueColumn] == data[uniqueColumn])     //unique column
if (!this.isDetailEditMode && findIndex > -1) {
//unique column data found in the grid
console.log("column data found in the grid");

this.dialogService.openSnackBar("Data already exists", "OK")

return
}
}
  let id =data._id
  delete data._id //? IdK
  this.dataService.update(this.config.detailForm.collectionName, id,   data).subscribe(
    res => {
      this.isEditMode = false
      this.formService.resetDetailModel(this)
      this.dialogService.openSnackBar("Data has been updated successfully", "OK");              
    this.dialogService.CloseALL()
     
  data._id =id;
      const transaction: any = {
        update: [ data],
        };
        const result = this.gridApi.applyTransaction(transaction);
        console.log(transaction, result)
        

    },
    error => {
      this.dialogService.openSnackBar(error.message, "OK");              
     
    } //this.dialogService.openSnackBar("Data has been added successfully","OK")
  )
}
  }


  frmDetailSubmit(event: any) {
    console.log(this?.config);
    
    if (!this.detailForm.valid) {
    //   function collectInvalidLabels(controls: any, invalidLabels: string = ''): string {
    //     for (const key in controls) {
    //         if (controls.hasOwnProperty(key)) {
    //             const control = controls[key];
        
    //             if (control instanceof FormGroup) {
    //                 invalidLabels += collectInvalidLabels(control.controls);
    //             } else if (control instanceof FormControl && control.status === 'INVALID') {
    //                 // Access the label property assuming it exists in the control
    //                 invalidLabels +=controls[key]._fields[0].props.label + ",";
    //             }else if(control instanceof FormArray && control.status === 'INVALID'){
    //               invalidLabels +=controls[key]._fields[0].props.label + ",";
    //             }
    //         }
    //     }
    //     return invalidLabels;
    // }
    
      const invalidLabels:any = this.helperService.getDataValidatoion(this.detailForm.controls);
      this.dialogService.openSnackBar("Error in " + invalidLabels, "OK");
      this.detailForm.markAllAsTouched();
      return
    }

    if (this?.config?.isCustomFuction == true) {
      this.SaveProjectTeam()
      return
    }
    event.preventDefault();
    event.stopPropagation();
    this.formService.updateDetailFormData(this).then((res: any) => {
      this.form.reset();
      this.dialogService.CloseALL()
      if(res.Apitype=="Add"){

        const transaction: any = {
          add: [ res],
          };
          const result = this.gridApi.applyTransaction(transaction);
          console.log(transaction, result)
      }else{

        const transaction: any = {
          update: [ res],
          };
          const result = this.gridApi.applyTransaction(transaction);
          console.log(transaction, result)
      }
     
    })
  }

  closePopup(data: any) {
    this.gridApi.deselectAll()
    this.dialogService.closeModal()
    if (Object.keys(data).length !== 0) {
      Object.assign(this.selectedRow, data)    // while file uploading,field get changed in grid
      this.detailForm.reset()
    }
  }

  goBack() {
    // if (this.config.onCancelRoute) {
    //   let url = [this.config.onCancelRoute]
    //   this.router.navigate(url)
    // }else{
      // ? for Some Case we need to Go back Excat page
      this._location.back()
    // }
  }

  onSelect(event: any) {
    this.selectedRow = event.api.getSelectedRows()[0]
    
    // this.detailModel={}
    // this.detailFields[this.detailDefaultFocusIndex].focus = true
    // let data:any = this.selectedRow
    // data['isEdit'] = true
    // this.detailModel=data
    // this.detailOldData = _.cloneDeep(this.detailModel)
    // this.isDetailEditMode = true
    // this.butText = "Update"

  }



  showDetail(row: any, action: any, $event: any) {               //  new screen opens when clicking the icon
    $event.stopPropagation();
    this.router.navigate([`${action}/${row._id}`])
  }
  // flag:boolean=false;
  onActionButtonClick($event: any, item: any, data: any) {
    console.log(data, item);
    if(this.selectedRow?._id != undefined ||this?.isDetailEditMode==true){
      this.selectedRow.isEdit=true
    this.isDetailEditMode = true

    }
    if (item.formAction == "listpopup") {
      if(item.add===true) {
        if(item.type == "local"){
          console.log(data[item.field]);
          
          sessionStorage.setItem(item.local_label,data[item.field])
        }
        if(item.type == "grid"){
          this.selectedRow[item.prefixlabel] = this.selectedRow[item.prefixValue]
        }
      }
      this.dataService.loadScreenConfigJson(item.formName).subscribe((xyz: any) => {
        this.otherdetails = xyz
        this.dialogService.openDialog(this.otherpopupEdit, null, null, this.selectedRow)
        return
      })
    } else if (item.formAction == "delete") {
      if (confirm("Do you wish to delete this record?")) {
        this.dataService.deleteDataById(this.config.detailForm.collectionName, data._id).subscribe(
          (res: any) => {
            this.dialogService.openSnackBar(
              "Data has been deleted successfully",
              "OK"
            );
            const transaction: any = {
              remove: [data],
            };
            const result = this.gridApi.applyTransaction(transaction);
            console.log(transaction, result);
          }
        );
      }
    } else if (item.formAction == "components") {
      // console.log(this);
       if (item.route_type == "CustomRoute") {
        // ! item.Custom_Route To another Component
        if(item.Custom_Key_filed&&item.Custom_Route)
        // todo if this filed is missing it should take the _id
        // let field = data[item.Custom_Key_filed] ? data[item.Custom_Key_filed] : data[_id];
      //   "SaveType":"local",
			// "Save_Field":"project_id",
       if(item.SaveType&&item.Save_Field){
        sessionStorage.setItem(item.Save_Field,data[item.Save_Field])
       }
        this.router.navigate([
          `${item.Custom_Route}`,
          data[item.Custom_Key_filed],
        ]);
      }else {
        let type: any = this.route.snapshot.params["form"];
        this.router.navigate([`${item.route}` + "/" + type + "/" + data._id]);
      }
      //! TO DO Changes
      // this.router.navigate([`${item.route}` + "/" + data[this.config.keyField]])
    } else if( item.formAction=="individual_report"){
      
      this.router.navigate([
        `${item.Custom_Route}`,
        data["_id"],
      ]);
      sessionStorage.setItem(item.Save_Field,this.id)

    }
    else {
      if (this.config.extraData) {

        this.formService.split_Struct(data).then((vals: any) => {
          this.selectedRow = vals
          console.log(vals);
          this.dialogService.openDialog(this.popupEdit, null, null, this.selectedRow)
          $event.preventDefault();
          $event.stopPropagation();
        })
      } else {
        this.dialogService.openDialog(this.popupEdit, null, null, this.selectedRow)
        $event.preventDefault();
        $event.stopPropagation();
      }
    }

  }

  saveChild(config:any,data: any, value?: any) {
    console.log(data);
    if (!this.valueformGrupo.valid) {      
        const invalidLabels:any = this.helperService.getDataValidatoion(this.valueformGrupo.controls);
        this.dialogService.openSnackBar("Error in " + invalidLabels, "OK");
        this.valueformGrupo.markAllAsTouched();
        return
      }
      console.log(this.valueformGrupo.value);
      let values = this.valueformGrupo.value
      // values.facility_id = data._id // facitlity add
      // values.org_id = data.org_id // Org ID add
      values.status = "A"
      console.log(values);
      if(config.change_id==true &&config.changeKeyField ){
        let key:any=this.selectedRow[config.addValue]
console.log(key);
console.log(values[config.changeKeyField]);

        values[config.changeKeyField]=key+"-"+values[config.changeKeyField]
      }
values.project_id=data.project_id
values.release_id=data._id

    console.log(this.otherdetails);
    this.dataService.save(this.otherdetails.form.collectionName, values).subscribe((data: any) => {
      console.log(data);
      this.dialogService.closeModal();
      this.form.reset()
    })
  }


  delete_record($event: any, row: any, config: any) {
    $event.preventDefault();
    $event.stopPropagation();
    if (confirm("Are you sure,you want to delete the data?") == true) {

      this.dataService.deleteDataById(config.collectionName, row._id).subscribe((res: any) => {
        console.log(res);

        this.listData = res.data
        this.dialogService.openSnackBar("Article Deleted", "OK")
        this.formService.LoadInitData(this)
      })
    } else {
    }

  }


}
