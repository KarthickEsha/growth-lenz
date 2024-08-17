import { Component, OnInit } from '@angular/core';
import { FieldType, FormlyFieldConfig } from '@ngx-formly/core';
import { DatePipe } from '@angular/common';
import { v4 as uuidv4 } from 'uuid';
import 'ag-grid-enterprise';
import {
  DomLayoutType,
  GetRowIdFunc,
  GetRowIdParams,
  GridApi,
  GridReadyEvent,
  RowGroupingDisplayType,
  ValueFormatterParams,
} from "ag-grid-community";
import 'ag-grid-enterprise';
import * as _ from 'lodash';
import { DataService } from '../services/data.service';
import { SharedService } from '../services/utils';
@Component({
  selector: 'label',
  template: `
  <style>
    /* ::ng-deep .ag-ltr .ag-row > .ag-cell-wrapper.ag-row-group-indent-1 {
    padding-left: 16px !important;
} */
::ng-deep .left-align{
  border-right: 1px solid white !important;
  justify-content: center;
  margin-left: 50px !important;
}


  </style>

    <div *ngIf="this.display=='text'" style="margin:10px 20px 10px 30px">

    <h5 *ngIf="field.key && this.formControl?.value!=undefined" style="color:grey;">{{this.field.props?.label}}</h5>
    <h3 *ngIf="!this.field.key && this.formControl?.value!=undefined && !this.opt.show_label" style="color:black;">{{this.field.props?.label}}</h3>
   
    <p *ngIf="displayType == 'currency'">{{getValue()}}</p>
    <p *ngIf="displayType =='text'" >{{getValue()}}</p>
    <p *ngIf="displayType =='HTML'" [innerHtml]="getValue()"></p>
    <p *ngIf="displayType =='label'" >{{get_label_value()}}</p>
    <p *ngIf="displayType =='symbol'"  [innerHtml]="getValue()"></p>
    <img *ngIf="this.field.props?.['showImage']" width="200" height="133" style="object-fit:contain"    [src]="image"  
    /> 
    <ul *ngIf="displayType =='file'"  style="width: max-content;margin: 5px 10px 20px 22px;">
    <li class=list *ngFor="let item of this.formControl?.value"><a href={{item.file_path}}
    target="_blank">{{item.file_name}}</a></li>
    </ul>
    
    <ul *ngIf="displayType =='multi-data'" style="width: max-content;margin: 5px 10px 20px 22px;">
      <li class=list *ngFor="let item of getValue()">
        {{item}}
      </li>
    </ul>
    
    </div>

    <div>
    <p *ngIf="this.opt.show_label" style="padding: 10px;font-weight:bold">{{get_label()}}</p>
    </div>

    <div   *ngIf="this.displayType == 'grid'">{{this.show_griddata()}}
    <ag-grid-angular
  
    style="width: 100%; height: 60vh;margin:0px 0px 10px 0px"
    class="ag-theme-alpine"
    [columnDefs]="columnDefs"
    [pagination]="true"
    [paginationPageSize]="20"
    [rowData]="rowData"
    [gridOptions]="gridOptions"
    [rowSelection]="rowSelection"
    (gridReady)="onGridReady($event)"
    >
    </ag-grid-angular>
    </div>

    <div *ngIf="this.field.props.showRateCardInDispatch" style="margin:20px 5px 20px 5px;font-weight:bold">{{this.field.props?.label}}</div>
    <div *ngIf="this.field.props.showRateCardInDispatch">{{this.getdispatch_ratecard()}}
    <!-- <ag-grid-angular
    style="width: 100%; height: 60vh;margin:0px 0px 10px 0px"
    class="ag-theme-alpine"
    [columnDefs]="columnDefs"
    [pagination]="true"
    [paginationPageSize]="20"
    [rowData]="rowData"
    [gridOptions]="gridOptions"
    [rowSelection]="rowSelection"
    [groupDefaultExpanded]="groupDefaultExpanded1"
    (gridReady)="onGridReady($event)"
    >
    </ag-grid-angular> -->



    <ag-grid-angular
    style="width: 100%; height: 60vh;"
    class="ag-theme-alpine"
    [columnDefs]="columnDefs"
    [pagination]="true"
    [paginationPageSize]="20"
    (gridReady)="onGridReady($event)"
    [rowData]="rowData"
    [gridOptions]="gridOptions"
    [groupDefaultExpanded]="groupDefaultExpanded1"
    [autoGroupColumnDef]="autoGroupColumnDef"
    [enableRangeSelection]= true
    [groupDisplayType]="groupDisplayType"
    [suppressRowClickSelection]="true"
    [animateRows]="true"
    ></ag-grid-angular>


    </div>


  `
})


// <div>
// <h6 class="heading">Project ID</h6>
// <p>{{data?._id}}</p>
// </div>
export class FormlyLabelView extends FieldType<any> implements OnInit {
  displayType = 'text'
  public gridApi!: GridApi;
  opt: any;
  date: any
  width = "150px"
  height = "20px"
  display:any='text'
  image:any
  currency_symbol:any
  multi_data :any
  storedData:any
  columnDefs:any[]=[]
  rowData:any[]=[]
  public groupDisplayType: RowGroupingDisplayType = 'groupRows'
  public groupDefaultExpanded = 1;
  public rowSelection: "single" | "multiple" = "single";
  public gridOptions: any = {
    // resizable: true,
    groupRowRendererParams: {
      // puts a checkbox onto each group row
      checkbox: false
    }
  };

public groupDefaultExpanded1 = 2;
  public autoGroupColumnDef = {}
  constructor(
    private datePipe: DatePipe,
    private dataService:DataService,
    private sharedService:SharedService
  ) {
    super();
  }

  onGridReady(params: GridReadyEvent<any>) {
    this.gridApi = params.api;
  }
  ngOnInit(): void {
 
    this.opt = this.field.props || {};
    this.width = this.opt.width || "150px"
    this.height = this.opt.height || "20px"
    this.displayType = this.opt.inputType || 'text'
    this.display=this.opt.display || "text"
    this.show_griddata()

    if(this.field.props.showRateCardInDispatch){
      this.getdispatch_ratecard()
    }

  }
  public getRowId: GetRowIdFunc = (params: GetRowIdParams) => params.data._id;

  areKeysPresent(obj: any, keys: (string | number)[]): boolean {
    return keys.every(key => obj.hasOwnProperty(key));
  }

  getValue() {
    this.date = this.field.props?.attributes
   
    if (this.date?.pipe == "date") {
      let key = this.field.key as string
      let date = this.field.model[key]
      return this.datePipe.transform(date, ("dd-MMM-YYYY"))
    }else if (typeof this.formControl?.value === 'boolean') {
      if(this.formControl?.value == true){
        return "Yes"
      }
      if(this.formControl?.value == false){
        return "No"
      }
    }else if(this.field.props?.['showImage']){
      this.image=this.model["logo"]
    }
    else if(this.field.name){
   
     this.multi_data = this.model[this.field.name]
      return  this.multi_data 
    }
   
    else if(this.opt.name1){

      const a = [
        this.getNestedPropertyValue(this.model, this.opt.name1),
        this.getNestedPropertyValue(this.model, this.opt.name2),
        this.getNestedPropertyValue(this.model, this.opt.name3),
        this.getNestedPropertyValue(this.model, this.opt.name4),
        this.getNestedPropertyValue(this.model, this.opt.name5),
        this.getNestedPropertyValue(this.model, this.opt.name6),
        this.getNestedPropertyValue(this.model, this.opt.name7)
      ];

      // const filteredValues = a.filter(value => value !== undefined);
      // const resultString =filteredValues.map(value => value + ',').join('\n');

      const filteredValues = a.filter(value => value !== undefined);

// const resultString = filteredValues.join(',\n');
const resultString = filteredValues.join(',<br>');


    // let b = resultString.slice(0, -1);
    // let a =  this.model[this.opt.name1]+','+ this.model[this.opt.name2]+','+ this.model[this.opt.name3]+','+ this.model[this.opt.name4]+','+ this.model[this.opt.name5]+','+ this.model[this.opt.name6]+','+ this.model[this.opt.name7]


return resultString
     }
    else if(this.date?.pipe == "currency"){
    this.currency_symbol =  this.model.currency_symbol
    let currencySymbolChar = this.convertHtmlEntityToChar(this.currency_symbol);
   let formControlValue = this.formControl?.value

   if (typeof formControlValue === 'number') {
   let  formattedValue = currencySymbolChar + formControlValue.toLocaleString();
   return formattedValue
   }
    }
    else if(this.opt?.concat){
      let key = this.field?.key.split(".").reduce((o:any, i:any) =>{
        if(o==undefined || i==undefined){
          return undefined
        } else {
         return  o[i]
        }
      },this.model
     );
     let key2 = this.field?.key2.split(".").reduce((o:any, i:any) =>{
      if(o==undefined || i==undefined){
        return undefined
      } else {
       return  o[i]
      }
    },this.model
   );
 return key +" " + key2

    }
    else {
      return this.formControl?.value
    }
  }

  get_label_value(){
    if(this.model[this.field.key] == this.field.value){
      return this.field.label
    } else {
    return  this.model[this.field.key]
    }
  }

  convertHtmlEntityToChar(htmlEntity: string): string {
    const doc = new DOMParser().parseFromString(htmlEntity, 'text/html');
    return doc.documentElement.textContent || "";
  }



   getNestedPropertyValue(obj: any, keys: string): any {
    const keysArray = keys.split('.');
    return keysArray.reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), obj);
  }

  show_griddata(){

    if(this.field.get_model_data){
      this.columnDefs=this.opt.columndef
      this.rowData=this.opt.row_data
  
      let data= this.model[this.field.key]
      // Merge arrays based on 'sla' property
     let mergedData = _.map(this.rowData, (itemA) => {
       let matchingItemB = _.find(data, { sla: itemA.sla });
       return _.merge({}, itemA, matchingItemB);
     });
     
     // Remove 'prototype' property from objects
     mergedData = mergedData.map(item => _.omit(item, 'prototype'));
      this.rowData = mergedData
      console.log(this.rowData,"dataaaaaaaaaa")
    } else if(this.field.api_call){
    this.getrepeat_section_data()
    } else if(this.opt.discount_percent){
      this.columnDefs =  this.opt.columndef
      this.get_percentageData()
    }
   
  }


   // get repeat section data
   getrepeat_section_data(){
    this.columnDefs=this.opt.columndef
    this.opt.multifilter_condition.conditions.map((res:any)=>{
      
      if(res.get_data == "model_data"){
        res.value=this.model[this.field.parentKey]
      }
    })
    let filter_condition={filter:[
      this.opt.multifilter_condition
    ]}

    this.dataService.getDataByFilter(this.opt?.multifilter_cllectionName,filter_condition).subscribe((res:any)=>{
     console.log("data",this.model)
      if(res.data != null){
       let data =  res.data[0].response
        this.rowData=data
       console.log(this.rowData,"rowdata")
      } else {
        this.rowData = []
      }
      this.rowData= res.data[0].response
       this.gridApi?.setRowData(this.rowData);
      // this.gridApi?.setRowData(this.rowData);
  
  })
}

get_percentageData(){  
    this.opt.multifilter_condition.conditions.map((res:any)=>{
      
      if(res.get_data == "model_data"  && this.model[res.field] != undefined){
        res.value=this.model[res.field]
      }
    })
    let filter_condition={filter:[
      this.opt.multifilter_condition
    ]}

    this.dataService.getDataByFilter(this.opt?.multifilter_cllectionName,filter_condition).subscribe((res:any)=>{
     
      if(res.data != null){
        console.log(res.data[0].response,"data")
       let data =  res.data[0].response
       this.rowData=data
      } else {
        this.rowData = []
      }
      this.gridApi?.setRowData(this.rowData);
  })

  }


parentData:any[]=[]
countryList:any
disPatchRowData:any[]=[];
listData: any
getdispatch_ratecard(){

  let filter_condition1 :any= {
    filter: [
      {
        clause: "AND",
        conditions: [
          {
            column: "org_id",
            type: "string",
            operator: "EQUALS",
            value: this.model["_id"]
          },
          {
            column: "job_type",
            type: "string",
            operator: "EQUALS",
            value: "Dispatch Service"
          }
        ]
      }
    ],
    sort: [
      {
        sort: "desc",
        colId: "skill_name"
      }
    ]
  }
  let filter_condition2: any = {
    filter: [
      {
        clause: "AND",
        conditions: [
          {"column":"status","operator":"EQUALS","type":"string","value":"Active"}
        ]
      }
    ]
  }

  let filter_condition3 :any= {
    filter: [
    {
    clause: "AND",
    conditions: [
    {
    column: "org_id",
    type: "string",
    operator: "EQUALS",
    value: this.model["_id"]
    }
    ]
    }
    ]
    }

 if(this.field.props.showRateCardInDispatch){
 let  collectionName = "engineer_level_config"


let filter =  {
  start: 0,
  end: 50,
  filter: [],
  sort: []
}
if(this.model["_id"] == undefined){return }

let DispatchColumndef = this.field.props.DispatchColumndef
this.dataService.getDataByFilter(collectionName,filter_condition3).subscribe((res:any)=>{
let SLA_data = res.data[0].response

const headers = SLA_data.map((item:any) => ({
   headerName: item.display_name,
   field:item.id,
   width: 150,
   valueFormatter: this.currencyFormatter,
   cellDataType: 'number',
   cellEditor: 'agNumberCellEditor',
   cellEditorParams: {
    min: 1,
    max: 1000000,
    precision: 2,
  }
  }));
  this.parentData=headers

console.log(headers,'childresnnnnnnnnnnnn')
DispatchColumndef[3].children = headers.map((obj:any) => ({ ...obj, field: "sla1." + obj.field }));
DispatchColumndef[4].children = headers.map((obj:any) => ({ ...obj, field: "sla2." + obj.field }));
DispatchColumndef[5].children = headers.map((obj:any) => ({ ...obj, field: "sla3." + obj.field }));
DispatchColumndef[6].children = headers.map((obj:any) => ({ ...obj, field: "sla4." + obj.field }));


this.columnDefs = DispatchColumndef
this.gridApi.setGridOption("columnDefs", this.columnDefs);
console.log(this.columnDefs,"Dispatch columnDefs")

})


  this.dataService.getparentdata(this.field.countryCollectionName).subscribe((res:any)=>{
    let country
    if(res.status == 200){
      country = res.data
    } else {
      this.countryList = []
    }
    
     // Display country based on the onsite and remote service
     if(this.field.get_parent_country && country != undefined){
      let a = [...this.model["on_site_service_providing_countries"],...this.model["remote_service_providing_countries"]]
      let unique_data = [...new Set(a)];
   this.countryList = country.filter((item : any) => unique_data.includes(item._id));
     } else {
       this.countryList =[]
     }
   })
}
  this.dataService.getDataByFilter("rate_card", filter_condition1).subscribe((res: any) => {
    console.log(res, 'sdadsadsa');
    if(res.data != undefined && res.data != null && res.data.length > 0) {
      let ratecard_data = res.data[0]?.response
      this.dataService.getDataByFilter("services", filter_condition2).subscribe((res: any) => {
        let filterRes = res.data[0].response
        let skills_data : any[] = []
        for (let i in filterRes){
          let dd =filterRes[i]
          for(let i in dd.result){
            dd.result[i]["service_name"]=dd.name
            dd.result[i]["parent_id"]=dd._id
            skills_data.push(dd.result[i])
          }
        }
        console.log(res, 'asddddddddddddddddddd');
        skills_data.forEach((element: any) => {
          element.skill_id = element._id
          element._id = uuidv4()
          element.skill_name = element.name
     
          this.parentData.forEach((res: any) => {
            var a = res.field;
            element["sla1"] = { ...element["sla1"], [a]: null };
            element["sla2"] = { ...element["sla2"], [a]: null };
            element["sla3"] = { ...element["sla3"], [a]: null };
            element["sla4"] = { ...element["sla4"], [a]: null };
        });
          });
    
    
          this.disPatchRowData = []
    if(this.countryList != undefined){
    
    for(let i = 0; i < this.countryList.length; i++){
    for(let j = 0; j < skills_data.length; j++){
    const newData = _.cloneDeep(skills_data[j]);
    
    newData['country_name'] = this.countryList[i].country_name; // Set the country name in the copy
     newData['country_id'] = this.countryList[i]._id
    this.disPatchRowData.push(newData);
    
    }
    }
    console.log(this.disPatchRowData,"finalllllllyy")             
    }
    
        // Find values that are in result1 but not in result2
        const array = this.disPatchRowData.filter(function (obj: any) {
          return !ratecard_data.some(function (obj2: any) {
            return obj.skill_id == obj2.skill_id && obj2.parent_id == obj2.parent_id && obj.country_id == obj2.country_id;
          });
        });
       
       let newObject = skills_data[0].sla1
    
     ratecard_data.forEach((item:any)=>{
      for(let key in newObject){
        if(!(key in item.sla1)){
          item.sla1[key] = null
        }
        if(!(key in item.sla2)){
          item.sla2[key] = null
        }
        if(!(key in item.sla3)){
          item.sla3[key] = null
        }
        if(!(key in item.sla4)){
          item.sla4[key] = null
        }
    
      }
     })
    
     const values: any = [...ratecard_data, ...array]
        let data: any[] = this.disPatchRowData
        if (values) {
          data = values
          this.rowData = data
          console.log(this.rowData,"sservicessssssss")
          }
    
    
        this.gridApi.setGridOption("rowData", values);
      })
    }
   
  })


}

domLayout: DomLayoutType = 'autoHeight';
currencyFormatter(params: ValueFormatterParams) {
  if (params.value == null) {
    return '';
  }
  return params.value.toLocaleString();
}

get_label(){

  if(this.field.show_currency_code && this.model["billing_base_currency_symbol"] != undefined){
    const doc = new DOMParser().parseFromString(this.model["billing_base_currency_symbol"], 'text/html');
    let currency_symbol = doc.documentElement.textContent || "";
    return this.field.label + " in " + "( "+currency_symbol+" )"
  }else {
    return this.field.label
  }
}





}
 
