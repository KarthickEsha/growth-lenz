import { HttpClient } from "@angular/common/http";
import {
  Injectable,
  Output,
  ViewChild,
  EventEmitter,
  Input,
} from "@angular/core";
import * as _ from "lodash";
import { async, catchError } from "rxjs";
import { Observable, Subject } from "rxjs";
import { DataService } from "./data.service";
import { DialogService } from "./dialog.service";
import { HelperService } from "./helper.service";
import * as moment from "moment";
import { FormGroup, FormControl, FormArray } from "@angular/forms";
// import { ArrayToStringPipe } from "../pipe/arraytostring";
import { v4 } from "uuid";

@Injectable({
  providedIn: "root",
})
export class FormService {
  constructor(
    private helperService: HelperService,
    private dataService: DataService,
    private dialogService: DialogService,
    private httpclient: HttpClient
  ) {}

  LoadMasterInitData(ctrl: any) {
    this.dataService
      .loadScreenConfigJson(ctrl.formName)
      .subscribe(async (config) => {
        console.log(config);

        ctrl.config = config;
        console.clear();
        console.warn(config);

        ctrl.pageHeading = config.pageHeading;
        ctrl.collectionName = config.form.collectionName;
        // ctrl.model = config.model ? config.model : {};
        // ctrl.isPopupEdit=ctrl.detailForm.isPopupEdit
        // ctrl.detailModel=ctrl.detailForm.fields
        ctrl.mode = config.addEditMode ? config.addEditMode : "popup";
        ctrl.fields = config.form.fields;
        this.LoadData(ctrl);
        // this.loadSupportData(ctrl)
        // if (config.getWeightFromMachine) {
        //   this.serialPortService.init()
        // }
      });
  }
  /**
   * This Main method We CAll in form Services
   * @id if id availabe ,IT  load the existing data
   * @ctrl This is Total content from the parent componet.
   */
  LoadInitData(ctrl: any) {
    if (ctrl.id) {
      ctrl.collectionName = ctrl.formName;
      this.LoadData(ctrl).subscribe((res: any) => {
        console.log(ctrl, "existing data loaded");
        this.LoadConfig(ctrl);
      });
    } else {
      this.LoadConfig(ctrl);
    }
  }

  /**
   * This Function help to get the screen config from data base
   * @ctrl This is Total content from the parent componet.
   */
  LoadConfig(ctrl: any) {
    // form or any other screen keyField (it should be given in form)
    this.dataService
      .loadScreenConfigJson(ctrl.formName)
      .subscribe(async (config) => {
        ctrl.config = config;
        ctrl.pageHeading = config.pageHeading;
        ctrl.collectionName = config.form.collectionName;
        ctrl.mode = config.screenEditMode ? config.screenEditMode : "popup";
        ctrl.model["keyField"] = config.keyField || "id";
        ctrl.id = ctrl.model[config?.keyField] || ctrl?.model["_id"];
        ctrl.formAction = ctrl.id ? "Edit" : "Add";
        ctrl.butText = ctrl.id ? "Update" : "Save"; //buttons based on the id

        if (ctrl.formAction == "Edit" && ctrl.config.mode == "page") {
          // this.LoadData(ctrl).subscribe((res: any) => {
          ctrl.fields = config.form.fields;
          // })
        } else if (ctrl.formAction == "Edit" && ctrl.mode == "popup") {
          ctrl.model["isEdit"] = true;
          ctrl.model["isshow"] = true;
          ctrl.model["ishide"] = true;
          ctrl.isFormDataLoaded = true;
          ctrl.formAction = ctrl.config.formAction || "Edit";
          ctrl.isEditMode = true;
        }
        ctrl.fields = config.form.fields;
      });
  }

  resetDetailModel(ctrl: any) {
    let form = ctrl.config.detailForm;
    if (form) {
      ctrl.detailModel = {};
      ctrl.isDetailEditMode = false;
      ctrl.butText = "Add";
      if (form.defaultFocusIndex) {
        form.fields[form.defaultFocusIndex].focus = true;
        //TODO ??
        // form.fields[form.defaultFocusIndex].defaultValue = ""
      }
    }
  }

  updateDetailFormData(ctrl: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
      //validate all the form fields
      console.log(ctrl);

      if (!ctrl.detailForm.valid) {
        const invalidLabels: any = this.helperService.getDataValidatoion(
          ctrl.detailForm.controls
        );
        this.dialogService.openSnackBar("Error in " + invalidLabels, "OK");
        ctrl.detailForm.markAllAsTouched();
        ctrl.detailForm.fields[ctrl.detailDefaultFocusIndex].focus = true;
        resolve(false);
        return;
      }
      //get the form data

      var data = ctrl.detailForm.value;
      data[ctrl.config.detailForm.mapColumn] = ctrl.id;
      if (ctrl.config.mapColumnDiff == true) {
        data[ctrl.config.detailForm.mapColumn] =
          ctrl.model[ctrl.config.mapColumnfield];
      }
      // TO CREATE the STRUCT
      if (ctrl.config.extraData) {
        this.Create_struct(ctrl, data).then((val: any) => {
          console.log(val, "strusct");
          data = val; //! reassign the data from change the structure
          if (ctrl?.config?.detailForm?.customfilter) {
            data[ctrl.config.detailForm.mapColumn] =
              ctrl?.model?.model_name || sessionStorage.getItem("model_name");
          } else {
            data[ctrl.config.detailForm.mapColumn] = ctrl.id;
          }
          var findIndex = -1;
          console.log(ctrl);

          if (ctrl.butText == "Add") {
            var defaultValues = ctrl.config.detailForm.defaultValues || [];
            this.loadDefaultValues(defaultValues, data, ctrl.model);
            this.dataService
              .save(ctrl.config.detailForm.collectionName, data)
              .pipe(
                catchError((error: any) => {
                  this.dialogService.openSnackBar(error.error_msg, "OK");
                  return error;
                })
              )
              .subscribe(
                (res: any) => {
                  ctrl.isEditMode = false;
                  data["_id"] = res.data["insert ID"];
                  const transaction: any = {
                    add: [data],
                  };
                  const result = ctrl.gridApi.applyTransaction(transaction);
                  console.log(transaction, result);

                  this.resetDetailModel(ctrl);
                  this.dialogService.openSnackBar(
                    "Data has been updated successfully",
                    "OK"
                  );

                  // if (findIndex >= 0) {
                  //   //data already in the grid
                  //   ctrl.listData[findIndex] = data
                  // } else {
                  //   ctrl.listData.unshift(data)
                  // }
                  // ctrl.tempListData = ctrl.listData;
                  // ctrl.listData = [...ctrl.listData]
                  // ctrl.tempListData = ctrl.listData;
                  resolve(data);
                },
                (error) => {
                  // this.dialogService.openSnackBar("Data has been added successfully","OK")
                  resolve(undefined);
                }
              );
          } else {
            //! If Data Present means  it edit mode

            if (ctrl.keyColumn == undefined) {
              ctrl.keyColumn = "_id";
            }
            var id: any = ctrl.selectedRow[ctrl.keyColumn];

            var uniqueColumn = ctrl.config.detailForm.uniqueColumn;

            // data[ctrl.config.detailForm.mapColumnname] = ctrl.model.name
            if (uniqueColumn) {
              //grid level validation
              findIndex = ctrl.listData.findIndex(
                (e: any) => e[uniqueColumn] == data[uniqueColumn]
              ); //unique column
              if (!ctrl.isDetailEditMode && findIndex > -1) {
                //unique column data found in the grid
                console.log("column data found in the grid");

                this.dialogService.openSnackBar("Data already exists", "OK");
                resolve(undefined);
                return;
              }
            }
            // delete data._ids
            this.dataService
              .update(ctrl.config.detailForm.collectionName, id, data)
              .pipe(
                catchError((error: any) => {
                  this.dialogService.openSnackBar(error.error_msg, "OK");
                  return error;
                })
              )
              .subscribe(
                (res) => {
                  ctrl.isEditMode = false;

                  this.resetDetailModel(ctrl);
                  this.dialogService.openSnackBar(
                    "Data has been updated successfully",
                    "OK"
                  );
                  // if (findIndex >= 0) {
                  //   //data already in the grid
                  //   ctrl.listData[findIndex] = data
                  // } else {
                  //   ctrl.listData.unshift(data)
                  // }
                  // ctrl.tempListData = ctrl.listData;
                  // ctrl.listData = [...ctrl.listData]
                  // ctrl.tempListData = ctrl.listData;
                  data["_id"] = id;
                  const transaction: any = {
                    update: [data],
                  };
                  const result = ctrl.gridApi.applyTransaction(transaction);
                  console.log(transaction, result);

                  resolve(data);
                },
                (error) => {
                  resolve(undefined);
                } //this.dialogService.openSnackBar("Data has been added successfully","OK")
              );
          }
        });
      } else {
        var findIndex = -1;

        if (ctrl.butText == "Add") {
          var defaultValues = ctrl.config.detailForm.defaultValues || [];
          this.loadDefaultValues(defaultValues, data, ctrl.model);
          if (ctrl?.config?.detailForm?.Change_id) {
            data[ctrl?.config?.detailForm?.changekeyfield] =
              data[ctrl?.config?.detailForm?.addkeyfield] +
              "-" +
              data[ctrl?.config?.detailForm?.changekeyfield];
          }
          this.dataService
            .save(ctrl.config.detailForm.collectionName, data)
            .subscribe(
              (res: any) => {
                ctrl.isEditMode = false;
                this.resetDetailModel(ctrl);
                this.dialogService.openSnackBar(
                  "Data has been updated successfully",
                  "OK"
                );
                // let values:any={}
                //   values["_id"]=res.data["insert ID"]
                // Object.assign(data,values)
                data["_id"] = res.data["insert ID"];
                data.Apitype = "Add";

                // if (findIndex >= 0) {
                //   //data already in the grid
                //   ctrl.listData[findIndex] = data
                // } else {
                //   ctrl.listData.unshift(data)
                // }
                // ctrl.tempListData = ctrl.listData;
                // ctrl.listData = [...ctrl.listData]
                // ctrl.tempListData = ctrl.listData;
                resolve(data);
              },
              (error) => {
                resolve(undefined);
              } //this.dialogService.openSnackBar("Data has been added successfully","OK")
            );
        } else {
          var uniqueColumn = ctrl.config.detailForm.uniqueColumn;
          // data[ctrl.config.detailForm.mapColumnname] = ctrl.model.name
          if (uniqueColumn) {
            //grid level validation
            findIndex = ctrl.listData.findIndex(
              (e: any) => e[uniqueColumn] == data[uniqueColumn]
            ); //unique column
            if (!ctrl.isDetailEditMode && findIndex > -1) {
              //unique column data found in the grid
              console.log("column data found in the grid");

              this.dialogService.openSnackBar("Data already exists", "OK");
              resolve(undefined);
              return;
            }
          }
          // let id =data._id
          if (ctrl.keyColumn == undefined) {
            ctrl.keyColumn = "_id";
          }
          var id: any = ctrl.selectedRow[ctrl.keyColumn];
          delete data._id; //? IdK

          this.dataService
            .update(ctrl.config.detailForm.collectionName, id, data)
            .subscribe(
              (res: any) => {
                ctrl.isEditMode = false;
                data.Apitype = "Update";
                this.resetDetailModel(ctrl);
                this.dialogService.openSnackBar(
                  "Data has been updated successfully",
                  "OK"
                );

                data._id = id;
                // if (findIndex >= 0) {
                //   //data already in the grid
                //   ctrl.listData[findIndex] = data
                // } else {
                //   ctrl.listData.unshift(data)
                // }
                // ctrl.tempListData = ctrl.listData;
                // ctrl.listData = [...ctrl.listData]
                // ctrl.tempListData = ctrl.listData;

                data["_id"] = id;
                // Object.assign(data,ctrl.model)

                resolve(data);
              },
              (error) => {
                resolve(undefined);
              } //this.dialogService.openSnackBar("Data has been added successfully","OK")
            );
        }
      }
    });
  }

  LoadDetailConfig(ctrl: any) {
    ctrl.form.disable();

    ctrl.keyCol = ctrl.config.detailForm.keyColumn || "cno";
    ctrl.detailDefaultFocusIndex =
      ctrl.config.detailForm.defaultFocusIndex || 0;
    ctrl.detailFields = ctrl.config.detailForm.fields;
    ctrl.detailModel = ctrl.config.detailForm.model
      ? ctrl.config.detailForm.model
      : {};
    ctrl.isPopupEdit = ctrl.config.detailForm.isPopupEdit || false;
    ctrl.listData = [];

    ctrl.tempListData = ctrl.listData;
    ctrl.detailListConfig = ctrl.config.detailListConfig;
    ctrl.filterOptions = ctrl.config.detailListConfig.filterOptions;
    ctrl.actions = ctrl.config.detailListConfig.actions || [];
    ctrl.actionPopup = ctrl.config.detailListConfig.actionPopup || []; //popup form screen in master table
    ctrl.delete = ctrl.config.detailListConfig.delete || [];
    //TODO
    ctrl.detailListFields = ctrl.config.detailListConfig.fields;

    ctrl.config.detailListConfig.fields.forEach((e: any) =>
      // {
      //   if (e.type) {
      //     if (e.type == "date") {
      //         e["valueFormatter"] =  (params:any) => params.value == null ? "" : moment(params.value).format(e.format || "DD/MM/YY");
      //     }
      //   }
      // });

      {
        if (e.type == "datetime" || e.type == "date") {
          e.valueGetter = (params: any) => {
            if (params.data && params.data[e.field]) {
              console.log("dasd");

              return moment(params.data[e.field]).format(
                e.format || "DD-MM-YYYY "
              );
            }
            return " ";
          };
        }
        if (e.type == "color") {
          e.cellStyle = (params: any) => {
            return { color: "blue" };
          };
        }
        if (e.type == "arraytostring") {
          e.valueFormatter = (params: any) => {
            if (
              params.data &&
              params.data[e.field] &&
              !_.isEmpty(params.data[e.field])
            ) {
              let txt = "";
              if (e.valueType == "plainArray") {
                let input = params.data[e.field];

                for (let i = 0; i < input?.length; i++) {
                  txt += input[i] + ",";
                }
                console.log("txt", txt);

                var n = txt.lastIndexOf(",");
                var value = txt.substring(0, n);
                return value;
              } else {
                let input = params.data[e.field];
                let attribute = e.value;
                for (let i = 0; i < input?.length; i++) {
                  txt += input[i][attribute] + ",";
                }
                var n = txt.lastIndexOf(",");
                var value = txt.substring(0, n);
                return value;
              }
            }
            return;
          };
          e.type = "text";
        }
        if (e.width) {
          e["width"] = e.width;
        }
        // if (e.type == "set_Filter" && e.filter == "agSetColumnFilter") {
        //   if (e.Diffkey == true) {
        //     e.filterParams = {
        //       values: (params: any) => {
        //         let filter:any={
        //           start: 0,
        //           end: 1000,
        //           filter: this.filterQuery,
        //         }
        //         if(this.allFilter!==undefined){
        //         filter=this.allFilter;
        //         }
        //         this.DataService.getDataByFilter(this.collectionName, filter).subscribe((xyz: any) => {
        //           const apidata = xyz.data[0].response;
        //           const uniqueArray = Array.from(
        //             new Map( apidata.map((obj: any) => [obj[e.field], obj])).values()
        //           );
        //           params.success(uniqueArray);
        //         });
        //       },
        //       keyCreator: (params: KeyCreatorParams) => {
        //         return [params.value[e.keyCreator], e.keyCreator, true];
        //       },
        //       valueFormatter: (params: any) => {
        //         return params.value[e.field];
        //       },
        //     };
        //   } else {
        //     e.filterParams = {
        //       values: (params: any) => {
        //         let filter:any={
        //           start: 0,
        //           end: 1000,
        //           filter: this.filterQuery,
        //         }
        //         if(this.allFilter!==undefined){
        //         filter=this.allFilter;
        //         }
        //         this.dataService.getDataByFilter(this.collectionName,filter).subscribe((xyz: any) => {
        //           const apidata = xyz.data[0].response
        //             .map((result: any) => {
        //               let val = result[e.field];
        //               if (val !== undefined) {
        //                 return val;
        //               }
        //             })
        //             .filter((val: any) => val !== undefined); // Filter out undefined values
        //           params.success(apidata);
        //         });
        //       },
        //     };
        //   }
        // }
        //if the object in nested array
        // if (e.type == "set_Filter" && e.filter == "agSetColumnFilter" &&e.object_type == "nested_array") {
        //   debugger;
        //   e.filterParams = {
        //     values: (params: any) => {
        //       let filter:any={
        //         start: 0,
        //         end: 1000,
        //         filter: this.filterQuery,
        //       }
        //       if(this.allFilter!==undefined){
        //       filter=this.allFilter;
        //       }
        //       this.DataService.getDataByFilter(this.collectionName,filter).subscribe((xyz: any) => {
        //         const apidata = xyz.data[0].response
        //           .map((result: any) => {
        //             //let val = result[e.field];
        //             let val = e.field
        //               .split(".")
        //               .reduce((o: any, i: any) => o[i], result);
        //             if (val !== undefined) {
        //               return val;
        //             }
        //           })
        //           .filter((val: any) => val !== undefined); // Filter out undefined values
        //         params.success(apidata);
        //       });
        //     },
        //   };
        // }
      }
    );
  }

  LoadData(ctrl: any): Observable<boolean> {
    var nextValue = new Subject<boolean>();
    this.LoadFormData(ctrl).subscribe((exists: any) => {
      nextValue.next(exists);
      if (exists && ctrl.config.formType == "master-detail") {
        //load detailed form details and its data, if available

        this.LoadDetailConfig(ctrl);
        this.LoadDetailDataList(ctrl, ctrl.id);
        this.resetDetailModel(ctrl);
      }
    });
    return nextValue.asObservable();
  }

  // !Need TO do in same componenet for server side pagination
  LoadDetailDataList(ctrl: any, id: string, addtionalFilterConditions?: any) {
    if (ctrl.config.diffApi == true) {
      let key: any = ctrl.model[ctrl.config.idToSend];
      // this.dataService.lookupTreeData(ctrl.config.endPoint,key).subscribe(
      //   (result:any) => {
      //   ctrl.listData=result.data.response ||  []
      //   // ctrl.listData = res.data[0].response|| [];
      //   ctrl.tempListData = ctrl.listData;
      //   ctrl.gridApi.sizeColumnsToFit();
      //   },
      //   error => {
      //     ctrl.listData = []
      //     ctrl.tempListData = ctrl.listData;
      //     //Show the error popup
      //     console.error('There was an error!', error);
      //   })
    } else {
      let filterCondition: any;
      //master-detail mapping record filter condition
      if (ctrl?.config?.detailForm?.customfilter) {
        filterCondition = [
          {
            column: ctrl.config.detailForm.mapColumn,
            operator: "EQUALS",
            value: ctrl.model[ctrl?.config?.detailForm?.customkey],
          },
        ];
      } else {
        filterCondition = [
          {
            column: ctrl.config.detailForm.mapColumn,
            operator: "EQUALS",
            value: id,
          },
        ];
      }
      console.log(filterCondition);

      this.dataService.makeFilterConditions(
        ctrl.detailListConfig.defaultFilter,
        filterCondition,
        ctrl.detailModel
      );
      this.dataService.makeFilterConditions(
        ctrl.detailListConfig.fixedFilter,
        filterCondition,
        ctrl.detailModel
      );

      //when we apply filter the top filter controls,
      //this conditions to be merged with the above filter condition
      if (addtionalFilterConditions) {
        filterCondition = _.merge(filterCondition, addtionalFilterConditions);
      }
      //load detail (child) collection data
      var filterQuery = {
        filter: [
          {
            clause: "AND",
            conditions: filterCondition,
          },
        ],
      };

      this.dataService
        .getDataByFilter(ctrl.config.detailForm.collectionName, filterQuery)
        .subscribe(
          (result: any) => {
            ctrl.listData = result.data[0].response || [];
            ctrl.tempListData = ctrl.listData;
            ctrl.gridApi.sizeColumnsToFit();
          },
          (error) => {
            ctrl.listData = [];
            ctrl.tempListData = ctrl.listData;
            //Show the error popup
            console.error("There was an error!", error);
          }
        );
    }
  }

  /**
   * This method used for the Get the data from the database
   * Take the Old Data in modelOldData
   * @ctrl This is Total content from the parent componet.
   */
  LoadFormData(ctrl: any): Observable<boolean> {
    var nextValue = new Subject<boolean>();
    if (ctrl.id) {
      this.dataService.getDataById(ctrl.collectionName, ctrl.id).subscribe(
        (result: any) => {
          if (result && result.data && result != null) {
            //  result data is array of index 0
            ctrl.model = result.data[0] || {};
            ctrl.model["isEdit"] = true;
            ctrl.model["isshow"] = true;
            ctrl.model["ishide"] = true;
            ctrl.isFormDataLoaded = true;
            ctrl.isDataError = false; //???
            ctrl.formAction = ctrl.config.formAction || "Edit";
            ctrl.isEditMode = true;
            //we need old data, if update without any changes
            ctrl.modelOldData = _.cloneDeep(ctrl.model);
            nextValue.next(true);
          } else {
            ctrl.model["isEdit"] = false;
            ctrl.formAction = "Add";
            ctrl.isFormDataLoaded = false;
            nextValue.next(false);
          }
        },
        (error) => {
          console.error("There was an error!", error);
          nextValue.next(false);
        }
      );
    } else {
      nextValue.next(false);
    }
    return nextValue.asObservable();
  }

  /**
   * This method used Save or update the data / Add and update the form
   * Take the Old Data in modelOldData
   * @param ctrl This is Total content from the parent componet
   */
  async saveFormData(ctrl: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
      // this.helperService.validateAllFormFields(ctrl.form); I Dont what is it ?

      if (!ctrl.form.valid) {
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
        const invalidLabels: any = this.helperService.getDataValidatoion(
          ctrl.form.controls
        );
        this.dialogService.openSnackBar("Error in " + invalidLabels, "OK");
        // const invalidLabels:any = collectInvalidLabels(ctrl.form.controls);
        // ctrl.dialogService.openSnackBar("Error in " + invalidLabels, "OK");
        ctrl.form.markAllAsTouched();
        ctrl.butonflag = false;
        return;
      }
      var data = ctrl.form.value;
      // ?SYSTEM USER
      //       let role_type:any =this.dataService.getdetails().role
      //       if(ctrl?.config?.rolebased&& role_type!=="SA"){
      //        data.org_id=this.dataService.getdetails().org_id
      //       }
      // // ?SYSTEM USER
      //       if(ctrl?.config?.user&&role_type!=="SA"){
      //         data.org_id=this.dataService.getdetails().org_id
      //         data.user_type=role_type
      //       }
      // ? PREFIX
      if (
        ctrl?.config?.Change_id &&
        (ctrl.model.isEdit !== true || ctrl.formAction == "Add")
      ) {
        // data.org_id=this.dataService.getdetails().profile.org_id
        // data._id=data.org_id+"-"+data._id
        data[ctrl.config.changekeyfield] =
          data[ctrl.config.addkeyfield] +
          "-" +
          data[ctrl.config.changekeyfield];
      }

      // It can be done in any project with different screen config
      //while saving set default values

      if (ctrl.config["multilang"]) {
        delete data[ctrl.config?.["createkey"]];
        // return
      }
      let configDatabaseflag = ctrl.config.configDatabse || false;
      if (ctrl.formAction == "Add") {
        var defaultValues = ctrl.config.form.defaultValues || [];
        this.loadDefaultValues(defaultValues, data, ctrl.model);

        this.dataService
          .save(ctrl.collectionName, data, configDatabaseflag)
          .pipe(
            catchError((error: any) => {
              ctrl.butonflag = false;
              return error;
            })
          )
          .subscribe((res: any) => {
            if (res) {
              // if (ctrl?.config?.user && role_type !== "SA") {
              //   this.updateuser(ctrl, res);
              // }

              if (ctrl.config["multilang"]) {
                this.updatelang(ctrl, res);
              }

              this.dialogService.openSnackBar(
                "Data has been Inserted successfully",
                "OK"
              );
              resolve(res);
            } else {
              this.dialogService.openSnackBar(res.error_msg, "OK");
            }
          });
      } else {
        delete data._id;
        this.dataService
          .update(ctrl.collectionName, ctrl.id, data)
          .pipe(
            catchError((error: any) => {
              ctrl.butonflag = false;
              // console.error('Error occurred:', error);
              return error;
            })
          )
          .subscribe((res: any) => {
            this.dialogService.openSnackBar(
              "Data has been updated successfully",
              "OK"
            );

            if (ctrl.config["multilang"]) {
              this.updatelang(ctrl, res);
            }

            resolve(res);
          });
      }
    });
  }

  //#region  //? STRUCT
  /**
   * This method used for the Get the data from model into Tag of String
   * @ctrl This is Total content from the parent componet.
   */
  Create_struct(ctrl: any, value: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
      var data: any = {};

      // Get the column name and convert it to lowercase
      const attributesName = value.column_name.toLowerCase();

      // Capitalize the first letter of the column name
      const formattedName = value.column_name;
      // attributesName.charAt(0).toUpperCase() +
      // attributesName.slice(1).toLowerCase();

      // Initialize the Tag string with common values
      // let Tag = `json:"${attributesName}" bson:"${attributesName}" validate:"`;
      var jsonvalues =
        value.column_name === "ID" ||
        value.column_name === "Id" ||
        value.column_name === "_id"
          ? "_id"
          : value.column_name.toLowerCase();

      // Initialize the Tag string with common values
      // let Tag = `json:"${jsonvalues}" bson:"${jsonvalues}" validate:"`;
      let Tag = `json:"${jsonvalues}" `;
      Tag += value.required === "yes" ? `validate:"required"` : `allow:""`;
      // Set the type if it's not undefined
      if (value.type === undefined) {
        value.type = value.modelName;
      }

      // Add "[]" if it's an array field
      if (value.array_field === "yes" && !value.modelName) {
        value.type = value.type + "[]";
      } else if (value.array_field === "yes" && value.modelName) {
        Tag += ` dataType:"array" ref:${value.type}`;
      } else if (
        (value.array_field === undefined || value.array_field === "no") &&
        value.modelName
      ) {
        Tag += ` dataType:"object" ref:${value.type}`;
      }

      if (value.type != "date") {
        // Handle various enumerate_validation cases
        switch (value.enumerate_validation) {
          case "between_age":
            Tag += ` min=${value.validation} max=${value.additional_input_advanced}`;
            break;
          case "regex":
            Tag += ` regex="${value.validation}"`;
            break;
          case "eq":
            Tag += ` min=${value.validation} max=${value.validation}`;
            break;
          case "not":
            Tag += ` not=${value.validation}`;
            break;
          case "greater":
            Tag += ` greater=${value.validation}`;
            break;
          case "gte":
            Tag += ` min=${value.validation}`;
            break;
          case "less":
            Tag += ` less=${value.validation}`;
            break;
          case "lte":
            Tag += ` max=${value.validation}`;
            break;
          case "within":
            Tag += `,within=${value.validation}`;
            break;
          case "in_between":
            if (value.validation && value.additional_input_advanced) {
              Tag = `${Tag} min=${value.validation} max=${value.additional_input_advanced}`;
            } else if (value.validation) {
              Tag += ` min=${value.validation}`;
            } else if (value.additional_input_advanced) {
              Tag += ` max=${value.additional_input_advanced}`;
            }
            break;
          case "min":
          case "max":
            Tag += ` ${value.enumerate_validation}=${value.validation}`;
            break;
        }
      } else if (value.type === "date") {
        if (
          value.enumerate_validation === "gte" ||
          value.enumerate_validation === "greater" ||
          value.enumerate_validation === "less" ||
          value.enumerate_validation === "lte"
        ) {
          Tag += `custom:customValidation['dateValidation'] meta:{day:${value.validation},type:CURRENTDATE,operator:${value.enumerate_validation}}`;
        } else if (value.enumerate_validation === "within") {
          const unit = value.validation.slice(-1);
          const customValue = parseInt(value.validation.slice(0, -1), 10);

          const mapitem: any = {
            d: "day",
            m: "month",
            y: "year",
          };
          const customkey = mapitem[unit];

          Tag += `custom:customValidation['dateValidation'] meta:{${customkey}:${customValue},type:CURRENTDATE,operator:${value.enumerate_validation}}`;
        } else if (value.enumerate_validation === "between_age") {
          Tag += `custom:customValidation['dateValidation'] meta:{startAge:${value.validation},endAge:${value.additional_input_advanced},type:CURRENTDATE,operator:${value.enumerate_validation}}`;
        }
      }

      if (value.precision) {
        Tag += ` precision=${value.validation}`;
      }

      console.log("finaltag,", Tag);
      // Add the closing double quote to the Tag string
      //  Tag += '"';

      // Update the "data" object properties
      // data._id=ctrl.detailModel._id
      data.tag = Tag;
      data.max = undefined;
      data.min = undefined;
      data.column_name = value.column_name = formattedName;
      data.header = value.header;
      data.type = value.type;
      data.type = value.type;
      data.description = value.description;
      data.collection_name = value.collection_name;
      data.is_reference = value.is_reference;
      data.field = value.field;
      data.json_field = jsonvalues;

      resolve(data);
    });
  }

  extractValidationKeywords(tag: any) {
    const matchResult = tag.match(/validate:"(.*?)"/);
    if (matchResult && matchResult[1]) {
      const keywords = matchResult[1].split(",");
      return keywords.map((keyword: any) => keyword.trim());
    }
    return [];
  }

  //"json:"within" bson:"within"  validate:"omitempty,within=2d
  extractComparisonOperator(tag: any) {
    const matchResult = tag.match(
      /\b(eq|greater|gte|lt|lte|min|max|precision|less|regex|between_age|within|not)\b/
    );
    if (matchResult) {
      return matchResult[0];
    }
    return null;
  }

  /**
   * @DynamicStruct This method used for the Get in String Format into Split
   * @example it make a string like this json:"efef" bson:"efef"  validate:"omitempty,min=4" in individual value
   * @ctrl This is Data TO split.
   */
  split_Struct(ctrl: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
      const operator = this.extractComparisonOperator(ctrl.tag);
      const validationKeywords = this.extractValidationKeywords(ctrl.tag);
      //json:"efef" bson:"efef"  validate:"omitempty,min=4"
      if (ctrl.tag.includes("required")) {
        ctrl.required = "yes";
      } else if (ctrl.tag.includes("omitempty")) {
        ctrl.required = "no";
      }

      const typeMapping: { [key: string]: string } = {
        string: "string",
        number: "int",
        int64: "number",
        float32: "number",
        float64: "number",
        boolean: "bool",
        date: "time.time",
      };

      const selectedType = ctrl.type;
      const selectedTypes = ctrl.type; //  "[]string"
      const arrayPart = selectedTypes?.replace(/[^[\]]+/g, ""); //  "[]"

      const cleanTypeString = selectedType?.replace("[]", "");

      const dataTypeMatch = ctrl.tag.match(/dataType:"([^"]+)"/);
      let dataTypeValue: any;
      if (dataTypeMatch) {
        const dataTypeValue = dataTypeMatch[1];

        if (dataTypeValue === "array") {
          ctrl.array_field = "yes";
        }
      }

      if (arrayPart.includes("[]") || dataTypeValue === "array") {
        ctrl.array_field = "yes";
      }

      if (cleanTypeString in typeMapping) {
        // const angularDataType = typeMapping[cleanTypeString];
        ctrl.select_field = "custom_datatype";
        ctrl.type = cleanTypeString;
      } else {
        ctrl.modelName = cleanTypeString;
        ctrl.select_field = "predefined";
      }

      if (operator) {
        ctrl.enumerate_validation = operator;
        let dynamicValueMatchResult;
        if (ctrl.type === "date") {
          let matchitem = ctrl.tag.match(/meta:{([^}]*)}/);
          const metaContent = matchitem[1];
          console.log("match", metaContent);
          const dayMatch = metaContent.match(/day:(\d+)/);
          const monthMatch = metaContent.match(/month:(\d+)/);
          const yearMatch = metaContent.match(/year:(\d+)/);
          const startAgeMatch = metaContent.match(/startAge:(\d+)/);
          const endAgeMatch = metaContent.match(/endAge:(\d+)/);

          if (dayMatch) {
            dynamicValueMatchResult = dayMatch[1];
            ctrl.validation = `${dynamicValueMatchResult}d`;
          }
          if (monthMatch) {
            dynamicValueMatchResult = monthMatch[1];
            ctrl.validation = `${dynamicValueMatchResult}m`;
          }
          if (yearMatch) {
            dynamicValueMatchResult = yearMatch[1];
            ctrl.validation = `${dynamicValueMatchResult}y`;
          }
          if (startAgeMatch) {
            dynamicValueMatchResult = startAgeMatch[1];
            ctrl.validation = `${dynamicValueMatchResult}`;
          }
          if (endAgeMatch) {
            console.log("end", endAgeMatch);
            dynamicValueMatchResult = endAgeMatch[1];
            ctrl.additional_input_advanced = dynamicValueMatchResult;
          }
        }
        dynamicValueMatchResult = ctrl.tag.match(
          new RegExp(`${operator}=(\\d+)`)
        );

        if (dynamicValueMatchResult && dynamicValueMatchResult[1]) {
          const extractedValue = dynamicValueMatchResult[1];
          ctrl.validation = extractedValue;
        } else if (operator == "regex") {
          const regexpMatchResult = ctrl.tag.match(/regex=([^,]+)/);
          ctrl.validation = regexpMatchResult[1];
        }
      }
      const withinMatchResult = ctrl.tag.match(/within=(\d+)([ydmwYDMW])/);
      if (withinMatchResult && withinMatchResult[1] && withinMatchResult[2]) {
        const value = withinMatchResult[1];
        const unit = withinMatchResult[2];
        const withinValue = value + unit;
        ctrl.validation = withinValue;
      }

      //"json:"hh" bson:"hh"  validate:"required,min=5,max=10"
      const betweenAgeMatchResult = ctrl.tag.match(/between_age=(\d+)-(\d+)/);
      if (
        betweenAgeMatchResult &&
        betweenAgeMatchResult[1] &&
        betweenAgeMatchResult[2]
      ) {
        const value2 = betweenAgeMatchResult[2];
        ctrl.additional_input_advanced = value2;
      }
      const minMaxMatchResult = ctrl.tag.match(/min=(\d+).*max=(\d+)/);
      if (minMaxMatchResult && minMaxMatchResult[1] && minMaxMatchResult[2]) {
        const maxLimit = parseInt(minMaxMatchResult[2]);
        ctrl.enumerate_validation = "in_between";
        ctrl.additional_input_advanced = maxLimit;
      }

      resolve(ctrl);
    });
  }

  //#endregion

  /**
   * This method used load default values type
   */
  loadDefaultValues(defaultValues: any, formData: any, model: any) {
    //sync way
    defaultValues.map((obj: any) => {
      let val;
      if (obj.type == "date") {
        formData[obj.colName] = moment()
          .utc()
          .startOf("day")
          .add(obj.addDays || 0, "day")
          .format(obj.format || "yyyy-MM-DDT00:00:00.000Z");
      } else if (obj?.value?.startsWith("@")) {
        val = obj.value.slice(1);
        formData[obj.colName] = model[val];
      } else if (obj.type == "exp") {
        if (obj.source == "local") {
          val = JSON.parse(sessionStorage.getItem(obj.value) || "");
          let data = val[obj.object][obj.object1];
          formData[obj.colName] = data;
        }
      } else if (obj.type == "prefix") {
        // if (obj.source == "project_id") {
        val = formData[obj.source];
        // let data = val[obj.object][obj.object1]
        formData[obj.colName] = "SEQ|" + val;
        // }
      } else {
        formData[obj.colName] = obj.value;
      }
    });
  }

  //#region  //? Update other Collections
  updatemultilegalForm() {}

  updatelang(ctrl: any, refId: any) {
    let datas: any = {};
    this.dataService.save("user", datas).subscribe((res: any) => {
      console.log(res);
    });
  }

  updateuser(ctrl: any, refId: any) {
    let datas: any = {};
    if (ctrl?.collectionName == "client") {
      datas = {
        _id: ctrl.model.contact_details.email_id,
        first_name:
          ctrl.model.contact_details.first_name +
          " " +
          ctrl.model.contact_details.last_name,
        mobile_number: ctrl.model.contact_details.mobile_number,
        user_type: ctrl.collectionName.toLowerCase(),
        role: "Admin",
        org_id: ctrl.model._id,
      };
    } else {
      datas = {
        _id: ctrl.model.email,
        name: ctrl.model.first_name + " " + ctrl.model.last_name,
        user_type: ctrl.collectionName.toLowerCase(),
        mobile_number: ctrl.model.mobile_number,
        role: ctrl.model.designation,
        employee_id: ctrl.model.employee_id,
        status: "Email Sended",
      };
    }
    this.dataService.save("user", datas).subscribe((res: any) => {
      console.log(res);
    });
  }

  //#endregion
}
