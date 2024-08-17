import { HttpClient } from "@angular/common/http";
import {
  Component,
  TemplateRef,
  ViewChild,
  OnInit,
  EventEmitter,
  Output,
  Input,
  AfterViewInit,
  HostListener,
  ElementRef,
  SimpleChanges,
  SimpleChange,
} from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { DataService } from "../../services/data.service";
import {
  ColDef,
  ColumnApi,
  FirstDataRenderedEvent,
  GetContextMenuItemsParams,
  GetRowIdFunc,
  GetRowIdParams,
  GridApi,
  GridReadyEvent,
  IGetRowsParams,
  IServerSideDatasource,
  IServerSideGetRowsParams,
  KeyCreatorParams,
  LoadSuccessParams,
  MenuItemDef,
  RowDoubleClickedEvent,
  RowNode,
  ServerSideTransaction,
} from "ag-grid-community";
import * as moment from "moment";
import { DialogService } from "../../services/dialog.service";
import { ActionButtonComponent } from "./button";
import * as _ from "lodash";
import { MyLinkRendererComponent } from "./cellstyle";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { ExcelService } from "src/app/services/excel.service";
import { HelperService } from "src/app/services/helper.service";
import 'ag-grid-enterprise';
import { environment } from "src/environments/environment";
import { MatSidenav } from "@angular/material/sidenav";
import { StatusColorComponent } from "./cellcolor";
import { FormGroup } from "@angular/forms";
import { firstValueFrom, Observable } from "rxjs";
@Component({
  selector: "app-datatable",
  templateUrl: "./datatable.component.html",
  styleUrls: ["./datatable.component.css"],
})
export class DatatableComponent  {
  collectionName!: string;
  form = new FormGroup({});
  excel: boolean = true
  listName!: string;
  config: any;
  pageHeading: any;
  columnDefs: any;
  filterOptions: any
  listData: any;
  addEditMode: string = "popup";
  fields: any;
  selectedRow: any = {};
  loading: boolean = false;
  public gridApi!: GridApi;
  components: any;
  context: any;
  formAction: string = "add";
  selectedModel: any = {};
  showbutton!: boolean;
  button!: boolean;
  @ViewChild("editViewPopup", { static: true })  editViewPopup!: TemplateRef<any>;
  @ViewChild("Popup", { static: true }) Popup!: TemplateRef<any>;
  formName!: string;
  model: any;
  user_id: any;
  models: any = {};
  filterQuery: any;
  showdefaultFilter: boolean = true
  export_data: any[] = []
  export_button: boolean = true
  config1:any
  @HostListener('window:resize', ['$event'])
  @Output("onClose") onClose = new EventEmitter<any>();
  @Input("mode") mode: string = "page";
  sort: any
  @ViewChild("drawer") drawer!: MatSidenav;
  @ViewChild("paymentDrawer") paymentDrawer!: MatSidenav;
  open_drawer: boolean = false
  open_payment_drawer: boolean = false
  parent_id: any
  //destroy the child component
  viewHeading: any
  viewHeading1: any
  config_view: any
  tooltip: any
  user_type:any

  public gridOptions: any = {
    flex: 1,
    cacheBlockSize: environment.cacheBlockSize,
    paginationPageSize: environment.paginationPageSize,
    rowModelType: environment?.rowModelType||'serverSide',
    paginationPageSizeSelector:[10,20,25,30,50,100]  
  }
  isConfigLoaded: boolean = false;
  overlayNoRowsTemplate ='<span style="padding: 10px; background:white ;">No Data Found</span>"';
    


  //Row Double Click Event
  onRowDoubleClicked(event: any) {
    debugger
    if (this.config.viewRoute || this.config.viewMode == "popup") {
      this.viewPage(event)
    }
    this.selectedRow = event.data;
    console.log('doble_click', event)
    this.selectedModel = this.selectedRow;
  }


  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private httpclient: HttpClient,
    private DataService: DataService,
    public dialogService: DialogService,
    private excelservice: ExcelService,
    private helperService: HelperService,
    private elementRef: ElementRef
  ) {
    this.user_id = sessionStorage.getItem("user_id");
    this.context = { componentParent: this };

    this.components = {
      buttonRenderer: ActionButtonComponent,
      linkRenderer: MyLinkRendererComponent,
      cellColorRenderer: StatusColorComponent
    }

  }




  ngOnInit() {
    debugger
    this.route.params.subscribe((params) => {
      if (params["form"]) {
        this.listName = params["form"];
        this.formName = this.listName;
        this.loadConfig();
        this.reloadGrid();

      }
    });

    this.user_type = sessionStorage.getItem('user_type')
  }

  public defaultColDef: ColDef = {
    resizable: true,
  };

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    params.api.sizeColumnsToFit()
    this.getList('', this.sort)
  }


  viewPage(event: any) {
    debugger
    const rowData = event.data;
    let id = this.config.keyField;
    console.log('Row Double Clicked:', rowData);
    if (this.config.viewMode == "popup") {
      this.formAction = "view"
      this.httpclient
        .get("assets/jsons/" + this.formName + "-" + "view" + ".json")
        .subscribe((frmConfig: any) => {
          this.config_view = frmConfig;
          this.fields = frmConfig.form.fields;
          this.tooltip = frmConfig.editTooltip
          // this.pageHeading = frmConfig.pageHeading;
          this.viewHeading = frmConfig.heading_name
          this.viewHeading1 = frmConfig.heading_name1
          this.selectedModel = rowData
          this.doAction(rowData, rowData[id]);
        });
    }
    else {
      this.router.navigate([
        `${this.config.viewRoute}`,
        rowData[this.config.keyField],
      ]);
      // Handle the double-click event logic here
    }
  }
 


  onFirstDataRendered(params: FirstDataRenderedEvent) {
    if (this.gridApi == undefined) {
      this.gridApi = params.api;
      params.api.sizeColumnsToFit();
    }

    // this.autoSizeAll()
  }

  loadConfig() {
    debugger
    // this.httpclient
    //   .get("assets/jsons/" + this.listName + "-" + "list.json")
    //   .subscribe((config: any) => {
    this.DataService.loadListConfigJson(this.listName).subscribe(config => {
        this.config = config;
        this.showbutton = config.showbutton;
        this.button = config.button
        this.filterQuery = this.DataService.getFilterQuery(config, this)
        this.sort = config.sort
        this.collectionName = config.collectionName;
        this.filterOptions = config.filterOptions
        this.pageHeading = config.pageHeading;
        this.addEditMode = config.addEditMode;
        this.showdefaultFilter = config.showdefaultFilter
        if (this.config.excel == false) {
          this.excel = this.config.excel
        } else {
          this.excel = true
        }
        this.fields = [];
        this.columnDefs = this.config.columnDefs;
        if(this.user_type == "SAAS" && this.config.hideForSaas == true){
          this.columnDefs.pop()
        }

        this.columnDefs.forEach(async (e: any) => {
          //! Undo If not WorkIng
          // if (e.show == "default") { 
          //   e.cellRenderer= (params: ICellRendererParams) => {            
          //   if (params.data !== undefined) {
          //       if(params.data.flag===true){
          //       return 'No Data Found'
          //       }
          //   return params.data[e.field];
          //   }
          //    else 
          //   {
          //     return '<img src="https://www.ag-grid.com/example-assets/loading.gif"> Loading Data...Please Wait......'
          //   }}
          //   }


          if (e.type == "datetime") {

            e.valueGetter = (params: any) => {
              if (params.data && params.data[e.field]) {
                return moment(params.data[e.field]).format(e.format || "DD-MMM-YYYY, hh:mm A");
              }
              return
              //! if need Current date 
              // return moment().format(e.format || "DD/MM/YYYY, hh:mm A"); //? set curent date
            }
          }  else if (e.type == "date") {

            e.valueGetter = (params: any) => {
              if (params.data && params.data[e.field]) {
                return moment(params.data[e.field]).format(e.format || "DD-MMM-YYYY");
              }
              return
              //! if need Current date 
              // return moment().format(e.format || "DD/MM/YYYY, hh:mm A"); //? set curent date
            }
          }  else if (e.type == 'object') {

            e.valueGetter = (params: any) => {
              if (params.data) {
                   let item= e.field.split(".").reduce((o:any, i:any) =>
                    {if(o == undefined){
                      return
                    }else{
                    return  o[i]
                    } }, params.data);
                return item
              } else {
                return ""
              }
            }
          } 

          
          if (e.type == "color") {
            e.cellStyle = (params: any) => {
              return { color: "blue" };
            };
          }
          if (e.width) {
            e["width"] = e.width;
          }
          //  Give in Json 
          // sample json
          // {
          //   "headerName": "STATE NAME",
          //   "field": "state_name",
          //   "sortable": true,
          //   "minWidth": 400,
          //   "maxWidth": 300,
          //   "type":"set_Filter",
          //   "Diffkey":true,
          //   "keyCreator":"state_code",
          //   "filter": "agSetColumnFilter"
          // },


          // "type":"set_Filter",
          // "filter": "agSetColumnFilter"
          //! we can give for prefined values because the data dows not come from schematic collection 
          if (e.type == "set_Filter" && e.filter == "agSetColumnFilter") {
            if (e.Diffkey == true) {
              e.filterParams = {
                values: (params: any) => {
                  this.DataService.getDataByFilter(this.collectionName, { start: 0, end: 1000, filter: this.filterQuery }).subscribe((xyz: any) => {
                    const apidata = xyz.data[0].response
                    const uniqueArray = Array.from(
                      new Map(apidata.map((obj: any) => [obj[e.field], obj])).values()
                    );
                    params.success(uniqueArray)
                  })

                },
                keyCreator: (params: KeyCreatorParams) => {
                  return [params.value[e.keyCreator], e.keyCreator, true];
                }, valueFormatter: (params: any) => {
                  return params.value[e.field];
                }
              }
            }
            else {

              e.filterParams = {
                values: (params: any) => {
                  this.DataService.getDataByFilter(this.collectionName, { start: 0, end: 1000, filter: this.filterQuery }).subscribe((xyz: any) => {
                    const apidata = xyz.data[0].response.map((result: any) => {
                      let val = result[e.field];
                      if (val !== undefined) {
                        return val;
                      }
                    }).filter((val: any) => val !== undefined); // Filter out undefined values
                    params.success(apidata)
                  })
                }

              }
            }
          }




          //if the object in nested array
          if (e.type == "set_Filter" && e.filter == "agSetColumnFilter" && e.object_type == "nested_array") {
            debugger
            e.filterParams = {
              values: (params: any) => {
                this.DataService.getDataByFilter(this.collectionName, { start: 0, end: 1000, filter: this.filterQuery }).subscribe((xyz: any) => {
                  const apidata = xyz.data[0].response.map((result: any) => {
                    //let val = result[e.field];
                    let val = e.field.split(".").reduce((o: any, i: any) =>
                      o[i], result
                    );
                    if (val !== undefined) {
                      return val;
                    }
                  }).filter((val: any) => val !== undefined); // Filter out undefined values
                  params.success(apidata)
                })
              }
            }
          }
        });
        //get list of records for specific collection/table
        this.isConfigLoaded = true;
    
        this.getList(this.filterQuery, config.sort);
        if(this?.gridApi){
          
          this.gridApi.updateGridOptions({columnDefs:this.columnDefs})
        }

      });

  }


  

  public isVisible = true;
  reloadGrid() {
    this.isVisible = false;
    if(this.gridApi){
      this.gridApi.destroy();
    }
    setTimeout(() => (this.isVisible = true), 0.1);
  } 

  /**
   * This method Get All Data by Passing collectionName  in grid
   */
  getList(filterQuery?: any, sort?: any) {
    //! DEfenie this for GridAPi Should not be undefined
    if (this.gridApi !== undefined) {
      const datasource:IServerSideDatasource = {
        getRows: async (params: IServerSideGetRowsParams) => {
          let obj: any = {
            start: params.request.startRow,
            end: params.request.endRow,
            filter: params.request.filterModel,
            sort: params.request.sortModel,
          };

          this.DataService.makeFiltersConditions(obj).then(async (filtercondition: any) => {
              let filter = filtercondition.filter;
              filtercondition.filter = [];
              if (this.filterQuery !== undefined && filterQuery !== undefined) {
                if (this.filterQuery == filterQuery) {
                  filtercondition.filter = [...this.filterQuery, ...filter];
                } else {
                  filtercondition.filter = [
                    ...this.filterQuery,
                    ...filter,
                    ...filterQuery,
                  ];
                }
              } else if (this.filterQuery !== undefined) {
                filtercondition.filter = [...this.filterQuery, ...filter];
              } else if (filterQuery !== undefined) {
                filtercondition.filter = [...filter, ...filterQuery];
              } else {
                filtercondition.filter = [...filter];
              }
              if (sort != undefined) {
                filtercondition.sort = sort;
              }
             let apiObservable: Observable<any>;
             if (this.config.dataset) {
               apiObservable = this.DataService.dataset_Get_Data(this.config.dataset['name'], filtercondition);
             } else {
               apiObservable = this.DataService.getDataByFilter(this.collectionName, filtercondition);
             }
           
             try {
              const response = await firstValueFrom(apiObservable);
              console.log(response?.data[0]?.response);
              
              if (await response?.data[0]?.response !== undefined) {
              
                await params.success({
                  rowData: response.data[0].response,
                  rowCount: response.data[0].pagination[0].totalDocs
                });
                params?.api?.hideOverlay();
                // params?.api?.setRowCount(params?.request?.endRow || environment?.paginationPageSize)
                params?.api?.sizeColumnsToFit();
                // this.listData = response.data[0].response;
                // params.success({
                //   rowData: response.data[0].response,
                //   rowCount: response.data[0].response.length
                // })
                console.log(response);
              
              } else {
                params?.api?.showNoRowsOverlay();
                params?.success({
                  rowData: [],
                  rowCount: 0
                });
              }
            } catch (err) {
              params.api.showNoRowsOverlay();
              params?.success({
                rowData: [],
                rowCount: 0
              });
            }
            }
          );
        },
      }; 
      // this.gridApi.updateGridOptions({serverSideDatasource:datasource})
      this.gridApi.setGridOption('serverSideDatasource',datasource)
      console.log(this.gridApi)
      // this.gridApi.setServerSideDatasource(datasource);
      // console.warn(this.gridApi.paginationGetRowCount());

    }
  }


  // Method for add form
  onAddButonClick() {
    this.selectedModel = {};
    this.formAction = "add";

    let user_type: any = sessionStorage.getItem("user_type")
    if (this?.config?.role) {
      if (this?.config?.rolebased && user_type == "SAAS") {
        this.selectedModel.org_type = user_type
      } else {
        this.selectedModel.org_id = sessionStorage.getItem("org_id")
        this.selectedModel.org_type = user_type
      }
    }
    this.doAction();
  }

  edit() {
    this.dialogService.closeModal()
    this.formAction = "edit"
    this.dialogService.openDialog(this.editViewPopup, this.config["screenWidth"], null,
      this.selectedModel
    );
  }


  // Method for action buttons
  onActionButtonClick(item: any, data: any) {
    this.selectedModel = this.selectedRow;
    this.formAction = item.label.toLowerCase();
    this.formName = item.formName;
    let id = this.config.keyField;
    if (this.formAction == "add") {
      this.selectedModel = {};
      this.doAction(data, data.id);
    } else if (this.formAction == "edit") {
      this.selectedModel = data;
      this.doAction(data, data[id], item);
    } else if (item.formAction == "list") {
      if (item.storage == true) {
        let modelname: any = data._id;
        sessionStorage.setItem("model_name", modelname);
      }
      if (item.type == "masterdetailsform") {
        this.router.navigate([`${item.route}` + "/" + data._id]);
      } else {
        this.router.navigate([`${item.route}`]);
      }
    }  else if (this.formAction == "route") {
      this.router.navigate([
        `${this.config.addRoute}`,
        data[this.config.keyField],
      ]);
     } else  if (item.type == "routing") {
      const updatedRoute: any = item.route.replace(
        /{{(\w+.)}}/g, (_match: any, field: any) => {
          let value: any =  _.get(data,field) || undefined
          if (value != undefined && value != null) {
            return value
          }
        }
      );
      this.router.navigateByUrl(updatedRoute)
    }
    else if (this.formName == "new_tab") {
      let url = this.config.addRoute + data[this.config.keyField]
      window.open(url, '_blank');
      //this.router.navigate([`${this.config.addRoute}`])
    }
    else if (this.formAction == "view") {
      this.httpclient
        .get("assets/jsons/" + this.formName + "-" + "view" + ".json")
        .subscribe((frmConfig: any) => {
          this.config_view = frmConfig;
          this.fields = frmConfig.form.fields;
          this.pageHeading = frmConfig.pageHeading;
          this.doAction(data, data[id]);
        });
    } else if (this.formAction == "delete") {
      // ? Tacking Primary Key  
      // ! USE keyField
      let id =_.get(data,this.config?.['keyField'] || '_id')
      if (confirm("Do you wish to delete this record?")) {
        this.DataService.deleteDataById(this.collectionName,id).subscribe(
          (res: any) => {
            this.dialogService.openSnackBar(
              "Data has been deleted successfully",
              "OK"
            );
            const transaction: ServerSideTransaction = {
              remove: [data],
            };
            const result = this.gridApi.applyServerSideTransaction(transaction);
            console.log(transaction, result);

          }
        );
      }
    }
    else if (this.formAction == "deactivate") {
      let id =data._id
      let item = {
        "status":"InActive"
      }
         if (confirm("Do you wish to deactivate this record?")) {
   
           this.DataService.update(this.formName,id,item).subscribe(
             (res: any) => {
               this.dialogService.openSnackBar(
                 "Data has been deactivated successfully",
                 "OK"
               ); 
               const transaction: ServerSideTransaction = {
                 remove: [data],
               };
               const result = this.gridApi.applyServerSideTransaction(transaction);
               console.log(transaction, result);
   
             }
           );
         }
       } else if(item.popup){
        this.httpclient
        .get("assets/jsons/" + this.formName + "-" + "form" + ".json")
        .subscribe((frmConfig: any) => {
          this.config1 = frmConfig;
          this.fields = frmConfig.form.fields;
          this.dialogService.openDialog(this.Popup,
            this.config1["screenWidth"],null,data
          );
        });
       
       }
  }
 

  // Open dialog for add,edit and view
  public getRowId: GetRowIdFunc = (params: GetRowIdParams) =>
    `${params.data[this.config.key_field ? this.config.key_field : "_id"]}`;

  close(event: any) {
    debugger
    this.fields = undefined;
    if (!event) return
    if (event.action == "filter") {
      this.getList(event.data)
    }
    this.gridApi.hideOverlay()
    
    if (event.action === "Add" && event.data) {
      this.gridApi.deselectAll();
      const transaction: ServerSideTransaction = {
        add: [event.data],
      };
      const result = this.gridApi.applyServerSideTransaction(transaction);
      console.log(transaction, result)
    } else {
      const transaction: ServerSideTransaction = {
        update: [event.data],
      };
      const result = this.gridApi.applyServerSideTransaction(transaction);
      console.log(transaction, result)
      
    }
    this.dialogService.CloseALL();
  }
 
  doAction(data?: any, id?: any, item?: any) {
    debugger
    if (this.config.editMode == "popup" || this.config.viewMode == "popup") {
      this.dialogService.openDialog(
        this.editViewPopup,
        this.config["screenWidth"],
        null,
        data
      );
      // console.log('if',data);

    } else {
      if (this.formAction == "add") {
        this.router.navigate([`${this.config.addRoute}`]);
      } else if (this.formAction == "edit") {
       
          this.router.navigate([
            `${this.config.editRoute}`,
            data[this.config.keyField],
          ]);
        
      } else if (this.formAction == "view") {
        
          this.router.navigate([
            `${this.config.viewRoute}`,
            data[this.config.keyField],
          ]);
      }else  if (item.type == "routing") {
        const updatedRoute: any = item.route.replace(
          /{{(\w+.)}}/g, (_match: any, field: any) => {
            console.log(field);
  
            let value: any =  _.get(data,field) || undefined
  
            if (value != undefined && value != null) {
              return value
            }
          }
        );
        this.router.navigateByUrl(updatedRoute)
      }else {
        this.dialogService.openDialog(
          this.editViewPopup,
          this.config["screenWidth"],
          null,
          data
        );
      }
    }
  }

  getContextMenuItems(params: GetContextMenuItemsParams): (string | MenuItemDef)[] {
    debugger
    var result: (string | MenuItemDef)[] = [
      // 'autoSizeAll',
      // 'resetColumns',
      // 'expandAll',
      // 'contractAll',
      'copy',
      'copyWithHeaders',
      'separator',
      // 'paste',
      {
        name: 'Export To Excel',
        disabled: params.context.componentParent.excel,
        subMenu:
          [
            // {
            // name: 'Excel',
            // subMenu: [
            {
              name: 'Selected Data Only ',
              action: () => {
                if (params.context.componentParent.gridApi.getSelectedRows().length !== 0) {
                  params.context.componentParent.onBtExport(false)
                } else {
                  window.alert('No data Selected');
                }
              }
            }, {
              name: 'All Data',
              action: () => { params.context.componentParent.onBtExport(true) }
            }
          ]
      }
    ];

    return result;

  }
  
  onBtExport(flag?: any) {
    if (flag == true) {
      console.log(this.gridApi.paginationGetRowCount());
      
      this.DataService.getDataByFilter(
        this.collectionName , {start : 0,end : this.gridApi.paginationGetRowCount()||100}
      ).subscribe(async (xyz: any) => {
        this.excelservice.downloadFile(xyz.data[0].response, this.config.csvExport.columns, this.config.csvExport.header, this.config.csvExport.fileName);
      }
      )
    } else {
      let data = this.gridApi.getSelectedRows()
      this.excelservice.downloadFile(data, this.config.csvExport.columns, this.config.csvExport.header, this.config.csvExport.fileName);
      this.gridApi.deselectAll();
    }

  }


  export_excel() {
    this.excelservice.downloadFile(this.export_data, this.config.csvExport.columns, this.config.csvExport.header, this.config.csvExport.fileName);
  }

  walletResponse: any
  walletId: any
  collection: any
  roundedAmountNumber: any
  currency_symbol:any
  countrylist:any
 
  downloadexcel(){
    this.DataService.getparentdata(this.config.excel_collectionName).subscribe((res:any)=>{
      if(res.status == 200){
        window.open(res.data.filepath, '_blank');
      }
    },error=>{
      this.dialogService.openSnackBar(error.error?.message, "OK")
    })
  }


} 