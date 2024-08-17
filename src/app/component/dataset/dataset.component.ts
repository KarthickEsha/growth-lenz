import { Component, ComponentFactoryResolver, TemplateRef, ViewChild, ViewContainerRef } from "@angular/core";
import { FormArray, FormBuilder, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import {
  ColumnApi,
  GridApi,
  GridReadyEvent,
  SideBarDef,
} from "ag-grid-community";
 import * as _ from "lodash"
import * as moment from "moment";
import { DataService } from "src/app/services/data.service";
import { DialogService } from "src/app/services/dialog.service";
import { environment } from "src/environments/environment";
import { NgmodelComponent } from "./ngmodel/ngmodel.component";
@Component({
  selector: "app-dataset",
  templateUrl: "./dataset.component.html",
  styleUrls: ["./dataset.component.css"],
})
export class DatasetComponent {
  public gridOptions: any = {
    flex: 1,
    cacheBlockSize: environment?.cacheBlockSize,
    paginationPageSize: environment?.paginationPageSize,
    rowModelType: environment?.rowModelType,
  };
  
  overlayNoRowsTemplate =
    '<span style="padding: 10px; background:white ;">Loading Please Wait...</span>"';
  public sideBar: SideBarDef | string | string[] | boolean | null = {
    toolPanels: [
      {
        id: "Selected Columns",
        labelDefault: "Selected Columns",
        labelKey: "Selected Columns",
        iconKey: "Selected Columns",
        toolPanel: "agColumnsToolPanel",
        toolPanelParams: {
          suppressRowGroups: true,
          suppressValues: true,
          suppressPivots: true,
          suppressPivotMode: true,
          // suppressColumnFilter: true,
          // suppressColumnSelectAll: true,
          // suppressColumnExpandAll: true,
        },
      },
    ],
    defaultToolPanel: "Selected Columns",
  };
  custom_Variable_Arr: any = [];
  dataSet: any =this.formBuilder.group({
    dataSetName: ["", [Validators.required, Validators.minLength(3)]],
    dataSetDescription: [""],
    dataSetBaseCollection: ["", [Validators.required]],
    dataSetBaseCollectionFilter: [[]],
    dataSetJoinCollection: this.formBuilder.array([]),
    CustomColumn: this.formBuilder.array([]),
    Aggregation: this.formBuilder.array([]),
    SelectedList: [[]],
    FilterParams: this.formBuilder.array([]),
    Filter: [],
  });
  
  @ViewChild("Popup", { static: true }) Popup!: TemplateRef<any>;
  @ViewChild("Filter", { static: true }) Filter!: TemplateRef<any>;

  @ViewChild("previewGrid", { static: true }) previewGrid!: TemplateRef<any>;

  fromCollection: any;
  fromCollectionReference: any;
  toCollection: any;
  toCollectionReference: any;

  fromcollectionList: any[] = [];
  tocollectionList: any[] = [];
  fromcollectionListID: any[] = [];
  tocollectionListID: any[] = [];
  aggFn: any[] = [];
  custom_columns_fn: any[] = [];
  custom_columns_select: any[] = [];
  baseConvertString: any[] = [];
  JoinConvertString: any[] = [];

  rowData: any[] = [];

  options: any[] = [];
  // dragData:any[]=[];
  NumberictypeMapping: { [key: string]: string } = {
    int: "number",
    int64: "number",
    float32: "number",
    float64: "number",
  };
  name: any = "name";
  values: any = "field_name";
  select: any[] = [];
  newcustomfield: any[] = [];
  opt: any;
  valueProp: any = "value";
  labelProp: any = "model_name";
  onValueChangeUpdate: any;
  label: any;
  selected: any[] = [];
  dropdownList: any[] = [];
  currentField: any;
  selectedColumns: any[] = [];
  grp: any[] = [];
  subGrp: any[] = [];
  subGrpflag: any[] = [];
  filterindex: any[] = [];
  flag: any[] = [];
  field: any[] = [];
  value_type: any[] = [];
  operator: any[] = [];
  operatorOptions: any[][] = [];
  orbitalValue: any[] = [];
  orbitalOptions: any[] = [];
  inputflag: any[] = [];
  anotherfield: any[] = [];

  button_Flag: boolean = false;
  id:any=null
  constructor(
    public dataService: DataService,
    public dialogService: DialogService,
    public formBuilder: FormBuilder,
    public route:ActivatedRoute,
    private router:Router,
    private resolver:ComponentFactoryResolver,
    private viewcontiner:ViewContainerRef
  ) {
  this.route.params.subscribe((params:any)=>{
    console.log(params);
    
    if(params['id']){
      this.dataService.getDataById("dataset_config",params['id']).subscribe(async(res:any)=>{
        console.log(res);
        this.id = params['id'] || null
        let data:any=res.data[0]
        let allCollection_Name:any[]=[]
        this.dataSet.get('dataSetName')?.setValue(data.dataSetName);
        this.dataSet.get('dataSetDescription')?.setValue(data.dataSetDescription);
        this.dataSet.get('dataSetBaseCollection')?.setValue(data.dataSetBaseCollection);
        this.dataSet.get("dataSetBaseCollectionFilter")?.setValue(data.datasetbasecollectionfilter)
        allCollection_Name.push(data.dataSetBaseCollection)
        let FilterParams:any []= data.FilterParams
//         // let FilterParamsControl:any[]=[]
        if(!_.isEmpty(FilterParams)){
        FilterParams.forEach((val:any,index:any) => {         
          this.dataSet.get('FilterParams')?.push(this.updateQueryParmsVAlue(val));
          this.parmsConvertIntoString('Param','parmasName',index,true)
        });
      }
      let dataSetJoinCollection:any []= data?.dataSetJoinCollection
//       // let FilterParamsControl:any[]=[]
      if(!_.isEmpty(dataSetJoinCollection)){
        dataSetJoinCollection.forEach((val:any) => { 
          allCollection_Name.push(val.toCollection)        
        this.dataSet.get('dataSetJoinCollection')?.push(this.updateVAlueJoinCollection(val));
      });
    }
    let CustomColumn:any []= data.CustomColumn
    // let FilterParamsControl:any[]=[]
    if(!_.isEmpty(CustomColumn)){
      CustomColumn.forEach((val:any) => {         
      this.dataSet.get('CustomColumn')?.push(this.updateVAluecustomfield(val));
    });
  }
  let Aggregation:any []= data.Aggregation
  // let FilterParamsControl:any[]=[]
  if(!_.isEmpty(Aggregation)){
    Aggregation.forEach((val:any) => {         
    this.dataSet.get('Aggregation')?.push(this.updateVAlueAggregatefield(val));
  });
}
let SelectedList:any []= data.SelectedList
// let FilterParamsControl:any[]=[]
if(!_.isEmpty(SelectedList)){
  // Aggregation.forEach((data:any) => {         
    this.SelctedColumns=SelectedList
  this.dataSet.get('SelectedList')?.setValue(SelectedList);
// });
}
// allCollection_Name.push(data.toCollection)        
console.warn(allCollection_Name);
this.fromcollectionList=allCollection_Name;
this.ModelCloumnConfig(allCollection_Name).then(async (modelConfig: any) => {
  // let vals:any=Object.create( await data)
  // this.dragData=vals
  console.error(modelConfig);
  
   this.options = modelConfig;
  console.log(data);
  // setTimeout(() => {
    this.editgrp(data.Filter)
  // }, 1000);

  // this.newcustomfield.forEach((newColumn) => {
  //   if (!this.options.includes(newColumn)) {
  //     this.options.push(newColumn);
  //   }
  });
console.log(this.dataSet.value);

this.NameChange()
        // this.CustomColumn("FilterParams").push(FilterParamsControl);

        // this.dataSet = this.formBuilder.group({
        //   dataSetName: [data.dataSetName, [Validators.required, Validators.minLength(3)]],
        //   dataSetDescription: [data.dataSetDescription],
        //   dataSetBaseCollection: [data.dataSetBaseCollection, [Validators.required]],
        //   dataSetBaseCollectionFilter: [data.dataSetBaseCollectionFilter],
        //   dataSetJoinCollection: this.formBuilder.array([data.dataSetJoinCollection]),
        //   CustomColumn: this.formBuilder.array([data.CustomColumn]),
        //   Aggregation: this.formBuilder.array([data.Aggregation]),
        //   SelectedList: [[data.SelectedList]],
        //   FilterParams: this.formBuilder.array([data.FilterParams]),
        //   Filter: [data.Filter],
        // });
let filter = this.resolver.resolveComponentFactory(NgmodelComponent)
let comp =this.viewcontiner.createComponent(filter)
// comp.instance.

comp.instance.Action='edit' 
comp.instance.Collection=data.dataSetBaseCollection
comp.instance.Data={
  converted:data.datasetbasecollectionfilter
}
comp.instance.emit=true
this.baseConvertString = comp.instance.grp
console.log(this.baseConvertString);
setTimeout(() => {
// comp.destroy()
console.log("AFTER DESTROY",comp);
this.viewcontiner.clear()
}, 4000);
// comp.instance.onClose=this.closefilter($event)
// let old_data = comp.instance.editgrp(data.Filter)
// console.warn(await old_data);

      })
    }
  })
    // ! Collection Name
    var filterCondition1 = {
      filter: [
        {
          clause: "AND",
          conditions: [
            { column: "is_collection", operator: "EQUALS", value: "Yes" },
          ],
        },
      ],
    };
    this.dataService.getDataByFilter("model_config", filterCondition1).subscribe((res: any) => {
        this.selected = res.data[0].response.map((response: any) => {
          return {
            model_name: response.model_name
              .replace(/_/g, " ")
              .toUpperCase()
              .replace(/_/g, " "),
            value: response.collection_name,
          };
        });
        if(this.route.snapshot.paramMap.has('id')){
          
         const data = this.selected.filter(response => response.value == this.dataSet.get('dataSetBaseCollection').value)
         console.warn("dataSetBaseCollection",data);
         this.valuechange(data[0])
        }

      });

    // ! Aggregate FN

    var filterCondition1 = {
      filter: [
        {
          clause: "AND",
          conditions: [
            {
              column: "type",
              operator: "EQUALS",
              value: "Aggregation_Function",
            },
          ],
        },
      ],
    };
    this.dataService.getDataByFilter("Schematic_Data", filterCondition1).subscribe((res: any) => {
        this.aggFn = res.data[0].response;
      });

    var filterCondition1 = {
      filter: [
        {
          clause: "AND",
          conditions: [
            { column: "type", operator: "EQUALS", value: "Custom_Function" },
          ],
        },
      ],
    };
    this.dataService.getDataByFilter("Schematic_Data", filterCondition1).subscribe((res: any) => {
        this.custom_columns_fn = res.data[0].response;
      });

  }

updateQueryParmsVAlue(value:any){
 return this.formBuilder.group({
    convert_To_String: [value.convert_To_String],
    parmasName: [value.parmasName, [Validators.required]],
    parmsDataType: [value.parmsDataType, [Validators.required]],
    defaultValue: [value.defaultValue, [Validators.required]],
  });
}

updateVAlueJoinCollection(value:any) {
  return this.formBuilder.group({
    convert_To_String: [value.convert_To_String],
    fromCollection: [value.fromCollection, [Validators.required]],
    fromCollectionField: [value.fromCollectionField, [Validators.required]],
    toCollection: [value.toCollection, [Validators.required]],
    toCollectionField: [value.toCollectionField, [Validators.required]],
  });
}

updateVAlueAggregatefield(value:any) {
  return this.formBuilder.group({
    convert_To_String: [value.convert_To_String],
    Agg_Column_Name: [value.Agg_Column_Name, [Validators.required]],
    Agg_Field_Name: [value.Agg_Field_Name, [Validators.required]],
    Agg_Fn_Name: [value.Agg_Fn_Name, [Validators.required]],
    Agg_group_byField: [value.Agg_group_byField, [Validators.required]],
  });
}


// async editgrp(data: any,ctrl?:any) {
//   console.log(data);
// debugger
//   let filter: any = data;
//   const overallcondition: any[] = await this.converRawdataintoArray(filter);
//   console.log(overallcondition);
//   overallcondition.forEach(async (parentFilter: any, parentIndex: any) => {
//     if (parentFilter.clause !== undefined) {
//       await this.Parent_Conditons(true, parentFilter.clause, parentIndex);
//     }

//     this.field[parentIndex] = [];
//     this.operator[parentIndex] = [];
//     this.orbitalValue[parentIndex] = [];
//     this.value_type[parentIndex] = [];
//     this.anotherfield[parentIndex] = []; 
//     parentFilter.conditions.forEach(async (ChildValues: any, childIndex: any) => {
//     console.log(childIndex);

//       if (ChildValues !== undefined) {
//         // Initialize arrays
//         this.field[parentIndex][childIndex] = [];
//         this.operator[parentIndex][childIndex] = [];
//         this.orbitalValue[parentIndex][childIndex] = [];
//         this.value_type[parentIndex][childIndex] = [];
//         this.anotherfield[parentIndex][childIndex] = [];
//         // console.warn(this);
//         // console.warn(ctrl);
        
//         if (this.grp[parentIndex][childIndex]?.flag === undefined) {
//           this.addgrp(parentIndex, childIndex);
//         }
//         // console.warn("THIS",this);

//         const filteredOption = this.options.find((res: any) => res.field_name === ChildValues.column);
//         // console.warn("filteredOption",filteredOption);
//         // console.error(_.cloneDeep(this.options));
        
//         if (filteredOption) {
//           this.setflag(filteredOption, parentIndex, childIndex);
//           this.getOperators(filteredOption, parentIndex, childIndex);
//           this.button_Flag = true;

//           const filteredOperatorOption = this.operatorOptions[parentIndex][childIndex].find(
//             (resOperator: any) => resOperator.value.toLowerCase() === ChildValues.operator.toLowerCase()
//           );
//             console.warn("filteredOperatorOption",filteredOperatorOption);
            
//           if (filteredOperatorOption) {
//             this.opertorchange(filteredOperatorOption, parentIndex, childIndex);
//             this.field[parentIndex][childIndex] = filteredOption;
//             this.operator[parentIndex][childIndex] = filteredOperatorOption;
//             this.value_type[parentIndex][childIndex] = ChildValues.value_type;
//             let value_type: any = this.value_type[parentIndex][childIndex];
//             console.warn("value_type",this);

//             if (
//               filteredOption.type === "time.Time" &&
//               value_type == "constant" &&
//               filteredOperatorOption.type === "time.Time"
//             ) {
//               if (
//                 (filteredOperatorOption.value == "in_between" ||
//                   filteredOperatorOption.value == "between_age") && // ! this used for the value from another input box
//                 filteredOperatorOption.anotherfield == true
//               ) {
//                 this.orbitalValue[parentIndex][childIndex] = ChildValues.value[0];
//                 this.anotherfield[parentIndex][childIndex] = ChildValues.value[1];
//               } else {
//                 this.orbitalValue[parentIndex][childIndex] = ChildValues.value;
//               }
//             } else {
//               if (filteredOperatorOption.anotherfield == true && filteredOperatorOption.value == "in_between") {
//                 this.orbitalValue[parentIndex][childIndex] = ChildValues.value[0];
//                 this.anotherfield[parentIndex][childIndex] = ChildValues.value[1];
//               } else {
//                 // if (value_type === "filter_Paramas") {
//                 //   this.orbitalValue[parentIndex][childIndex] = ChildValues.value;
//                 //   console.log(this.orbitalValue);
                  
//                 // } else {
//                   this.orbitalValue[parentIndex][childIndex] = ChildValues.value;
//                 // }
//               }
//             }
//             console.warn("convertdata_into_string",this);

//             this.convertdata_into_string(parentIndex, childIndex);
//           }
//         }
//       }
//     });
//   });
// }


async editgrp(data: any) {
  console.log(data);
  debugger;
  let filter: any = data;
  const overallCondition: any[] = await this.convertRawdataintoArray(filter);
  console.log(overallCondition);

  for (let parentIndex = 0; parentIndex < overallCondition.length; parentIndex++) {
    const parentFilter = overallCondition[parentIndex];

    if (parentFilter.clause !== undefined) {
      await this.Parent_Conditons(true, parentFilter.clause, parentIndex);
    }

    this.field[parentIndex] = [];
    this.operator[parentIndex] = [];
    this.orbitalValue[parentIndex] = [];
    this.value_type[parentIndex] = [];
    this.anotherfield[parentIndex] = [];

    for (let childIndex = 0; childIndex < parentFilter.conditions.length; childIndex++) {
      const childValues = parentFilter.conditions[childIndex];

      console.log(childIndex);

      if (childValues !== undefined) {
        // Initialize arrays
        this.field[parentIndex][childIndex] = [];
        this.operator[parentIndex][childIndex] = [];
        this.orbitalValue[parentIndex][childIndex] = [];
        this.value_type[parentIndex][childIndex] = [];
        this.anotherfield[parentIndex][childIndex] = [];

        if (this.grp[parentIndex][childIndex]?.flag === undefined) {
          this.addgrp(parentIndex, childIndex);
        }

        const filteredOption = this.options.find((res: any) => res.field_name === childValues.column);

        if (filteredOption) {
          this.setflag(filteredOption, parentIndex, childIndex);
          this.getOperators(filteredOption, parentIndex, childIndex);
          this.button_Flag = true;

          const filteredOperatorOption = this.operatorOptions[parentIndex][childIndex].find(
            (resOperator: any) => resOperator.value.toLowerCase() === childValues.operator.toLowerCase()
          );

          // console.warn("filteredOperatorOption", filteredOperatorOption);

          if (filteredOperatorOption) {
            this.opertorchange(filteredOperatorOption, parentIndex, childIndex);
            this.field[parentIndex][childIndex] = filteredOption;
            this.operator[parentIndex][childIndex] = filteredOperatorOption;
            this.value_type[parentIndex][childIndex] = childValues.value_type;
            let value_type: any = this.value_type[parentIndex][childIndex];

            if (filteredOption.type === "time.Time" && value_type == "constant" && filteredOperatorOption.type === "time.Time") {
              if ((filteredOperatorOption.value == "in_between" || filteredOperatorOption.value == "between_age") && // ! this used for the value from another input box
                filteredOperatorOption.anotherfield == true) {
                this.orbitalValue[parentIndex][childIndex] = childValues.value[0];
                this.anotherfield[parentIndex][childIndex] = childValues.value[1];
              } else {
                this.orbitalValue[parentIndex][childIndex] = childValues.value;
              }
            } else {
              if (filteredOperatorOption.anotherfield == true && filteredOperatorOption.value == "in_between") {
                this.orbitalValue[parentIndex][childIndex] = childValues.value[0];
                this.anotherfield[parentIndex][childIndex] = childValues.value[1];
              } else {
                this.orbitalValue[parentIndex][childIndex] = childValues.value;
              }
            }

            // console.warn("convertdata_into_string", this);

            this.convertdata_into_string(parentIndex, childIndex);
          }
        }
      }
    }
  }
}

 
async   convertRawdataintoArray(filter: any): Promise<any> {
  return new Promise(async (resolve, reject) => {
    let final: any[] = [];
    let arr: any[] = [];
    let parentFilter: any;

    for (let index = 0; index < filter?.length; index++) {
      const element = filter[index];
      const clonedElement = { ...element };
      parentFilter = { ...clonedElement };
      parentFilter.condition = [];

      for (let conditionIndex = 0; conditionIndex < clonedElement?.conditions?.length; conditionIndex++) {
        const condition = clonedElement.conditions[conditionIndex];
        console.warn(clonedElement.conditions[conditionIndex]);
        
        if (condition?.conditions) {
          console.log("INSIDE",condition?.conditions);
          
          arr.push(... (await this.convertRawdataintoArray(condition)));
        } else {
          parentFilter.condition.push(condition);
        }
      }
      final.push(parentFilter);
      console.log("final",final);
      
    }

    if (!_.isEmpty(arr)) {
      arr.forEach((xyz: any) => {
        final.push(xyz);
      });
    }

    resolve(final);
  });
}
updateVAluecustomfield(value:any) {
  return this.formBuilder.group({
    convert_To_String: [value.convert_To_String],
    dataSetCustomColumnName: [value.dataSetCustomColumnName, [Validators.required]],
    dataSetCustomLabelName: [value.dataSetCustomLabelName, [Validators.required]],
    dataSetCustomAggregateFnName: [value.dataSetCustomAggregateFnName, [Validators.required]],
    dataSetCustomField: [value.dataSetCustomField, [Validators.required]],
  });
}
  //? The Raw Form Control
  QueryParms() {
    return this.formBuilder.group({
      convert_To_String: [false],
      parmasName: ["", [Validators.required]],
      parmsDataType: ["", [Validators.required]],
      defaultValue: ["", [Validators.required]],
    });
  }

  JoinCollection() {
    return this.formBuilder.group({
      convert_To_String: [false],
      fromCollection: ["", [Validators.required]],
      fromCollectionField: ["", [Validators.required]],
      toCollection: ["", [Validators.required]],
      toCollectionField: ["", [Validators.required]],
    });
  }

  Aggregatefield() {
    return this.formBuilder.group({
      convert_To_String: [false],
      Agg_Column_Name: ["", [Validators.required]],
      Agg_Field_Name: ["", [Validators.required]],
      Agg_Fn_Name: ["", [Validators.required]],
      Agg_group_byField: ["", [Validators.required]],
    });
  }

  customfield() {
    return this.formBuilder.group({
      convert_To_String: [false],
      dataSetCustomColumnName: [, [Validators.required]],
      dataSetCustomLabelName: [, [Validators.required]],
      dataSetCustomAggregateFnName: [, [Validators.required]],
      dataSetCustomField: [, [Validators.required]],
    });
  }
  //? The Add/Edit/Delete Form Control

  CustomLabelFieldArr(index: any): FormArray {
    const customColumnArray: any = <FormArray>(
      this.dataSet.get("CustomColumn").controls
    );
    const customFieldArray: any = <FormArray>(
      customColumnArray.at(index).get("dataSetCustomField")
    );
    return customFieldArray;
  }
  deleteCustomColumn(key: any, index: any, oldValue?: any) {
    this.CustomColumn(key).removeAt(index);

    let data = {
      field_name: oldValue?.dataSetCustomColumnName,
      name: oldValue?.dataSetCustomLabelName,
      type: "",
      fieldtype: "Custom_Field",
    };

    const newcustomfieldindex = this.newcustomfield.findIndex(
      (item) =>
        item.field_name === data.field_name &&
        item.name === data.name &&
        item.fieldtype === data.fieldtype
    );

    if (newcustomfieldindex !== -1) {
      this.newcustomfield.splice(newcustomfieldindex, 1);
    }
    const deleteCustom_in_options = this.options.findIndex(
      (item) =>
        item.field_name === data.field_name &&
        item.name === data.name &&
        item.fieldtype === data.fieldtype
    );

    if (deleteCustom_in_options !== -1) {
      this.options.splice(deleteCustom_in_options, 1);
    }
  }

  deleteAggColumn(key: any, index: any, oldValue?: any) {
    this.CustomColumn(key).removeAt(index);
    let data = {
      field_name: oldValue?.Agg_Column_Name,
      name: oldValue?.Agg_Column_Name,
      type: "",
      fieldtype: "Aggregation_Field",
    };

    const newcustomfieldindex = this.newcustomfield.findIndex(
      (item) =>
        item.field_name === data.field_name &&
        item.name === data.name &&
        item.fieldtype === data.fieldtype
    );

    if (newcustomfieldindex !== -1) {
      this.newcustomfield.splice(newcustomfieldindex, 1);
    }

    const deleteAgg_in_options = this.options.findIndex(
      (item) =>
        item.field_name === data.field_name &&
        item.name === data.name &&
        item.fieldtype === data.fieldtype
    );

    if (deleteAgg_in_options !== -1) {
      this.options.splice(deleteAgg_in_options, 1);
    }
  }

  deleteFilterColumn(key: any, index: any, oldValue?: any) {
    this.CustomColumn(key).removeAt(index);
    let data: any = {
      ParamsName: "{{" + oldValue?.parmasName + "}}",
      parmsDataType: oldValue?.parmsDataType,
    };
    console.log(data);
    const filterIndex = this.filterParms.findIndex(
      (item) =>
        item.ParamsName === data.ParamsName &&
        item.parmsDataType === data.parmsDataType
    );

    if (filterIndex !== -1) {
      this.filterParms.splice(filterIndex, 1);
    }else{
      this.filterParms.splice(index, 1);

    }
  }

  CustomColumn(key: any): FormArray {
    return <FormArray>this.dataSet.get(key);
  }

  get_Index_Of_Parent_form(Index: number): FormArray {
    return <FormArray>(
      this.CustomColumn("CustomColumn").at(Index).get("dataSetCustomField")
    );
  }

  to_read_the_flag(key: any, index: any) {
    const customColumnArray: any = <FormArray>this.dataSet.get(key).controls;
    const StringFlag: any = customColumnArray
      .at(index)
      .get("convert_To_String").value;
    return StringFlag;
  }

  addCustomelabelfield(CustomFieldIndex: number) {
    const parentFormArray = this.get_Index_Of_Parent_form(CustomFieldIndex);
    parentFormArray.push(this.addCustomField());
  }

  addCustomField() {
    return this.formBuilder.control("", [Validators.required]);
  }
  // ?check ing based on Operator
  aggfunctionChange(rawValue: any) {
    if (rawValue.dataType == "Numberic") {
      // let data: any = this.options.map((value: any) => {
      //   if ((value.type in this.NumberictypeMapping)) {
      //     return value
      //   }
      // });
      let data: any = this.options.filter((value: any) => {
        return value.type in this.NumberictypeMapping;
      });

      // console.log(data);
      this.custom_columns_select = data;
    } else if (rawValue.dataType == "string") {
      let data: any = this.options.filter((value: any) => {
        return value.type == "string";
      });
      this.custom_columns_select = data;
    } else {
      this.custom_columns_select = this.options;
    }
  }

  CustomColum(rawValue: any) {
    console.log(this.custom_columns_fn);
    
    if (rawValue.dataType == "Numberic") {
      // let data: any = this.options.map((value: any) => {
      //   if ((value.type in this.NumberictypeMapping)) {
      //     return value
      //   }
      // });
      let data: any = this.options.filter((value: any) => {
        return value.type in this.NumberictypeMapping;
      });
      console.log(data);

      this.select = data;
    } else if (rawValue.dataType == "string") {
      let data: any = this.options.filter((value: any) => {
        return value.type == "string";
      });
      console.log(data);

      this.select = data;
    } else {
      this.select = this.options;
    }
  }

  AddFilterParams() {
    const length = this.CustomColumn("FilterParams").length - 1;
    if (length == -1) {
      this.CustomColumn("FilterParams").push(this.QueryParms());
      return;
    }
    if (this.CustomColumn("FilterParams").at(length).valid) {
      this.CustomColumn("FilterParams").push(this.QueryParms());
    } else {
      this.dialogService.openSnackBar("Missing Required Field ", "OK");
    }
  }

  addCustomColumn() {
    if (!this.dataSet.get("dataSetBaseCollection").value)
      return this.dialogService.openSnackBar(
        "Select the Base Collection",
        "OK"
      );
    const length = this.CustomColumn("CustomColumn").length - 1;
    if (length == -1) {
      this.CustomColumn("CustomColumn").push(this.customfield());
      return;
    }
    if (this.CustomColumn("CustomColumn").at(length).valid) {
      this.CustomColumn("CustomColumn").push(this.customfield());
    } else {
      this.dialogService.openSnackBar("Missing Required Field ", "OK");
    }
  }

  addAggregation() {
    if (!this.dataSet.get("dataSetBaseCollection").value)
      return this.dialogService.openSnackBar(
        "Select the Base Collection",
        "OK"
      );

    const length = this.CustomColumn("Aggregation").length - 1;
    if (length == -1) {
      this.CustomColumn("Aggregation").push(this.Aggregatefield());
      return;
    }
    if (this.CustomColumn("Aggregation").at(length).valid) {
      this.CustomColumn("Aggregation").push(this.Aggregatefield());
    } else {
      this.dialogService.openSnackBar("Missing Required Field ", "OK");
    }
  }

  DeleteJoinColletion(key: any, index: any, valueOfTOColletion: any) {
    let totalValues: any = this.dataSet.value[key];
    totalValues.forEach((element: any, joinIndex: any) => {
      if (
        element.fromCollection == valueOfTOColletion 
                          ||
        element.toCollection == valueOfTOColletion
      ) {
        this.CustomColumn(key).removeAt(joinIndex);
        console.log("removed index", joinIndex);
        this.JoinConvertString.splice(joinIndex, 1);
        if (
          this.dataSet.value.dataSetBaseCollection !== element.fromCollection
        ) {
          this.DeleteJoinColletion(key, 0, element.fromCollection);
        }
        this.DeleteJoinColletion(key, joinIndex, valueOfTOColletion);
      }
    });
  }

  NameChange() {
    const removedData: any[] = [];
    this.fromcollectionList.push(this.dataSet.value.dataSetBaseCollection);
    let totalValues: any = this.dataSet.value["dataSetJoinCollection"];
    totalValues.forEach((element: any) => {
      if (this.fromcollectionList.includes(element.fromCollection)) {
        this.fromcollectionList.push(element.fromCollection);
      }
      if (this.tocollectionList.includes(element.tocollectionList)) {
        this.toCollection.push(element.toCollection);
      }
    });
    //   this.fromcollectionList.map((response: any) => {
    // //    if (response.value !== valueOfTOColletion) {
    // //     removedData.push(response)
    // //    }
    //  });
    //  if(this.fr)
    this.selected.forEach((values: any) => {
      //    if (values.value == valueOfTOColletion) {
      //      this.tocollectionList.push(values)
      //        }
    });
    this.fromcollectionList = removedData;
  }

  // DeleteJoinColletion(key: any, index: any, valueOfTOColletion: any) {
  //   let totalValues: any = this.dataSet.value[key];

  //   for (let joinIndex = totalValues.length - 1; joinIndex >= 0; joinIndex--) {
  //     const element = totalValues[joinIndex];

  //     if (element.fromCollection === valueOfTOColletion || element.toCollection === valueOfTOColletion) {
  //       if (this.dataSet.value.dataSetBaseCollection !== element.fromCollection) {
  //         // this.DeleteJoinColletion(key, 0, element.fromCollection);
  //       }

  //       this.CustomColumn(key).removeAt(joinIndex);
  //       this.JoinConvertString.splice(joinIndex, 1);

  //       this.fromcollectionList = this.fromcollectionList.filter((response: any) => response.value !== valueOfTOColletion);

  //       this.selected.forEach((values: any) => {
  //         if (values.value === valueOfTOColletion) {
  //           this.tocollectionList.push(values);
  //         }
  //       });
  //     }
  //   }
  // }
  // !NEED TO DO THIS
  //   DeleteJoinColletion(key:any,index: any,valueOfTOColletion: any){

  //     let totalValues:any=this.CustomColumn(key).value
  //     totalValues.forEach((element:any,joinIndex:any) => {
  //       if(element.fromCollection==valueOfTOColletion || element.toCollection==valueOfTOColletion){
  //                 if (this.dataSet.value.dataSetBaseCollection !== element.fromCollection) {
  //                   this.DeleteJoinColletion(key,0,element.fromCollection)
  //                 }

  //     this.deleteSubsequentChild(key,valueOfTOColletion,joinIndex)
  //       }
  //     });
  // }

  //   deleteSubsequentChild(key:any,JoinTocollectionVAlue:any,DeletedIndex:any){
  //     this.CustomColumn(key).removeAt(DeletedIndex);
  //     this.JoinConvertString.splice(DeletedIndex,1)
  //     const removedData :any[]=[]
  //  this.fromcollectionList.map((response: any) => {
  //   if (response.value !== JoinTocollectionVAlue) {
  // removedData.push(response)
  //   }
  // });

  // this.selected.forEach((values:any)=>{
  //   if (values.value == JoinTocollectionVAlue) {
  // this.tocollectionList.push(values)
  //       }
  // })
  // this.fromcollectionList = removedData;
  //   }

  Parent_Conditons(flag: any, vals: any, index: any) {
    debugger;
    if (flag == true) {
      this.grp.push([{ flag: true, operator: vals }]);
      this.field.push([]);
      this.value_type.push([]);
      this.operator.push([]);
      this.orbitalValue.push([]);
      this.orbitalOptions.push([]);
      this.operatorOptions.push([]);
      this.flag.push([]);
      this.anotherfield.push([]);
      this.inputflag.push([]);
    } else {
      this.grp[index].push({
        flag: true,
        operator: this.grp[index][0].operator,
      });
    }
  }

  // ! aggridStructurePurely for Aggrid
  aggridStructure: any[] = [];
  // configAgridFlag:any=true;
  gridApi!: GridApi;
  private gridColumnApi!: ColumnApi;

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;

    // const allColumnIds: string[] = [];
    // this.gridColumnApi.getColumns()!.forEach((column:any) => {
    //   console.log(column);

    //   allColumnIds.push(column.getId());
    // });
    // this.gridColumnApi.autoSizeColumns(allColumnIds, true);

    // this.gridColumnApi.autoSizeAllColumns(false)
    // this.gridColumnApi.suppressAutoSize()
  }

  closePreview() {
    // this.configAgridFlag=false;
    this.dialogService.closeModal();
  }

  filterParms: any[] = [];
  // ! VAlidatethe FIlter Parms DAta
  validateDataType(DataType: any, defaultValue: any) {
    let isValid = false;
    let message: any;
    switch (DataType) {
      case "string":
        if (typeof defaultValue === "string") {
          isValid = true;
        }
        break;
      case "int" ||  "int64" || "float32" ||  "float64"   :
        if (!isNaN(Number(defaultValue))) {
          isValid = true;
          defaultValue = Number(defaultValue)
        }
        break;
      case "boolean":
        if (defaultValue == "true" || defaultValue == "false" || _.isBoolean(defaultValue)) {
          isValid = true;
          defaultValue = Boolean(defaultValue)

        }
        break;
      case "time.Time":
        if (!isNaN(new Date(defaultValue).getTime())) {
          isValid = true;
          defaultValue = moment(defaultValue)

        }
        break;
      default:
        return false; // Unrecognized data type
    }
    message = `Expected data type is ${DataType}, received: ${typeof defaultValue}`;

    return { valid: isValid, message: message,value:defaultValue };
  }

  // Prams Converstion
  // todo DEfault VAlue OVerride accordig to the datatype
  parmsConvertIntoString(
    Param: any,
    keychange: any,
    index: any,
    stringConverterValue: any
  ) {
    let data: any = this.dataSet.value["FilterParams"][index];
    let dataType: any = data.parmsDataType;
    let defaultValue: any = data.defaultValue;

    const valid: any = this.validateDataType(dataType, defaultValue);
    console.log(valid);
    defaultValue=valid.value || data.defaultValue
    if (!valid.valid)
      return this.dialogService.openSnackBar(valid.message, "OK");
    const FilterParams: any = this.dataSet.get("FilterParams").controls as FormArray;
    let present_Value: any = FilterParams.at(index).get(keychange).value;
    let ChnagedParmsValue: any = `{{${Param}-${present_Value.replace(Param, "").replace("{{", "").replace("}}", "")} }}`;
    let regex = new RegExp(`{{${"Param"}-(.*?)}}`);
    let extractedString = present_Value.replace(regex, '$1').trim(); 

    this.parmsNotExist( this.dataSet.value["FilterParams"], keychange, ChnagedParmsValue ).then((Flag: any) => {
      if (!Flag){
        return this.dialogService.openSnackBar(
          "This Filter Params Name Aldready Exist",
          "OK"
        );
      }
      if (Flag == true) {
        FilterParams.at(index)
          .get("convert_To_String")
          .setValue(stringConverterValue);
        FilterParams.at(index).get(keychange).setValue(extractedString);
        FilterParams.at(index).get("defaultValue").setValue(defaultValue)
        let Paramdata: any = FilterParams.at(index).value;
        // ? TO push into filter so that we show it
        let data: any = {
          ParamsName: Paramdata.parmasName,
          parmsDataType: Paramdata.parmsDataType,
        };
        console.log(data);
        const filterIndex = this.filterParms.findIndex(
          (item) =>
            "{{"+ item.ParamsName + "}}" === data.ParamsName &&
            item.parmsDataType === data.parmsDataType
        );

        if (filterIndex !== -1) {
          this.filterParms.splice(filterIndex, 1);
        } else if (index != -1) {
          this.filterParms[index]=data
        } 
         else {
          this.filterParms.push(data);
        }
      }
    });
  }

  parmsNotExist( loopData: any, keyToCheck: any,  existingData: any ): Promise<any> {
    return new Promise((resolve, reject) => {
      let exists = false;
      if (loopData == undefined) resolve(true);
      loopData.forEach((element: any) => {
        if (element[keyToCheck] === existingData) {
          exists = true; // Set exists to true if existingData is found in loopData
        }
      });

      resolve(!exists); // Resolve with true if existingData doesn't exist in loopData, false otherwise
    });
  }

  ConvertintoString( ParentGroup: any, index: any, stringConverterValue: any, Child: any, ChildArray?: any, CustomColumnInsert?: any, oldValue?: any ) {
    const customColumnArray: any = this.dataSet.get(ParentGroup)
      .controls as FormArray;
    if (!customColumnArray.at(index).valid)
      return this.dialogService.openSnackBar("Error IN Missing Field", "OK");
    if (Child == true) {
      let data: any = customColumnArray.at(index).get(ChildArray).value;
      if (!data || data.length < 2) {
        this.dialogService.openSnackBar(
          "At least two fields must be selected",
          "OK"
        );
        return;
      } else if (!data[0] || !data[1]) {
        this.dialogService.openSnackBar(
          "At least two fields must not be empty",
          "OK"
        );
        return;
      }
    }
    if (CustomColumnInsert == true) {
      let CustomInsertColumn: any = customColumnArray.at(index).value;

      this.addFieldintoOptions(CustomInsertColumn);
    }

    if(ParentGroup == "FilterParams" && stringConverterValue == false){
      let paramform =customColumnArray.at(index)
    //  let value :any=  paramform.get('parmasName').value
    //  let ChnagedParmsValue: any = `{{${"Param"}-${value.replace("Param",'').replace("{{",'').replace("}}",'')} }}`;
    //  console.log(paramform.value);
    // //  ChnagedParmsValue = ChnagedParmsValue./
    //  let regex = new RegExp(`{{${"Param"}--(.*?)}}`);
    //   let extractedString = ChnagedParmsValue.replace(regex,'$1');
    //   paramform.get('parmasName').setValue(extractedString)
    let value: any = paramform.get('parmasName').value;
    // let ChnagedParmsValue: any = `{{${"Param"}-${value.replace("Param", '').replace("{{", '').replace("}}", '')}}`;
    console.log(paramform.value);
    //  ChnagedParmsValue = ChnagedParmsValue./
    let regex = new RegExp(`{{${"Param"}-(.*?)}}`);
    let extractedString = value.replace(regex, '$1').trim(); // Apply trim() here
    paramform.get('parmasName').setValue(extractedString);
    
    }
    customColumnArray.at(index).get("convert_To_String").setValue(stringConverterValue);

  }

  AggEdit(index: any, oldValue: any) {
    let data = {
      field_name: oldValue.Agg_Column_Name,
      name: oldValue.Agg_Column_Name,
      type: "",
      fieldtype: "Aggregation_Field",
    };

    const newcustomfieldindex = this.newcustomfield.findIndex(
      (item) =>
        item.field_name === data.field_name &&
        item.name === data.name &&
        item.fieldtype === data.fieldtype
    );

    if (newcustomfieldindex !== -1) {
      this.newcustomfield.splice(newcustomfieldindex, 1);
    }
    const Aggregation: any = this.dataSet.get("Aggregation")
      .controls as FormArray;
    if (!Aggregation.at(index).valid)
      return this.dialogService.openSnackBar("Error IN Missing Field", "OK");
    Aggregation.at(index).get("convert_To_String").setValue(false);
  }

  AggConvertIntoString( ParentGroup: any, index: any, stringConverterValue: any, newColumnInsert?: any,  oldValue?: any) {
    const customColumnArray: any = this.dataSet.get(ParentGroup).controls as FormArray;
    console.log(oldValue);

    if (!customColumnArray.at(index).valid)
      return this.dialogService.openSnackBar("Error IN Missing Field", "OK");

    if (newColumnInsert == true) {
      let newcolumn: any = customColumnArray.at(index).value;
      let data = {
        field_name: newcolumn.Agg_Column_Name,
        name: newcolumn.Agg_Column_Name,
        type: newcolumn.Agg_Field_Name.type,
        fieldtype: "Aggregation_Field",
      };
       
      if (!this.newcustomfield.includes(data) && !index) {
        this.newcustomfield.push(data);
      }
      if(this.newcustomfield[index] == data){
        this.newcustomfield[index] =data
      }

      const newcustomfieldindex = this.options.findIndex(
        (item) =>
          item.field_name === data.field_name &&
          item.name === data.name &&
          item.fieldtype === data.fieldtype
      );

      if (newcustomfieldindex == -1) {
        this.options.push(data);
      }
    }
    customColumnArray
      .at(index)
      .get("convert_To_String")
      .setValue(stringConverterValue);
  }

  // ! Add The Custom Field to The Dropdown of Option
  addFieldintoOptions(values: any,index?:any) {
    let data = {
      field_name: values.dataSetCustomColumnName,
      name: values.dataSetCustomLabelName,
      type: dataCheck(values.dataSetCustomAggregateFnName),
      fieldtype: "Custom_Field",
    };

    function dataCheck(type: string) {
      if(type.toLowerCase() == "CONCAT"){
        return "string"
      }  
      return "numeric"
    }

    // if (!this.newcustomfield.includes(data)&& !index) {
    //   this.newcustomfield.push(data);
    // }
    // if(this.newcustomfield[index] == data){
    //   this.newcustomfield[index] =data
      
    // }
    // //     if (!this.dragData.includes(data)) {
    // //   this.dragData.push(data);
    // // }

    // if (!this.options.includes(data)) {
    //   this.options.push(data);
    // }

    if (!this.newcustomfield.some(item => item.field_name === data.field_name && item.name === data.name) && !index) {
      this.newcustomfield.push(data);
    }
    
    if (this.newcustomfield[index]?.field_name === data.field_name || this.newcustomfield[index]?.name === data.name) {
      this.newcustomfield[index] = data;
    }
    
    if (!this.options.some(item => item.field_name === data.field_name && item.name === data.name)) {
      this.options.push(data);
    }
    
  }

  to_return_datadataSetJoinCollection(ParentGroup: any, index: any) {
    const customColumnArray: any = this.dataSet.get(ParentGroup) as FormArray;
    let data: any = customColumnArray.at(index).value;
    let formattedString: any;
    // formattedString = `From Collection Name :- ${data?.fromCollection}-- To Collection Name :-  ${data?.toCollection}-- From Collection Field :-  ${data?.fromCollectionField}-- To Collection Field :-  ${data?.toCollectionField}` ;

    formattedString = `Join Collection Between  :- [ ${data?.fromCollection.toUpperCase()} <--> ${data?.toCollection.toUpperCase()} ]   RefField :-[  ${data?.fromCollectionField.toUpperCase()}  <-->  ${data?.toCollectionField.toUpperCase()} ]`;
    return formattedString;
  }

  to_return_FilterParams(index: any) {
    const customColumnArray: any = this.dataSet.get(
      "FilterParams"
    ) as FormArray;
    let data: any = customColumnArray.at(index).value;
    let returnsad: any = data?.parmasName;
    let formattedString: any;
    formattedString = `Params Name :- ${data?.parmasName}-- params Data Type :-  ${data?.parmsDataType}-- Default Value :-  ${data?.defaultValue}`;
    return formattedString;
  }
  to_return_data(ParentGroup: any, index: any, Child: any) {
    const customColumnArray: any = this.dataSet.get(ParentGroup) as FormArray;
    let data: any = customColumnArray.at(index).value;

    let formattedString: any;
    if (Child == true) {
      formattedString = `Column Name:- ${data?.dataSetCustomColumnName}-- Label Name:-  ${data?.dataSetCustomLabelName}-- Function Name:-  ${data?.dataSetCustomAggregateFnName}--  Field 1 Name:-  ${data?.dataSetCustomField[0].name}-- Field 2 Name:-  ${data?.dataSetCustomField[1].name}`;
      if (data?.dataSetCustomField?.length > 2) {
        formattedString += ` --Remaining Field  ${
          data.dataSetCustomField.length - 2
        } more`;
      }
    } else {
      formattedString = `Column Name:- ${data?.Agg_Column_Name}-- Field Name:- ${data?.Agg_Field_Name["name"]}---- Aggregation Function :-  ${data?.Agg_Fn_Name}-- Group by :-  ${data?.Agg_group_byField["name"]}`;
    }
    return formattedString;
  }

  async valuechange(vals: any) {
    const data = this.selected.filter((response) => {
      return response.model_name !== vals.model_name;
    });
    this.fromcollectionList = [vals];
    // console.log(this.dropdownList);
    this.selectedColumns = [];
    this.tocollectionList = data;

    const datas: any = await this.ModelCloumnConfig(vals.value);
    // console.log(datas);
    // console.log(this.dragData);
    // // this.dragData=datas
    // this.dragData=Object.create( await datas)

    this.options = datas;
    this.newcustomfield.forEach((newColumn) => {
      // if (!this.dragData.includes(newColumn)) {
      //   this.dragData.push(newColumn);
      // }

      if (!this.options.includes(newColumn)) {
        this.options.push(newColumn);
      }
    });
  }

  //   ModelCloumnConfig(modelName:any,Recursive?:any,ParentName?:any): Promise<any> {
  //   return new Promise( (resolve, reject) => {
  //   let filterCondition :any
  // if(typeof(modelName)=="string"){
  //   filterCondition = {
  //     filter: [
  //       { clause: "AND",
  //         conditions: [{
  //             column: "model_name",
  //             operator: "EQUALS",
  //             value: modelName }
  //           ]
  //       }
  //         ]
  //   }

  // }else{
  //    filterCondition = {
  //     filter: [
  //       { clause: "AND",
  //         conditions: [
  //           {
  //             column: "model_name",
  //             operator: "IN",
  //             value: modelName,
  //           }
  //         ]
  //       }
  //     ]
  //   }}
  //   this.dataService.getDataByFilter("data_model", filterCondition).subscribe(  (res: any) => {
  //      let addtionalvalues: any[] = [];
  //       let values: any;
  //       values =  res.data[0].response.map((values: any) => {
  //         let field_name = values.json_field.toLowerCase();
  //           if(Recursive==true){
  //             return {
  //               name: ParentName.name.replace(/_/g, " ").toUpperCase().replace(/_/g, " ") +" : "+values.column_name.replace(/_/g, " ").toUpperCase().replace(/_/g, " "),
  //               field_name: ParentName.field_name+"."+field_name,
  //               parentCollectionName: ParentName.parentCollectionName,
  //               type: values.type,
  //             };
  //           }else{
  //             return {
  //               name: values.model_name.toUpperCase()+ "--"+values.column_name.replace(/_/g, " ").toUpperCase().replace(/_/g, " "),
  //               field_name: field_name,
  //               parentCollectionName: values.model_name,
  //               type: values.type,
  //             };
  //           }
  //       });
  //       values.forEach( (result: any) => {
  //         const typeMapping: { [key: string]: string } = {
  //           string: "string",
  //           int: "number",
  //           int64: "number",
  //           float32: "number",
  //           float64: "number",
  //           bool: "boolean",
  //           "time.Time": "Date",
  //         };
  //         const selectedTypes = result.type.replace("[", "").replace("]", "");
  //         if (!(selectedTypes in typeMapping)) {
  //           this.ModelCloumnConfig(selectedTypes,true,result).then((RecursiveData)=>{
  //               RecursiveData.forEach((element:any) => {
  //               addtionalvalues.push(element);
  //               });
  //           })
  //         } else {
  //           addtionalvalues.push(result);
  //         }
  //       });

  //       resolve( addtionalvalues);
  //     }
  //   );
  // })
  //   }

  ModelCloumnConfig(
    modelName: any,
    Recursive?: any,
    ParentName?: any
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      let filterCondition: any;
      filterCondition = {
        filter: [
          {
            clause: "AND",
            conditions: [
              {
                column: "model_name",
                operator: "EQUALS",
                value: modelName,
              },
            ],
          },
        ],
      };
      if (Array.isArray(modelName)) {
        filterCondition = {
          filter: [
            {
              clause: "AND",
              conditions: [
                {
                  column: "model_name",
                  operator: "IN",
                  value: modelName,
                },
              ],
            },
          ],
        };
      }
      this.dataService
        .getDataByFilter("data_model", filterCondition)
        .subscribe((res: any) => {
          let additionalValues: any[] = [];
          let values: any = res.data[0].response.map((value: any) => {
            let field_name = value.json_field.toLowerCase();
            if (Recursive == true) {
              return {
                name:
                  ParentName.name.replace(/_/g, " ").toUpperCase() +
                  " : " +
                  value.column_name.replace(/_/g, " ").toUpperCase(),
                field_name: ParentName.field_name + "." + field_name,
                parentCollectionName: ParentName.parentCollectionName,
                type: value.type,
              };
            } else {
              return {
                name:
                  value.model_name.toUpperCase() +
                  "--" +
                  value.column_name.replace(/_/g, " ").toUpperCase(),
                field_name: field_name,
                parentCollectionName: value.model_name,
                type: value.type,
              };
            }
          });
          const promises: Promise<any>[] = [];
          values.forEach((result: any) => {
            const typeMapping: { [key: string]: string } = {
              string: "string",
              int: "number",
              int64: "number",
              float32: "number",
              float64: "number",
              bool: "boolean",
              "time.Time": "Date",
            };
            const selectedTypes = result.type.replace("[", "").replace("]", "");
            if (!(selectedTypes in typeMapping)) {
              promises.push(
                this.ModelCloumnConfig(selectedTypes, true, result).then(
                  (RecursiveData: any) => {
                    RecursiveData.forEach((element: any) => {
                      additionalValues.push(element);
                    });
                  }
                )
              );
            } else {
              additionalValues.push(result);
            }
          });
          Promise.all(promises).then(() => {
            resolve(additionalValues);
          });
        });
    });
  }

  // ? SAVE FUNCTION
  saveJoinCollection(datas: any) {
    if (this.fromCollection == this.toCollection) {
      alert("From And To Collection Should be Same ");

      //  this.dialogService.openDialog("sdaaaaaa",'OK')
    } else {
      if (datas.formAction == "Add") {
        this.CustomColumn("dataSetJoinCollection").push(
          this.formBuilder.group({
            convert_To_String: [true],
            fromCollection: [this.fromCollection, [Validators.required]],
            fromCollectionField: [
              this.fromCollectionReference,
              [Validators.required],
            ],
            toCollection: [this.toCollection, [Validators.required]],
            toCollectionField: [
              this.toCollectionReference,
              [Validators.required],
            ],
            Filter: [],
          })
        );
        if (
          this.fromcollectionList.some(
            (response: any) => response.value === this.fromCollection
          )
        ) {
          const value = this.selected.find(
            (response) => response.value === this.toCollection
          );
          console.log(value);
          const index = this.tocollectionList.findIndex(
            (item) =>
              item.model_name === value.model_name && item.value === value.value
          );
          console.log(index);
          this.tocollectionList.splice(index, 1);
          console.log(this.selected);

          if (value) {
            this.fromcollectionList.push(value);
          }
        }

        let collection_name: any[] = this.fromcollectionList.map(
          (daata: any) => {
            return daata.value;
          }
        );
        console.log(collection_name);
        let Modeldata: any[];
        this.ModelCloumnConfig(collection_name).then(async (data: any) => {
          // console.log(data);
          // let vals:any=Object.create( await data)
          // this.dragData=vals
          this.options = data;
          this.newcustomfield.forEach((newColumn) => {
            // if (!this.dragData.includes(newColumn)) {
            //   this.dragData.push(newColumn);
            // }

            if (!this.options.includes(newColumn)) {
              this.options.push(newColumn);
            }
          });
        });
      } else {
        // ?  I f any thing change should to be done

        const customColumnArray: any = this.dataSet.get(
          "dataSetJoinCollection"
        ) as FormArray;
        customColumnArray.at(datas.index).get("convert_To_String").setValue(true);
        customColumnArray.at(datas.index).get("fromCollection").setValue(this.fromCollection);
        customColumnArray.at(datas.index).get("fromCollectionField").setValue(this.fromCollectionReference);
        customColumnArray.at(datas.index).get("toCollection").setValue(this.toCollection);
        customColumnArray.at(datas.index).get("toCollectionField").setValue(this.toCollectionReference);
        var collectionNameExist: any;

        this.fromcollectionList.filter((response: any) => {
          if (response.value == this.fromCollection) {
            collectionNameExist = true;
          }
        });
        console.log(collectionNameExist);

        if (collectionNameExist !== true) {
          const value = this.selected.filter((response) => {
            return response.value == this.toCollection;
          });

          this.fromcollectionList[datas.index] = value;

          let collection_name: any[] = this.fromcollectionList.map(
            (daata: any) => {
              return daata.value;
            }
          );
          this.ModelCloumnConfig(collection_name).then(async (data: any) => {
            // let vals:any=Object.create( await data)
            // this.dragData=vals
            this.options = data;
            this.newcustomfield.forEach((newColumn) => {
              if (!this.options.includes(newColumn)) {
                this.options.push(newColumn);
              }
            });
          });
        }
      }
      this.fromCollection = "";
      this.fromCollectionReference = "";
      this.toCollection = "";
      this.toCollectionReference = "";
      this.fromcollectionListID = [];
      this.tocollectionListID = [];
      this.dialogService.closeModal();
    }
  }

  Preview() {
    // this.SelctedColumns = [];
    let dataset: any = this.dataSet.value;
    dataset.Filter = [];
    if (!_.isEmpty(this.grp)) {
      dataset.Filter = this.savegrp();
    }
    dataset.SelectedList =this.SelctedColumns
    dataset.start = 0;
    dataset.end = 200;

    if (!this.dataSet.valid) {
      this.dataSet.markAllAsTouched();
      return this.dialogService.openSnackBar("Missing Required Field", "ok");
    }

    // this.dataService.dataSetPreview(dataset).subscribe((res:any)=>{
    //   console.log(res);
    //   this.configAgridFlag=true;

    //   this.rowData=res.data
    //   this.selectedColumns.forEach((respones:any)=>{
    //     let data={
    //         headerName: respones.name,
    //         field: respones.parentCollectionName+'.'+respones.field_name,
    //         hide: respones.hide ? respones.hide : false
    //       }

    //     this.aggridStructure.push(data)
    //       })

    //   this.dialogService.openDialog(this.preview, null,
    //     null,{})
    //    }
    //    )

    // this.fromcollectionList.forEach((collectionName: any) => {
    //   this.aggridStructure.push({
    //     headerName: collectionName.value.toUpperCase(),
    //     children: this.gridColumnReturnFn(
    //       this.options,
    //       collectionName.value
    //     ),
    //   });
    // });
    // let data = this.returnCustomColumns();

    // this.aggridStructure.push(
    //   {
    //     headerName: "CUSTOM COLUMN",
    //     children: data.customcolumn,
    //   },
    //   {
    //     headerName: "AGGREGATION COLUMN",
    //     children: data.aggcolumn,
    //   }
    // // );

    // const datasource = {
    //     getRows: async (params: any) => {
    //       dataset.start =  params.request.startRow;
    //       dataset.end = params.request.endRow;
    //           this.dataService.dataSetPreview(dataset).subscribe(async (xyz: any) => {
    //             console.log(xyz);
                
    //             this.gridApi.sizeColumnsToFit();
    //             if (await xyz) {
    //               if (xyz?.data[0]?.pagination[0].totalDocs !== undefined) {
    //                 params.successCallback(
    //                   xyz.data[0].response,
    //                   xyz.data[0].pagination[0].totalDocs
    //                 );
    //               } else {
    //                 params.successCallback(
    //                 [],0)
    //               }
    //             } else {
    //               params.successCallback(
    //                 [],0)
    //             }
    //           });
    //     },
    //   };
    //   this.gridApi.setServerSideDatasource(datasource);


    this.dataService.dataSetPreview(dataset).subscribe((res: any) => {
        console.log(res);
        // this.configAgridFlag = false;

        if (res && res.data) {
          console.log(res.data[0].response);

          this.rowData = res.data[0].response;
          // this.gridApi.setRowData(res.data);
          this.aggridStructure = [];
          if(_.isEmpty(this.SelctedColumns)){
          // ? with parent
          this.fromcollectionList.forEach((collectionName: any) => {
            this.aggridStructure.push({
              headerName: collectionName.value.toUpperCase(),
              children: this.gridColumnReturnFn(
                this.options,
                collectionName.value
              ),
            });
          });
          let data = this.returnCustomColumns();

          this.aggridStructure.push(
            {
              headerName: "CUSTOM COLUMN",
              children: data.customcolumn,
            },
            {
              headerName: "AGGREGATION COLUMN",
              children: data.aggcolumn,
            }
          );
          }else if(!_.isEmpty(this.SelctedColumns)){
            this.aggridStructure =this.SelctedColumns
          }
          // this.newcustomfield.forEach((fieldName:any)=>{
          //             if (fieldName.fieldtype=="Custom_Field") {
          //               this.aggridStructure.push(

          //                 {
          //                   headerName: fieldName.name,
          //                         field: fieldName.field_name ,
          //                         hide: false,
          //                         resizable: true
          //                       }

          //                         )
          //             }

          // })

          // ! with out parent
          // this.options.forEach((response: any,index:any) => {
          //   if (response) {
          //     console.log(response);
          //     let data :any
          //   if (response.fieldtype=="Custom_Field") {

          //    data= {
          //       headerName: response.name,
          //       field: response.field_name ,
          //       hide: false,
          //       resizable: true,
          //       cellDataType: 'text',
          //       editable: true

          //     };
          //   }
          //   else{
          //     data= {
          //       headerName: response.name,
          //       field: response.parentCollectionName !== dataset.dataSetBaseCollection ?  response.parentCollectionName + '.' + response.field_name :response.field_name ,
          //       // hide: response.hide ? response.hide : false,
          //       resizable: true ,              hide: false,
          //         cellDataType: 'number',
          //       editable: true
          //     };
          //   }

          //     this.aggridStructure.push(data);
          //   }
          // });

          console.log("sda", this.aggridStructure);

          this.dialogService.openDialog(this.previewGrid, null, null, {});
        } else {
          this.dialogService.openSnackBar("There was no data to display", "OK");
          return;
        }
      });
  }

  returnCustomColumns() {
    let customcolumn: any[] = [];
    let aggcolumn: any[] = [];
    this.newcustomfield.forEach((res: any) => {
      if (res.fieldtype == "Custom_Field") {
        customcolumn.push({
          headerName: res.name,
          field: res.field_name,
          resizable: true,
          hide: false,
        });
      } else {
        aggcolumn.push({
          headerName: res.name,
          field: res.field_name,
          resizable: true,
          hide: false,
        });
      }
    });
    return { customcolumn: customcolumn, aggcolumn: aggcolumn };
  }

  gridColumnReturnFn(data: any, key: any) {
    let totalvalue: any[] = [];
    data.forEach((filter: any) => {
      if (filter.parentCollectionName == key) {
        let data: any;
        console.log(filter.type);
        
        data = {
          headerName: filter.name,
          field:
            filter.parentCollectionName !==
            this.dataSet.value.dataSetBaseCollection
              ? filter.parentCollectionName + "." + filter.field_name
              : filter.field_name,
          resizable: true,
          hide: false,sortable:true,  filter: true
        };
        totalvalue.push(data);
      }
    });
    return totalvalue;
  }

  SelctedColumns: any[] = [];
  removeSelectedColumns(removeIndex: any) {
    this.SelctedColumns.splice(removeIndex, 1);
    this.dataSet.get("SelectedList").setValue(this.SelctedColumns);
  }

  SaveColumns() {
    let selected_Column: any[] = [];
    this.SelctedColumns = []
    let all_columns: any = this.gridColumnApi.getAllDisplayedColumns();
    if (_.isEmpty(all_columns))
      return this.dialogService.openSnackBar("Select Atleast One Column", "OK");
    all_columns.forEach((column: any) => {
      column.colDef;
      let data: any = {
        headerName: column.colDef.headerName,
        field: column.colDef.field,
      };
      this.SelctedColumns.push(data);
      selected_Column.push(data);
    });

    this.dataSet.get("SelectedList").setValue(selected_Column);
    this.dialogService.closeModal();
  }
  
  savedataSet() {
     console.log(this.gridApi);
    let dataset: any = this.dataSet.value;
    dataset.Filter = this.savegrp();
    if(_.isEmpty(dataset.SelectedList)){
this.dialogService.openSnackBar("Selected Column is Required","OK")
    }
    // ()
    // let selected_Column: any[] = [];
    // ? USING Column api To get only displa columns
    // let all_columns: any = this.gridColumnApi.getAllDisplayedColumns();
    // all_columns.forEach((column: any) => {
    //   column.colDef;
    //   let data: any = {
    //     headerName: column.colDef.headerName,
    //     field: column.colDef.field,
    //     resizable: true,
    //   };
    //   selected_Column.push(data);
    // });

    // ! To get all COlumns
    // let all_columns:any=this.gridApi.getColumnDefs();

    // all_columns.forEach((column :any)=>{

    // console.log(column);

    // let child :any = column.children
    //     child.forEach((respones:any)=>{
    //       console.log(respones);

    //       if(respones.hide==false||respones.hide==undefined){
    //         // return respones
    //         let data:any={
    //           headerName: respones.headerName,
    //           field: respones.field ,
    //           resizable: true
    //         }
    //         selected_Column.push(data)
    //       }
    //     })

    //   })

    // this.dataSet.get("SelectedList").setValue(selected_Column);

    // dataset.SelectedList = SelctedColumns;
    if (!this.dataSet.valid) {
      this.dataSet.markAllAsTouched();
      return this.dialogService.openSnackBar("Missing Required Field", "ok");
    }

     if(this.id!=null){
      this.dataService.dataSetupdate(this.id ||  dataset.dataSetName, dataset).subscribe((res: any) => {
        console.log(res);
        this.dialogService.openSnackBar(res.message,"OK");
        this.router.navigateByUrl("list/dataset")
      });
      return
   } 

   this.dataService.dataSetSave("Insert", dataset).subscribe((res: any) => {
    this.dialogService.openSnackBar(res.message,"OK");
    this.router.navigateByUrl("list/dataset")
  });
  }

  savegrp() {
    let overallcondition: any[] = [];
    let data= this.grp.filter(array => array.length > 0);
    for (let index = 0; index < data.length; index++) {
      const element1 = this.grp[index];
      let Condition: any[] = [];
      // if(element1.length<2) return this.dialogService.openSnackBar(`At least Two Condtion Must Present On" ${element1[0].operator}" Line On ${index} `,"OK")

      for (let i = 0; i < element1.length; i++) {
        let field: any = this.field[index][i];
        let operator: any = this.operator[index][i];
        let value_type: any = this.value_type[index][i];
        let value: any;
        if (field.type === "time.Time" && operator.type === "time.Time" && value_type=="constant") {
          if (
            (operator.value == "in_between" ||
              operator.value == "between_age") && // ! this used for the value from another input box
            operator.anotherfield == true
          ) {
            value = [moment(this.orbitalValue[index][i]).format(),moment(this.anotherfield[index][i]).format() ];
          } else {
            value =moment(this.orbitalValue[index][i]).format()
            // Assuming this.orbitalValue[index][i] contains the date string or timestamp
          }
        } else {
          if (operator.anotherfield == true && operator.value == "in_between") {
            if (operator.type in this.NumberictypeMapping) {
              value = [
                parseInt(this.orbitalValue[index][i]),
                parseInt(this.orbitalValue[index][i]),
              ];
            } else {
              value = [
                this.orbitalValue[index][i],
                this.anotherfield[index][i],
              ];
            }
          } else {
            if (operator.type in this.NumberictypeMapping) {
              value = parseInt(this.orbitalValue[index][i]);
            }else{
              value = this.orbitalValue[index][i];

            }
          }
        }
        if(value_type =="filter_Paramas"){
         value = this.orbitalValue[index][i];
        }
        const conditions = {
          column: field.field_name,
          operator: operator.value.toUpperCase(),
          parentCollectionName: field.parentCollectionName,
          type: operator.type,
          value_type: value_type,
          value: value,
        };
        Condition.push(conditions);
      }
      let filter: any = {
        clause: this.grp[index][0].operator,
        conditions: Condition,
      };
      overallcondition.push(filter);
    }
    let final: any[] = [];

    // for (let index = 0; index < overallcondition.length; index++) {
    //  const element = overallcondition[index];

    //  if (index === 0) {
    //    // Push the first element individually
    //    final.push(element);
    //  } else {
    //    // Push other elements into the condition of the first element
    //    if (!final[0].conditions) {
    //      final[0].conditions = [];
    //    }
    //    final[0].conditios.push(element);
    //  }
    // }
    overallcondition.forEach((element, index) => {
      if (index === 0) {
        // Push the first element individually
        final.push(element);
      } else {
        // Push other elements into the condition of the first element
        if (!final[0].conditions) {
          final[0].conditions = [];
        }
        final[0].conditions.push(element);
      }
    });

    return final;
  }

  Return_Join_collection_Present(index: any) {
    const customColumnArray: any = this.dataSet.get(
      "dataSetJoinCollection"
    ) as FormArray;
    const filterControl: any = customColumnArray?.at(index)?.get("Filter");
    if (filterControl?.value) {
      return true;
    } else {
      return false;
    }
  }

  close() {
    this.fromCollection = "";
    this.fromCollectionReference = "";
    this.toCollection = "";
    // this.toCollectionReference=''
  }

  async collectionNameChanges(values: any, flag: any) {
    if (flag == true) {
      this.fromcollectionListID = await this.ModelCloumnConfig(values);
    } else {
      this.tocollectionListID = await this.ModelCloumnConfig(values);
    }
  }

  // ! Pop Up Screen
  BaseCollectionFilter() {
    if (_.isEmpty(this.dataSet.value.dataSetBaseCollectionFilter)) {
      let data: any = {
        Action: "Add",
        alldata: {},
        pageHeading: "Base Collection Filter",
        mode: "base",
        Collection: this.dataSet.value.dataSetBaseCollection,
      };
      console.log("Base Collection",data);

      this.dialogService.openDialog(this.Filter, null, null, data);
    } else {
      let data: any = {
        Action: "Edit",
        alldata: {
          data: this.baseConvertString,
          converted: this.dataSet.value.dataSetBaseCollectionFilter,
        },
        pageHeading: "Base Collection Filter",
        mode: "base",
        Collection: this.dataSet.value.dataSetBaseCollection,
      };
      console.log("Base Collection",data);
      
      this.dialogService.openDialog(this.Filter, null, null, data);
    }
  }

  JoinCollectionFilter(index: any) {
    const customColumnArray: any = this.dataSet.get(
      "dataSetJoinCollection"
    ) as FormArray;
    let datas: any = customColumnArray.at(index).value;

    let data: any = {
      Action: "Add",
      index: index,
      pageHeading: "Join Collection Filter",
      mode: "join",
      Collection: datas.toCollection,
    };
    this.dialogService.openDialog(this.Filter, null, null, data);
  }
  JoinCollectionFilterEdit(index: any) {
    const customColumnArray: any = this.dataSet.get(
      "dataSetJoinCollection"
    ) as FormArray;
    let datas: any = customColumnArray.at(index).value;

    let data: any = {
      Action: "Edit",
      index: index,
      alldata: { data: this.JoinConvertString[index], converted: datas.Filter },
      pageHeading: "Join Collection Filter",
      mode: "join",
      Collection: datas.toCollection,
    };
    this.dialogService.openDialog(this.Filter, null, null, data);
  }
  // ? Emit From  Pop Up Screen
  closefilter(event: any, ref: any) {
    if (!event) return;
    if (ref.mode == "base") {
      this.dataSet.get("dataSetBaseCollectionFilter").setValue(event.final);
      this.baseConvertString = event.grp;
    } else if (ref.mode == "join") {
      this.JoinConvertString[ref.index] = [];
      const customColumnArray: any = this.dataSet.get(
        "dataSetJoinCollection"
      ) as FormArray;
      customColumnArray.at(ref.index).get("Filter").setValue(event.final);
      this.JoinConvertString[ref.index] = event.grp;
    }

    this.dialogService.closeModal();
  }

  setflag(vals: any, i: any, index: any) {
    // ! undo if need orbital value
    //   if (vals.reference) {
    //     let filterCondition = [
    //       {
    //         clause: "AND",
    //         conditions: [
    //           //  { column: 'model_name', operator: "EQUALS", value:  vals.orbitalvaule.collection_name},
    //         ],
    //       },
    //     ];
    // console.log(vals);

    //     //  ,filterCondition ByFilter
    //     this.dataService.getDataByFilter(
    //       vals.orbitalvaule.collection_name,
    //       {}
    //     ).subscribe((xyz: any) => {
    //       this.flag[i][index] = true;

    //       this.inputflag[i][index] = true;
    //       this.orbitalOptions[i][index] = xyz.data[0].response.map((vals: any) => {

    //         return { label: vals.name, value: vals["_id"] };
    //       });
    //       // this.orbitalOptions[i]=xyz.data
    //     });
    // } else {
    // !undo
    this.flag[i][index] = false;
    // }
  }
  opertorchange(values: any, i: any, index: any) {
    this.anotherfield[i][index]=''
    this.orbitalValue[i][index]=''
    if (values.anotherfield) {
      this.inputflag[i][index] = values?.anotherfieldtype;
    } else {
      if (values.flag) {
        this.flag[i][index] = true;
        // this.inputflag[i]=false
      } else {
        if (values.type != "orbital_value") {
          if (this.flag[i][index] == true) {
            this.flag[i][index] = false;
          }
          this.inputflag[i][index] = values?.anotherfield;
        }
      }
    }
    // console.log(values?.anotherfield,values?.anotherfieldtype);
  }
  removePArentField(i: number) {
    this.field.splice(i, 1);
    this.operator.splice(i, 1);
    this.orbitalValue.splice(i, 1);
    this.flag.splice(i, 1);
    this.value_type.splice(i, 1);
    this.grp.splice(i, 1);
    this.inputflag.splice(i, 1);
    // !Only Show normal when it empty
    if (_.isEmpty(this.grp)) {
      this.button_Flag = false;
    }
  }
  Grp_undo_edit(index: any, i: any) {
    this.grp[index][i].flag = true;
    // =[{ flag: true ,operator:this.grp[index][i].operator }];
  }
  // ! TO do
  getOperators(field: any, i: any, index: any) {
    // !undo
   
    // if (field?.reference) {
    //   // this.dateflag[i]=false
    //   this.operatorOptions[i][index] = [
    //     {
    //       label: "== Equal To",
    //       value: "equals",
    //       type: "orbital_value",
    //       anotherfield: false,
    //     },
    //     {
    //       label: "!= Must Not Be Equal To",
    //       value: "notEqual",
    //       type: "orbital_value",
    //       anotherfield: false,
    //     },
    //   ];
    // } else
    // !undo
    if (field.type == "time.Time") {
      // this.dateflag[i]=true
      this.operatorOptions[i][index] = [
        {
          label: "==  Equal To",
          value: "equals",
          type: field.type,
          anotherfield: false,
        },
        {
          label: "!= Not Equal To",
          value: "notEqual",
          type: field.type,
          anotherfield: false,
        },
        {
          label: ">= Greater than or equal to",
          value: "greaterThanOrEqual",
          type: field.type,
          anotherfield: false,
        },
        {
          label: "<= Less than or equal to",
          value: "lessThanOrEqual",
          type: field.type,
          anotherfield: false,
        },
        {
          label: "< Greater than",
          value: "greaterThan",
          type: field.type,
          anotherfield: false,
        },
        {
          label: "> Less than",
          value: "lessThan",
          type: field.type,
          anotherfield: false,
        },
        {
          label: "Within Duration",
          value: "within",
          type: field.type,
          anotherfield: false,
        }, // From --- Today
        {
          label: "Within Age Range",
          value: "between_age",
          type: field.type,
          anotherfield: true,
          anotherfieldtype: "any",
        },
        {
          label: "Within Any Date Range",
          value: "in_between",
          type: field.type,
          anotherfield: true,
          anotherfieldtype: "any",
        },
      ];
    } else if (field.type == "string") {
      // this.dateflag[i]=false

      this.operatorOptions[i][index] = [
        // { label: "Greater Than or Equal To", value: "greaterThanOrEqual",type:"string" },
        // { label: "Less Than or Equal To", value: "lte" ,type:"string"},
        // { label: "Greater Than", value: "gt" ,type:"string"},
        // { label: "Less Than", value: "lt" ,type:"string"},
        {
          label: "==  Equal To",
          value: "equals",
          type: field.type,
          anotherfield: false,
        },
        {
          label: "!= Not Equal To",
          value: "notEqual",
          type: field.type,
          anotherfield: false,
        },
        {
          label: "A.. StartWith",
          value: "startswith",
          type: field.type,
          anotherfield: false,
        },
        {
          label: "..T EndWith",
          value: "endswith",
          type: field.type,
          anotherfield: false,
        },
        {
          label: "Not Blank",
          value: "notblank",
          type: field.type,
          anotherfield: false,
          flag: true,
          value_not_need:true
        },
        {
          label: "Blank",
          value: "blank",
          type: field.type,
          anotherfield: false,
          flag: true,
          value_not_need:true
        },
        {
          label: "Contains Any Words",
          value: "contains",
          type: field.type,
          anotherfield: false,
        },
        // { label: "Min and Max Value", value: "in_between" ,type:"string"}
      ];
    } else if (field.type == "boolean" || field.type == "bool") {
      // this.dateflag[i]=false

      this.operatorOptions[i][index] = [
        {
          label: "== Equal To",
          value: "equals",
          type: field.type,
          anotherfield: false,
        },
        {
          label: "!=  Not Be Equal To",
          value: "notEqual",
          type: field.type,
          anotherfield: false,
        },
      ];
    } else if (field.type in this.NumberictypeMapping || field.type == "numeric") {
      // Number
      // this.dateflag[i]=false
      this.operatorOptions[i][index] = [
        {
          label: ">= Greater Than or Equal To",
          value: "greaterThanOrEqual",
          type: field.type,
          anotherfield: false,
        },
        {
          label: "<= Less Than or Equal To",
          value: "lessThanOrEqual",
          type: field.type,
          anotherfield: false,
        },
        {
          label: "< Greater Than",
          value: "greaterThan",
          type: field.type,
          anotherfield: false,
        },
        {
          label: "> Less Than",
          value: "lessThan",
          type: field.type,
          anotherfield: false,
        },
        {
          label: "== Equal To",
          value: "equals",
          type: field.type,
          anotherfield: false,
        },
        {
          label: "!= Not Equal To",
          value: "notEqual",
          type: field.type,
          anotherfield: false,
        },
        {
          label: "Minimum value",
          value: "min",
          type: field.type,
          anotherfield: false,
        },
        {
          label: "Maximum value",
          value: "max",
          type: field.type,
          anotherfield: false,
        },
        {
          label: "Regular Expression",
          value: "regexp",
          type: field.type,
          anotherfield: false,
        },
        {
          label: "Min and Max Value",
          value: "in_between",
          type: field.type,
          anotherfield: true,
          anotherfieldtype: "any",
        },
      ];
    }
  }

  removeField(i: number, index: any) {
    if (i == 0 && index == 0) { // todo _.isEmpty check
      this.grp = [];
      this.button_Flag = false;
    }else if (_.isEmpty(this.grp[i][index])) { // todo _.isEmpty check
    
    this.grp.splice(i,1)
    }
    this.field[i].splice(index, 1);
    this.operator[i].splice(index, 1);
    this.orbitalValue[i].splice(index, 1);
    this.flag[i].splice(index, 1);
    this.grp[i].splice(index, 1);

    this.value_type[i].splice(i, 1);
    // this.grp.splice(i, 1);
    this.inputflag[i].splice(i, 1);
  }

  addgrp(index: any, i: any) {
    this.grp[index].push({ flag: true, operator: this.grp[index][0].operator });
  }

  convertdata_into_string(index?: any, i?: any) {
    let field: any = this.field[index][i];
    let operator: any = this.operator[index][i];
    let value: any;
    let value_type: any = this.value_type[index][i];
    if (
      field.type === "time.Time" &&
      operator.type === "time.Time" &&
      value_type == "constant"
    ) {
      if (
        (operator.value == "in_between" || operator.value == "between_age") && // ! this used for the value from another input box
        operator.anotherfield == true
      ) {
        value =
          moment(this.orbitalValue[index][i]).format("DD-MM-YYYY") +
          " <----> " +
          moment(this.anotherfield[index][i]).format("DD-MM-YYYY");
      } else {
        value = moment(this.orbitalValue[index][i]).format("DD-MM-YYYY");
      }
    } else {
      if (operator.anotherfield == true && operator.value == "in_between") {
        // if(operator.type=='')
        value =
          this.orbitalValue[index][i] + " <---->" + this.anotherfield[index][i];
      } else {
        if (this.orbitalValue[index][i] !== undefined) {
          value = this.orbitalValue[index][i];
        } else {
          value = "";
        }
      }
    }
    if (value_type === "filter_Paramas") {
      value = value.ParamsName;
    }
    let vals: any =
      // this.Conditon  [index] +
      // "-" +
      field.name + " " + operator.label + " " + value;

    //! Undo
    // const condition = {
    //   column_name: field.field_name,
    //   operator: operator.value,
    //   values: value,
    //   conditon:this.Conditon[index]
    // };
    // console.log(condition);
    // let filterCondition:any ={
    //   clause:this.clause,
    //   conditon:condition
    //   }
    //   console.log(filterCondition);
    // ! Color Change purposes only
    // let color:any =""
    // if(this.Conditon[index]=="OR"){

    // }
    // let data:any={
    //   filter:filterCondition
    // }
    // this.grp[index].flag=false

    this.grp[index][i] = {
      flag: false,
      field: field.name,
      operators: operator.label,
      value: value,
      filter: vals,
      operator: this.grp[index][i].operator,
    };
  }

  PopUpJoinCollection(index?: any, flag?: any) {
    if (flag == true) {
      const customColumnArray: any = this.dataSet.get(
        "dataSetJoinCollection"
      ) as FormArray;
      let data: any = customColumnArray.at(index).value;

      this.fromCollection = data.fromCollection;
      this.toCollection = data.toCollection;
      // ? If Data not present it will add
      const isValuePresent = this.tocollectionList.some(
        (data) => data.value === this.toCollection
      );

      if (!isValuePresent) {
        const data: any = this.selected.filter(
          (data) => data.value === this.toCollection
        );
        this.tocollectionList.push(...data);
      }

      // this.toCollectionReference=data.toCollectionField
      this.collectionNameChanges(data.fromCollection, true);
      this.collectionNameChanges(data.toCollection, false);

      this.toCollectionReference = data.toCollectionField;
      this.fromCollectionReference = data.fromCollectionField;

      this.dialogService.openDialog(this.Popup, null, null, {
        index: index,
        formAction: "Edit",
      });
    } else {
      const customColumnArray: any = this.dataSet.get(
        "dataSetJoinCollection"
      ) as FormArray;
      this.dialogService.openDialog(this.Popup, null, null, {
        index: customColumnArray.length,
        formAction: "Add",
      });
    }
  }

  // For_model_Change(model_name:any){
  //   let filterCondition :any
  // if(typeof(model_name)=="string"){
  //   filterCondition = {
  //     filter: [
  //       { clause: "AND",
  //         conditions: [{
  //             column: "model_name",
  //             operator: "EQUALS",
  //             value: model_name }
  //           ]
  //       }
  //         ]
  //   }

  // }else{
  //    filterCondition = {
  //     filter: [
  //       { clause: "AND",
  //         conditions: [
  //           {
  //             column: "model_name",
  //             operator: "IN",
  //             value: model_name,
  //           }
  //         ]
  //       }
  //     ]
  //   }}
  //   this.dataService.getDataByFilter("data_model", filterCondition).subscribe(  (res: any) => {
  //    let value:any[]= res.data[0].response.map((res: any) => {
  //       let field_name = res.json_field.toLowerCase();
  //   return {
  //           name: res.model_name.toUpperCase()+ "--"+res.column_name.replace(/_/g, " ").toUpperCase().replace(/_/g, " "),
  //           field_name: field_name,
  //           parentCollectionName: res.model_name,
  //           type: res.type,
  //         };
  //     });
  //     console.log(value);

  //   })
  // }
  // forCheckingthemodelisNested(selectedTypes:any,ParentData:any){
  //   let values:any
  //   let filterCondition = {
  //     filter: [
  //       {
  //         clause: "AND",
  //         conditions: [
  //           {column: "model_name", operator: "EQUALS", value: selectedTypes},
  //         ]
  //       }
  //     ]
  //   };
  //   this.dataService.getDataByFilter("data_model",filterCondition).subscribe( (res: any) => {
  //     let addtionalvalues:any[]=[]
  //     values = res.data[0].response.map((res: any,index:any) => {
  //       // ! Concat the field Name with with Parent Model Name
  //       let field_name =ParentData.field_name.toLowerCase()+ "." + res.json_field.toLowerCase();
  //       let column_name =ParentData.name.replace(/_/g, " ").toUpperCase().replace(/_/g, " ") +" : " +res.column_name.replace(/_/g, " ").toUpperCase().replace(/_/g, " ");

  //       let data: any = {};
  //       // ! Check it is referneces
  //       // !undo
  //       // if (res.is_reference) {
  //       //   data.collection_name = res.collection_name;
  //       //   data.field = res.field;
  //       //   addtionalvalues.push({
  //       //     name:column_name,
  //       //     parentCollectionName:result.parentCollectionName.toLowerCase(),
  //       //     field_name: field_name,
  //       //     reference: res.is_reference,
  //       //     orbitalvaule: data,
  //       //     type: res.type,
  //       //   });
  //       // } else {
  //         // !undo
  //         addtionalvalues.push({
  //           name:column_name,
  //           field_name: field_name,
  //           parentCollectionName:ParentData.parentCollectionName.toLowerCase(),
  //           type: res.type,
  //         });
  //         if(res.data[0].pagination[0].totalDocs==index){
  // return addtionalvalues
  //         }
  //       // }
  //     });
  //   });
  // }

  // ? Unsed=======================================================================================================================================
  // modelUpdate(data:any){
  //   let joinCollection:any=this?.dataSet?.value?.dataSetJoinCollection
  //   let selectedCollection:any[]=[this?.dataSet?.value?.dataSetBaseCollection,...joinCollection]
  //   let filterCondition = {
  //     filter: [
  //       { clause: "AND",
  //         conditions: [
  //           {
  //             column: "model_name",
  //             operator: "IN",
  //             value: selectedCollection,
  //           }
  //         ]
  //       }
  //     ]
  //   };
  //   this.dataService.getDataByFilter("data_model", filterCondition).subscribe(
  //     (res: any) => {
  //       let values: any;
  //       values = res.data[0].response.map((res: any) => {
  //         let field_name = res.json_field.toLowerCase();
  //         let data: any = {};
  //         // !undo
  //         // if (res.is_reference) {
  //         //   data.collection_name = res.collection_name;
  //         //   data.field = res.field;
  //         //   return {
  //         //     name: res.model_name.toUpperCase()+ "--"+res.column_name.replace(/_/g, " ").toUpperCase().replace(/_/g, " "),
  //         //     field_name: field_name,
  //         //     parentCollectionName: res.model_name,
  //         //     reference: res.is_reference,
  //         //     orbitalvaule: data,
  //         //     type: res.type,
  //         //   };
  //         // } else {
  //           // !undo
  //           return {
  //             name: res.model_name.toUpperCase()+ "--"+res.column_name.replace(/_/g, " ").toUpperCase().replace(/_/g, " "),
  //             field_name: field_name,
  //             parentCollectionName: res.model_name,
  //             type: res.type,
  //           };
  //         // }
  //       });
  //       let addtionalvalues: any[] = [];
  //       values.forEach((result: any) => {
  //         const typeMapping: { [key: string]: string } = {
  //           string: "string",
  //           int: "number",
  //           int64: "number",
  //           float32: "number",
  //           float64: "number",
  //           bool: "boolean",
  //           "time.Time": "Date",
  //         };

  //         const selectedTypes = result.type.replace("[", "").replace("]", "");
  //         if (!(selectedTypes in typeMapping)) {
  //           let filterCondition = {
  //             filter: [
  //               {
  //                 clause: "AND",
  //                 conditions: [
  //                   {column: "model_name", operator: "EQUALS", value: selectedTypes},
  //                 ]
  //               }
  //             ]
  //           };
  //           this.dataService.getDataByFilter("data_model",filterCondition).subscribe((res: any) => {
  //             let values: any;
  //             values = res.data[0].response.map((res: any) => {
  //               // ! Concat the field Name with with Parent Model Name
  //               let field_name = result.field_name.toLowerCase() + "." + res.json_field.toLowerCase();
  //               let column_name =result.name.replace(/_/g, " ").toUpperCase().replace(/_/g, " ") +" : " +res.column_name.replace(/_/g, " ").toUpperCase().replace(/_/g, " ");

  //               let data: any = {};
  //               // ! Check it is referneces
  //               // !undo
  //               // if (res.is_reference) {
  //               //   data.collection_name = res.collection_name;
  //               //   data.field = res.field;
  //               //   addtionalvalues.push({
  //               //     name:column_name,
  //               //     parentCollectionName:result.parentCollectionName.toLowerCase(),
  //               //     field_name: field_name,
  //               //     reference: res.is_reference,
  //               //     orbitalvaule: data,
  //               //     type: res.type,
  //               //   });
  //               // } else {
  //                 // !undo
  //                 addtionalvalues.push({
  //                   name:column_name,
  //                   field_name: field_name,
  //                   parentCollectionName:result.parentCollectionName.toLowerCase(),
  //                   type: res.type,
  //                 });
  //               // }
  //             });
  //           });
  //         } else {
  //           addtionalvalues.push(result);
  //         }
  //       });
  // // this.dragData=[...addtionalvalues,...this.newcustomfield]
  // this.dragData=[...data];
  // this.options=[...data];
  // this.newcustomfield.forEach((newColumn) => {
  //   if (!this.dragData.includes(newColumn)) {
  //     this.dragData.push(newColumn);
  //   }

  //   if (!this.options.includes(newColumn)) {
  //     this.options.push(newColumn);
  //   }
  // });

  // // this.dragData=[...addtionalvalues,...this.newcustomfield]

  //     }
  //   );
  // }

  // removeDuplicates(arr: any[]): any[] {
  //   return arr.filter((value, index, self) => self.indexOf(value) === index);
  // }
}
