import { Component, Input, SimpleChanges, TemplateRef, ViewChild, ViewContainerRef } from '@angular/core';
import { GridApi, ColumnApi, GridReadyEvent, SideBarDef } from 'ag-grid-community';
import * as _ from 'lodash';
import { DataService } from 'src/app/services/data.service';
import { DialogService } from 'src/app/services/dialog.service';
import "ag-grid-enterprise";
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { HelperService } from 'src/app/services/helper.service';
import * as moment from 'moment';
import { Observable, Subscription, filter, firstValueFrom, from, fromEvent, lastValueFrom, retry, take } from 'rxjs';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
   @Component({
  selector: 'app-aggrid-design',
  templateUrl: './aggrid-design.component.html',
  styleUrls: ['./aggrid-design.component.css'],
  })

export class AggridDesignComponent { 
  //#region  //? Preview HOw to Build
//   {
//     "start": 0,
//     "end": 2,
//     "filterParams": [
//         {
//             "parmasName": "test",
//             "parmsDataType": "time.Time",
//             "paramsvalue": "2014-06-19T06:52:05.334Z"
//         }
//     ],
//     "Filter": [
//         {
//             "clause": "AND",
//             "conditions": [
//                 {
//                     "column": "_id",
//                     "operator": "EQUALS",
//                     "type": "string",
//                     "value": "SDGSDg-sava001"
//                 }
//             ]
//         }
//     ]
// }
  //#endregion
  @Input() isformExtention: boolean = false;
  @Input() model:any = {} ;
     SelctedColumns: any[]=[];
     formGroup:FormGroup = new FormGroup({})
     selected:any[]=[]
     labelProp:any="collection_name"
     valueProp:any="model_name"
     column_autoComplete:any[]=[]
     columnOptions:any[] = []
     labelOptions:any[] = []
     valueOptions:any[] = []
    // ? Options Label And Filter
    optionlabel:any="name"
    optionvalue:any="field_name"
    operatorOptions:any[]=[]
    NumberictypeMapping: { [key: string]: string } = {
      int: "number",
      int64: "number",
      float32: "number",
      float64: "number",
    };
   

  constructor(
    public dialogService:DialogService,private dataServices:DataService,
    private _fb:FormBuilder,private helper:HelperService,
    public overlay: Overlay,public viewContainerRef: ViewContainerRef){ }
    
    //#region  //? Static Method Options For Drop Down
    ngOnInit() {
      console.log("NG ON IN IT");
      this.formGroup = this._fb.group({
        fetch: [null, [Validators.required]],
      });
      if (this.isformExtention) {
        this.formGroup.addControl('labelProp', this._fb.control('label',[Validators.required]));
        this.formGroup.addControl('labelPropTemplates', this._fb.control(null,[Validators.required]));
        this.formGroup.addControl('valueProp', this._fb.control('value',[Validators.required]));
        this.formGroup.addControl('fullObject', this._fb.control(false));
        this.formGroup.addControl('labelChange', this._fb.control(false));
        if(_.hasIn(this.model,'props') && !_.isEmpty(this.model['props'])){
          this.formGroup.patchValue(this.model['props'])
          console.log(this.model['props']);
          
          this.change_to_orginal()
        }
      }else{
        //  ?  For List 
        this.dataFetchMethod(true)

        // ? For Defualt Form List Config
        this.formGroup.addControl('pageHeading', this._fb.control(null , [Validators.required]));
        this.formGroup.addControl('showbutton', this._fb.control([false,[Validators.required]]));
        this.formGroup.addControl('addRoute', this._fb.control( null,[Validators.required]));
        this.formGroup.addControl('editRoute', this._fb.control('',[Validators.required]));
        this.formGroup.addControl('editMode', this._fb.control('popup',[Validators.required]));
        this.formGroup.addControl('screenEditMode', this._fb.control(''));
      }
    
      this.formGroup.valueChanges.subscribe((res:any)=>{
        console.log(res);
        if(this.isformExtention){
          let data = this.formGroup.getRawValue()
          Object.assign(this.model['props'],data)
          console.log(this.model);
          
          console.log(this.model);
          
        }
      })
    }
   

    change_to_orginal(){
      let feltch =this.model['props']['fetch'] ;
      if(!feltch) return console.log("Initialize Is Not Done");
        let methodType =_.get(this.model,'props.methodType')
        this.dataFetchMethod(feltch) 
        this.formGroup.get('methodType')?.setValue(methodType);
        this.methodChange();
        this.formGroup.get('postendPoint')?.setValue(_.get(this.model,'props.postendPoint'));
        this.modelNameGet({value:_.get(this.model,'props.postendPoint')});
        setTimeout(() => {
           this.formGroup.get('collectionName')?.setValue(_.get(this.model,'props.collectionName'))
        this.getColumns({value:_.get(this.model,'props.collectionName')},false);
        }, 1000);
       
        if(methodType=='get'){
          
          if(!_.isEmpty(_.get(this.model,'props.conditions')) && _.hasIn(this.model,'props.conditions')){
            if(this.formGroup.contains('conditions')) this.formGroup.addControl('conditions',new FormArray([]))
              let condtions =_.get(this.model,'props.conditions') 
            condtions.forEach((element:any) => {
              (this.formGroup.get('conditions') as FormArray ).push(   this._fb.group({
                params:[element.params],
                operator:[element.operator ,[Validators.required]],
                valueType:[ element.valueType,[Validators.required]],
                value:[ element.value,[Validators.required]],
              }))

            });
          }
        }

          this.formGroup.patchValue(this.model['props']) ;
          console.log(this.formGroup.value);
          let lableTemplateArr= _.get(this.model,'props.labelPropTemplates') || []
          if (!_.isEmpty( lableTemplateArr)){
            let value =_.get(this.model,'props.labelPropTemplate')
            if(!this.formGroup.contains('labelPropTemplate')){
              this.formGroup.addControl('labelPropTemplate',new FormControl(value))
            }else{
              this.formGroup.get('labelPropTemplate')?.setValue(value)
            }
          }

          if(!_.isEmpty(_.get(this.model,'props.filterParams')) && _.hasIn(this.model,'props.filterParams')){
            this.formGroup.addControl('filterParams', new FormArray([]))
            let findValue = _.get(this.model,'props.filterParams') ;
            let FilterParams =( this.formGroup.get('filterParams') as FormArray)
            findValue.forEach((element:any,index:any) => { 
              const formgroup = new FormGroup({
                parmasName: new FormControl( element['parmasName'],[Validators.required]),
                value: new FormControl( element['value'],[Validators.required]),
                valueType: new FormControl(element['valueType'] || 'static',[Validators.required]),
                parmsDataType: new FormControl(element['parmsDataType'],[Validators.required])
              });
              FilterParams.push(formgroup);
            });
          }


         if(methodType=='post'){
          this.operatorOptions=[]
           if(_.hasIn(this.model,'props.filter')){
            this.formGroup.addControl('filter',new FormArray([]))
 
            let filter = _.get(this.model,'props.filter')
            this.column_autoComplete=[]

            filter.forEach((element:any,parentIndex:any) => {
             let conditions :any []=[]
             this.column_autoComplete[parentIndex]=[]
             this.operatorOptions[parentIndex] =[]
              if(_.hasIn(element,'conditions')){
                element['conditions'].forEach((cond:any,chilIndex:any) => {
                  this.column_autoComplete[parentIndex][chilIndex]=this.columnOptions || []
                  this.operatorOptions[parentIndex][chilIndex] =[]
                  console.log("this.operatorOptions",this.operatorOptions[0]);
                  
                this.getOperators(cond,parentIndex,chilIndex,cond.type)
                  conditions.push(
                    this._fb.group({
                    column:[cond.column,[Validators.required]],
                    type:[cond.type,[Validators.required]],
                    operator:[cond.operator,[Validators.required]],
                    valueType:[cond.valueType,[Validators.required]],
                    value:[cond.value ,[Validators.required]],
                  })
                );   
                
                });
              }
              let filter:any= this._fb.group({
                clause:[element.clause || 'AND'],
                conditions:this._fb.array(conditions)
              });
            (this.formGroup.get('filter') as FormArray).push(filter);
              
            });

          }else{
            this.formGroup.addControl('filter', new FormArray([this.filterPush()]))
          }
        }
          
    } 

    get optionContol(): FormArray {
      return this.formGroup.get('options') as FormArray;
    }

    optionscreate(){
    return this._fb.group({
        label: [,Validators.required],
        value: [,Validators.required]
      })
    }

    addOption(): void {
      this.optionContol.push(this.optionscreate());
      this.optionContol.markAsUntouched()
    }

    removeOption(index: number): void {
      this.optionContol.removeAt(index);
    }

    //#endregion

    //#region //? depending on form value Change

  dataFetchMethod(method:any) {
    let AddContol: any[] = [
      {
        name: "endPoint",
        type: "Control",
        required: true,
        // defualtValue:"{{ds}}/{{dsa}/{{s}}",
        pattern:"(?:\{\{[^}]+\}\}\/|[^\/]+)"
      },
      {
        name: "methodType",
        type: "Control",
        required: true,
        defualtValue:""
      },
      {
        name: "conditions",
        type: "Array",
        required: true,
      },
    ];
    AddContol.forEach((control:any,index:any)=>{
      this.helper.ControlFormControl(this.formGroup,control.name,method == "staic",control.type,control.required,control.defualtValue,control.pattern) 
    })
    if(method == "staic"){
      this.formGroup.addControl('options',new FormArray([this.optionscreate()]))
    }else {
    // if (this.formGroup.contains('options'))
        if (this.formGroup.contains('label')) {
          this.formGroup.removeControl('label');
        }
    }
  } 

  checkIfNotEmpty(data:any){
    return _.isEmpty(data)
  }

  formvalueset(parentIndex:any,childIndex:any,value?:any){
    let formgroup =(this.formGroup.get("filter."+parentIndex+".conditions."+childIndex) as FormGroup)
    formgroup.get('column')?.setValue(value[this.optionvalue]);
    // if(formgroup.contains('filterparams')){
    //   formgroup.removeControl('filterparams')
    // }
    formgroup.get('value')?.setValue('')
    formgroup.get('dataType')?.setValue('')
    if(value['defaultValue']){
      formgroup.get('value')?.setValue(value['defaultValue'])
      formgroup.get('dataType')?.setValue(value['dataType'])
    }
  }

  setvalueforAutocomplete(input:HTMLInputElement,parentIndex:any,childIndex:any,value:any){
  let findData = this.column_autoComplete[parentIndex][childIndex].find((val:any)=>val[this.optionvalue] == value)
  input.value=findData[this.optionlabel]
  }

  async getColumns(event:any,need_to_addFilter:boolean=true){
    this.columnOptions =[]
    if(this.formGroup?.get('postendPoint')?.value =='filter'){
      this.optionlabel="field"
      this.optionvalue="field"
      this.ModelCloumnConfig(event.value).then((data: any) =>{
        data = _.orderBy(data, ['field'], ['asc']);
        this.columnOptions = _.cloneDeep(data)
        this.labelOptions = _.cloneDeep(data)
        this.valueOptions = _.cloneDeep(data)
        this.column_autoComplete[0]=[]
        this.column_autoComplete[0][0]=data
      })
    } else if(this.formGroup?.get('postendPoint')?.value =='dataset'){
      let findValue=[]
     console.log(this.selected);
    try {
      if(!_.isEmpty(this.selected)){
        findValue =this.selected.find((data: any) => data.dataSetName == event.value )
      }else{
      const apiObservable = this.dataServices.getDataById('dataset_config', event.value).pipe(retry(1));
      const response: any = await lastValueFrom(apiObservable);

      console.log(response); // Log the response for debugging
      findValue = response?.data?.[0]?.response; 
      }
      } 
       catch (err) {
        this.dialogService.openSnackBar("Some Error Has Occured")
      }


      let arr:any =findValue['SelectedList']

      function findType(value:any) {
        if (typeof value === 'number') {
          return 'number';
        } else if (typeof value === 'boolean') {
          return 'boolean';
        } else if (typeof value === 'string') {
          if (!isNaN(Date.parse(value))) {
            return 'time.Time';  
          }
          else if (!isNaN(parseFloat(value)) && isFinite(parseInt(value))) {
            return 'number';
          }
          else if (value.toLowerCase() === 'true' || value.toLowerCase() === 'false') {
            return 'boolean';
          }
        }
      
        return 'string';
      }

      this.optionlabel="field"
      this.optionvalue="field"
      if(!_.isEmpty( findValue['FilterParams']) && need_to_addFilter){
        this.formGroup.addControl('filterParams', new FormArray([]))
        let FilterParams =( this.formGroup.get('filterParams') as FormArray)
        findValue['FilterParams'].forEach((element:any,index:any) => { 
          let data =  findType(element['defaultValue']);
          const formgroup = new FormGroup({
            parmasName: new FormControl( element['parmasName'],[Validators.required]),
            value: new FormControl( element['defaultValue'],[Validators.required]),
            valueType: new FormControl('static',[Validators.required]),
            parmsDataType: new FormControl(data,[Validators.required])
          });
          FilterParams.push(formgroup);
        });
      }
    this.columnOptions = arr
    this.column_autoComplete[0]=[]
    this.column_autoComplete[0][0]=arr
    this.labelOptions = _.cloneDeep(arr)
    this.valueOptions = _.cloneDeep(arr)
    console.log("INSIDE");
    
    }
    // ? For Edit I will Add it using loop no need to add one and not other
    if(need_to_addFilter){
      this.formGroup.addControl('filter', new FormArray([this.filterPush()]))
    }
   } 

   methodChange(){
    
    if(this.formGroup.get('methodType')?.value == 'post'){
      if (this.formGroup.get('conditions')) {
        this.formGroup.removeControl('conditions');
    }
      this.formGroup.addControl('postendPoint',new FormControl('',[Validators.required]))
      this.formGroup.addControl('collectionName',new FormControl('',[Validators.required]))
    }else{
      if (this.formGroup.get('postendPoint')) {
        this.formGroup.removeControl('postendPoint');
    }
    if (this.formGroup.get('collectionName')) {
        this.formGroup.removeControl('collectionName');
    }
    if (this.formGroup.get('filter')) {
        this.formGroup.removeControl('filter');
    }
    
    if (this.formGroup.get('filterParams')) {
      this.formGroup.removeControl('filterParams');
  }
    }
  }
 
   
  endpoinParamerterCatcher() {
    if(this.formGroup?.get('methodType')?.value !='get'){
       return
    }
    let EndpointControl = this.formGroup.get('endPoint')
    let formattedString = EndpointControl?.value;
   //  ? Pattern Need 
    const pattern = /(?:\{\{[^}]+\}\}\/|[^\/]+)/;
    if (!pattern.test(formattedString)) {
      EndpointControl?.setErrors({ pattern: true });
      return;
    }
    let matches = [...formattedString.matchAll(/\{\{([^}]+)\}\}/g)];
    let labelPropTemplates = matches.map(match => match[1].trim());
    console.log(labelPropTemplates);
    let checkvalue = _.uniqWith(labelPropTemplates, _.isEqual)
    if (labelPropTemplates.length != checkvalue.length) {
      EndpointControl?.setErrors({ dupilcate: true })
      return
    }
    EndpointControl?.setErrors(null)

    labelPropTemplates.forEach((res: any) => {
      if (!this.formGroup.get('conditions')?.value.find((obj: any) => "{{" + res + "}}" === obj['params'])) {
        // If no match is found, insert `res` into conditions
        this.insertintoconditions(res);
        this
      }
    });

  }

 //#endregion

 //#region  //? Form Group Accessor
 

  CustomColumn(key: any): FormArray {
    return <FormArray>this.formGroup.get(key);
  }

  getCount(key: any): number {
    const userGroup = this.CustomColumn(key)
    return userGroup.length;
  }

  addClauesInsideFilter(){
    (this.formGroup.get('filter') as FormArray).push(this.filterPush())
    let formarr :any=this.formGroup.get('filter')
    this.column_autoComplete[formarr?.controls.length-1]=[]
    this.column_autoComplete[formarr?.controls.length-1][0]=this.columnOptions
    if(! (_.hasIn(this.operatorOptions,[formarr?.controls.length-1])&& _.isArray(this.operatorOptions[formarr?.controls.length-1]))){
      this.operatorOptions[formarr?.controls.length-1][0]=[]
    }
  }

  filterPush(){
    return this._fb.group({
      clause:['AND'],
      conditions:this._fb.array([this.addpostCondtion()])
    })
  }

  addpostCondtion(){
    return this._fb.group({
      column:[ ,[Validators.required]],
      type:[ ,[Validators.required]],
      operator:[  ,[Validators.required]],
      valueType:[ ,[Validators.required]],
      value:[ ,[Validators.required]],
    })
  }

  insertintoconditions(params:any){
    (this.formGroup.get('conditions') as FormArray ).push(this.addCondtion(params))
  }
  
  addCondtion(params?:any){
    return this._fb.group({
      params:["{{" +params +"}}"],
      operator:[  'EQUALS' ,[Validators.required]],
      valueType:[ ,[Validators.required]],
      value:[ ,[Validators.required]],
    })
  } 

   changelabel(label:any){
    return label?.replaceAll(/_/g, " ").toUpperCase().replaceAll(/_/g, " ");
  }
  //#endregion

//#region // ? verifycation The End Point
  verifyApi(){
  let formVAlue:any =  this.formGroup.value
    // this.data
  }

  getObjectKeyPair(data: any, parent: any = ''): any {
    let keyPairs: any[] = [];
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        const value = data[key];
        const fullKey = parent ? `${parent}.${key}` : key;

        if (typeof value === 'object') {
          keyPairs.push(fullKey);
          keyPairs.push(...this.getObjectKeyPair(value, fullKey));
        } else {
          keyPairs.push(fullKey);
        }
      }
    }

    return keyPairs;
  }

  //#region //? get through endpoint

  ModelCloumnConfig(modelName: any, Recursive?: any, ParentName?: any): Promise<any> {
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
      this.dataServices.getDataByFilter("data_model", filterCondition).subscribe((res: any) => {
          let additionalValues: any[] = [];
          let values: any = res.data[0].response.map((value: any) => {
            let field = value.json_field.toLowerCase();
            if (Recursive == true) {
              return {
                headerName: ParentName.headerName.replace(/_/g, " ").toUpperCase() + " : " + value.column_name.replace(/_/g, " ").toUpperCase(),
                field: ParentName.field + "." + field,
                parentCollectionName: ParentName.parentCollectionName,
                type: value.type,
              };
            } else {
              return {
                headerName: value.model_name.toUpperCase() + "--" + value.column_name.replace(/_/g, " ").toUpperCase(),
                field: field,
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
              result['filter'] = 'agTextColumnFilter'
              if(_.hasIn(this.aggridFilterList,result.type)){
                result['filter'] = this.aggridFilterList[result.type]
              }
              additionalValues.push(result);
            }
          });
          Promise.all(promises).then(() => {
            resolve(additionalValues);
          });
        });
    });
  }
//   Text Filter - A filter for string comparisons.
// Number Filter - A filter for number comparisons.
// Date Filter - A filter for date comparisons.
// Set Filter (e) - A filter influenced by how filters work in Microsoft Excel. This is an AG Grid Enterprise feature.
// Multi Filter (e) - 
// { field: "athlete" },
// { field: "age", filter: "agNumberColumnFilter", maxWidth: 100 },
// {
//   field: "date",
//   filter: "agDateColumnFilter",
//   filterParams: filterParams,
// },
// { field: "country", filter: "agSetColumnFilter" },
// { field: "sport", filter: "agMultiColumnFilter" },
// { field: "gold", filter: "agNumberColumnFilter" },
// { field: "silver", filter: "agNumberColumnFilter" },
// { field: "bronze", filter: "agNumberColumnFilter" },
// { field: "total", filter: false },

aggridFilterList:any={
  string:'agTextColumnFilter',
  int:'agNumberColumnFilter',
  'time.Time':'agTextColumnFilter',
  int64: "agNumberColumnFilter",
  float32: "agNumberColumnFilter",
  float64: "agNumberColumnFilter",
  bool: "agMultiColumnFilter",
  boolean: "agMultiColumnFilter",

}
  autocomplete(event:any,paretnIndex:number,currentIndex:any){
    console.log(this.optionlabel);
    this.column_autoComplete[paretnIndex][currentIndex]=[]
    this.column_autoComplete[paretnIndex][currentIndex]=this.columnOptions.filter((data: any) => {
      return data[this.optionlabel].toLowerCase().includes(event.target.value.toLowerCase())
    });
  }
  labelAutocomple(event:any){
    this.labelOptions =this.columnOptions.filter((data: any) => {
      return data[this.optionlabel].toLowerCase().includes(event.target.value.toLowerCase())
    });
  }
  valueAutocomple(event:any){
    this.valueOptions =this.columnOptions.filter((data: any) => {
      return data[this.optionlabel].toLowerCase().includes(event.target.value.toLowerCase())
    });
  }
  modelNameGet(event:any){
    // ! Collection Name
    if(event.value == "other"){
      this.formGroup.addControl('filter', new FormArray([this.filterPush()]))
      return
      }
    this.labelProp="collection_name"
    this.valueProp="model_name"
    var filterCondition1:any = {
     filter: [
       {
         clause: "AND",
         conditions: [
           { column: "is_collection", operator: "EQUALS", value: "Yes" },
         ],
       },
     ],
   };

      let collection_name="model_config" 
        if(event.value == "dataset"){
        collection_name="dataset_config";
        filterCondition1 ={}
        this.labelProp="dataSetName"
        this.valueProp="dataSetName"
        }else if(event.value == "filter"){
          if(this.formGroup.contains('filterParams')){
            this.formGroup.removeControl('filterParams')
          }
        }
        
      this.dataServices.getDataByFilter(collection_name, filterCondition1).subscribe((res: any) => {
          this.selected = res.data[0].response 
        });
        if(this.formGroup.contains('filter')){
          this.formGroup.removeControl('filter')
        }
    }


  addconsiditionInsideClaues(key:any,paretnIndex:number,currentIndex:any){
    currentIndex=currentIndex+1;
    if(!Array.isArray(this.column_autoComplete[paretnIndex])){
      this.column_autoComplete[paretnIndex]=[]
    }
    if(!Array.isArray(this.column_autoComplete[paretnIndex][currentIndex])){
      this.column_autoComplete[paretnIndex][currentIndex]=[]
    }
    this.column_autoComplete[paretnIndex][currentIndex]=this.columnOptions;

    (this.CustomColumn(key) as FormArray).push(this.addpostCondtion());
  }
  //#endregion
  
  getOperators(field: any, parent:any,childIndex:any,values:any='string') {
    // !undo
      if (!_.isArray(this.operatorOptions)) {
        this.operatorOptions= []
      }

     if (!_.isArray(this.operatorOptions[parent])) {
        this.operatorOptions[parent] = [];
      }

      if(! _.isArray(this.operatorOptions[parent][childIndex])){
        this.operatorOptions[parent][childIndex] =[]
      }

    let value =  values || field['type']
    this.formGroup.get(`filter.${parent}.conditions.${childIndex}.type`)?.setValue(value)

    if (field.type == "time.Time") { 
      this.operatorOptions[parent][childIndex] = [
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
    }  else if (field.type == "boolean" || field.type == "bool") { 
      this.operatorOptions[parent][childIndex] = [
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
      this.operatorOptions[parent][childIndex] = [
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
    } else{ 
      this.operatorOptions[parent][childIndex] = [
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
    }
  }
 
  toggleButtonVisibility(value:any,id:any):void {
    if(value) {
    (document.getElementById(id) as HTMLSpanElement ).style.visibility='visible' ;
    }else{
      (document.getElementById(id) as HTMLSpanElement ).style.visibility='hidden' ;
    }
  }

  handleAction(type:any,parent:any,childIndex:any=null){
    if (type=='Delete'){
      if(childIndex == null){
        (this.formGroup.get('filter') as FormArray).removeAt(parent)
      }else{
        ((this.formGroup.get('filter.'+parent+".conditions") as FormArray) as FormArray).removeAt(childIndex)
      }
    }
  }

    chnage(event:any){
        let label = event.map((s:any) => `{{${s[this.optionvalue]}}}`).join('-')
          if(!this.formGroup.contains('labelPropTemplate')){
            this.formGroup.addControl('labelPropTemplate',new FormControl(label))
          }else{
            this.formGroup.get('labelPropTemplate')?.setValue(label)
          }
   }
  
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
  aggridStructure:any[]=[]
 async save(){
    console.log(this.formGroup.value);
    this.aggridStructure=this.columnOptions
    let formvalue = _.cloneDeep(this.formGroup.value)
  
  }
  gridApi!:GridApi
  gridColumnApi!:ColumnApi
  rowData:any=[]
  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
  }
  @ViewChild("previewGrid", { static: true }) previewGrid!: TemplateRef<any>;

  async Preview() {
    
    this.aggridStructure=this.columnOptions
  let formvalue = _.cloneDeep(this.formGroup.value)
    this.rowData = (await this.dataServices.dataHandler(formvalue,{})) || [];
    // this.dialogService.openSnackBar("Not Empty")
    this.dialogService.openDialog(this.previewGrid, null, null, {});
   
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

    // this.dataSet.get("SelectedList").setValue(selected_Column);
    this.dialogService.closeModal();
  }
  

  handleContextMenu(event: MouseEvent): void {
    if (!this.isformExtention) {
      this.open(event)
      event.preventDefault();
    } 
  }

  open({ x, y }: MouseEvent) {
    this.close();
    const positionStrategy = this.overlay.position().flexibleConnectedTo({ x, y })
      .withPositions([
        {
          originX: 'end',
          originY: 'bottom',
          overlayX: 'end',
          overlayY: 'top',
        }
      ]);

    this.overlayRef = this.overlay.create({
      positionStrategy,
      scrollStrategy: this.overlay.scrollStrategies.close()
    });
    let data ={}
    this.overlayRef.attach(new TemplatePortal(this.contextMenu, this.viewContainerRef, {
      // ? PAth to menu to ngtemplate
      $implicit: data
    }));
    this.sub = fromEvent<MouseEvent>(document, 'click')
      .pipe(
        filter(event => {
          const clickTarget = event.target as HTMLElement;
          return !!this.overlayRef && !this.overlayRef.overlayElement.contains(clickTarget);
        }),
        take(1)
      ).subscribe(() => this.close())

  } 
  
  close() {
    this.sub && this.sub.unsubscribe();
    if (this.overlayRef) {
      this.overlayRef.dispose();
      this.overlayRef = null;
    }
  }

  @ViewChild('contextMenupop') contextMenu!: TemplateRef<any>;
  sub!: Subscription;
  
   overlayRef!: OverlayRef | null
  
  
  
  
  
  
   
}
