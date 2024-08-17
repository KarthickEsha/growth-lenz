import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, Validators, FormArray } from '@angular/forms';
import * as _ from 'lodash';
import { isEmpty } from 'lodash';
import * as moment from 'moment';
import { DataService } from 'src/app/services/data.service';
import { DialogService } from 'src/app/services/dialog.service';

@Component({
  selector: 'app-ngmodel',
  templateUrl: './ngmodel.component.html',
  styleUrls: ['./ngmodel.component.css']
})
export class NgmodelComponent {

  @Input('Action') Action: any
  @Input('Data') Data: any
  @Input('filterParms') filterParms: any
  @Input('emit') emit: any =false
  @Input('Collection') Collection: any
  @Output('onClose') onClose = new EventEmitter<any>();
NumberictypeMapping: { [key: string]: string } = {
  int: "number",
  int64: "number",
  float32: "number",
  float64: "number",
};

button_Flag=false
name:any='name'
values:any='field_name'
select: any[] = [];
// newcustomfield:any[]=[]
value_type:any[]=[]
opt: any
valueProp :any='value'
labelProp :any='model_name'
onValueChangeUpdate: any
label: any
selected:any[]=[]
dropdownList:any[] = []
currentField:any
selectedColumns:any[]=[]


grp: any[]= [];
subGrp: any[]= [];
subGrpflag: any[]= [];

filterindex:any[]=[]
flag: any[] = [];
field: any[] = [];
 operator: any[] = [];
operatorOptions: any[] []= []; 
orbitalValue: any []= [];
orbitalOptions: any[] = [];
clause: any[] = [];
inputflag: any[] = [];
anotherfield: any []= [];
Conditon: any[] = []; 
apiflag: boolean = false;

constructor(public dataService:DataService,public dialogService: DialogService,public formBuilder:FormBuilder){


}
 
ngOnInit() {
    
  if(this.Action=="Add"){
    this.ModelCloumnConfig(this.Collection).then((data:any)=>{
      console.log(data);
      
      this.options=data
     })
  }else{

    this.ModelCloumnConfig(this.Collection).then(async (xyz:any)=>{
      console.log(xyz);
      
this.options=xyz;
 this.button_Flag=false;
this.apiflag=false;
this.editgrp(this.Data.converted)
if(this.emit){
  setTimeout(() => {
    this.savegrp()
}, 2000);
}
     })
  }
  console.log("AFTER TRIGGER",this);
  
    
}
      Parent_Conditons(flag:any,vals:any,index:any) {
        
        if(flag==true){
          this.grp.push([{ flag: true ,operator:vals}]);
          this.field.push([]);
          this.operator.push([]);
          this.orbitalValue.push([]);
          this.orbitalOptions.push([]);      this.value_type.push([]);

          this.operatorOptions.push([]);
          this.flag.push([]);
          this.anotherfield.push([]);
          this.inputflag.push([]);
        }else{
            this.grp[index].push({ flag: true ,operator:this.grp[index][0].operator});
        }
    
      }

      ModelCloumnConfig(modelName: any, Recursive?: any, ParentName?: any): Promise<any> {
        return new Promise((resolve, reject) => {
          let filterCondition: any = {
            filter: [
              {
                clause: "AND",
                conditions: [
                  {
                    column: "model_name",
                    operator: "EQUALS",
                    value: modelName
                  }
                ]
              }
            ]
          };
      
          this.dataService.getDataByFilter("data_model", filterCondition).subscribe((res: any) => {
            let additionalValues: any[] = [];
            let values: any = res.data[0].response.map((value: any) => {
              let field_name = value.json_field.toLowerCase();
              if (Recursive == true) {
                return {
                  name: ParentName.name.replace(/_/g, " ").toUpperCase() + " : " + value.column_name.replace(/_/g, " ").toUpperCase(),
                  field_name: ParentName.field_name + "." + field_name,
                  parentCollectionName: ParentName.parentCollectionName,
                  type: value.type,
                };
              } else {
                return {
                  name: value.model_name.toUpperCase() + "--" + value.column_name.replace(/_/g, " ").toUpperCase(),
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
                  
                  this.ModelCloumnConfig(selectedTypes, true, result).then((RecursiveData:any) => {
                    console.log(selectedTypes);
                    
                    RecursiveData.forEach((element: any) => {
                      additionalValues.push(element);
                    });
                  })
                );
                console.log(promises);
                
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
      
      options:any[]=[];
     
    setflag(vals: any ,i: any,index:any) {

        this.flag[i][index] = false;
    }

    opertorchange(values: any,i: any,index:any) {
      this.anotherfield[i][index]=''
      this.orbitalValue[i][index]=''
      if (values.anotherfield) {
        this.inputflag[i][index] = values?.anotherfieldtype;
      } else {
        if (values.flag) {
          this.flag[i][index] = true;
        } else {
          if (values.type != "orbital_value") {
            if (this.flag[i][index] == true) {
              this.flag[i][index] = false;
            }
            this.inputflag[i][index] = values?.anotherfield;
          }
        }
      }
    }

  savegrp() {
    let overallcondition: any[] = [];
    this.grp.forEach((element1: any, index: number) => {
      let Condition: any[] = [];
  
     
  
      element1.forEach((_:any, i: number) => {
        let field: any = this.field[index][i];
        let operator: any = this.operator[index][i];
        let value_type:any=this.value_type[index][i];
        let value: any;
        // if (field.type === "time.Time" && operator.type === "time.Time") {
        //   if (
        //     (operator.value == "in_between" ||operator.value == "between_age"  ) &&  // ! this used for the value from another input box
        //     operator.anotherfield == true 
        //   ) {
        //     value=[this.orbitalValue[index][i],this.anotherfield[index][i]]
        //   } else {
        //     value=this.orbitalValue[index][i]
        //   }
        // }
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
        } 
         else {
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
          type: operator.type,
          parentCollectionName: field.parentCollectionName,
          value_type:value_type,
          value: value,
        };
  
        Condition.push(conditions);
      });
  
      let filter: any = {
        clause: this.grp[index][0].operator,
        conditions: Condition,
      };
      overallcondition.push(filter);
    });
   
    let final: any[] = [];
  
    overallcondition.forEach((element, index) => {
      if (index === 0) {
        final.push(element);
      } else {
        if (!final[0].conditions) {
          final[0].conditions = [];
        }
        final[0].conditions.push(element);
      }
    });
  
    let data: any = {
      final: final,
      grp: this.grp,
    };
  
    this.onClose.emit(data);
  console.warn(data);
  
    // Resetting values
    this.grp = [];
    this.field = [];
    this.operator = [];
    this.orbitalValue = [];
    this.orbitalOptions = [];
    this.operatorOptions = [];
    this.flag = [];
    this.anotherfield = [];
    this.inputflag = [];
    this.options = [];
    this.apiflag = false;
  }
  
    Grp_undo_edit(index: any,i:any) {

      this.grp[index][i].flag=true
      // =[{ flag: true ,operator:this.grp[index][i].operator }];
    }
   
    getOperators(field: any ,i: any,index:any) {
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
          { label: "Within Duration", value: "within" ,type:field.type ,  anotherfield: false,} , // From --- Today 
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
            value: "startwith",
            type: field.type,
            anotherfield: false,
          },
          {
            label: "..T EndWith",
            value: "endwith",
            type: field.type,
            anotherfield: false,
          },
          {
            label: "Not Blank",
            value: "notblank",
            type: field.type,
            anotherfield: false,
            flag: true,
          },
          {
            label: "Blank",
            value: "blank",
            type: field.type,
            anotherfield: false,
            flag: true,
          },
          {
            label: "Contains Any Words",
            value: "contain",
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
      } else if(field.type in this.NumberictypeMapping  || field.type == "numeric" ){
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
    removeField(i: number,index:any) {
      this.field[i].splice(index, 1);
      this.operator[i].splice(index, 1);
      this.orbitalValue[i].splice(index, 1);
      this.flag[i].splice(index, 1);
      this.grp[i].splice(index, 1);  this.value_type[i].splice(i,1)

    }
    
    removePArentField(i: number) {
      this.field.splice(i, 1);
      this.operator.splice(i, 1);
      this.orbitalValue.splice(i, 1);
      this.value_type.splice(i,1)
      this.flag.splice(i, 1);
      this.grp.splice(i, 1);
      this.inputflag.splice(i,1)
      // !Only Show normal when it empty
      if(isEmpty(this.grp)){
        this.button_Flag=false;
      }
    }

    addgrp(index: any,i:any) {
    this.grp[index].push({ flag: true ,operator:this.grp[index][0].operator})
    }
    
    convertdata_into_string(index?: any,i?:any) {
      let field: any = this.field[index][i];
      let operator: any = this.operator[index][i];
      let value: any;
      let value_type:any=this.value_type[index][i];
      if (field.type === "time.Time" && operator.type === "time.Time"&&value_type=='constant') {
        if (
          (operator.value == "in_between" ||operator.value == "between_age"  ) &&  // ! this used for the value from another input box
          operator.anotherfield == true 
        ) {
          value=  moment(this.orbitalValue[index][i]).format( "DD-MM-YYYY" ) + " <----> "+ moment(this.anotherfield[index][i]).format( "DD-MM-YYYY" )
        } else {
          
          value= moment(this.orbitalValue[index][i]).format( "DD-MM-YYYY" );
          
        }
      }else{
    
        if (operator.anotherfield == true && operator.value == "in_between") {
          // if(operator.type=='')
          value = this.orbitalValue[index] [i] +" <---->"+ this.anotherfield[index] [i] 
        } else {
          if (this.orbitalValue[index] [i]  !== undefined) {
            value = this.orbitalValue[index] [i] ;
          } else {
            value = "";
          }
        }
      }
    if(value_type==="filter_Paramas"){
      value=value.ParamsName
    }
      let vals: any =
        // this.Conditon  [index] +
        // "-" +
        field.name +
        " " +
        operator.label +
        " " +
        value;
    
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
      
      this.grp[index][i] = { flag: false, field:field.name,  operators:operator.label ,value:value
        ,filter: vals ,operator:this.grp[index][i].operator};
    }
    

    async editgrp(data: any,) {
      // todo
      // let addtionalvalues:any
console.log("EDIT GRP",data);

 let filter:any=data
 const overallcondition: any[] = await this.converRawdataintoArray(filter)
 
//  this.options = addtionalvalues;
 overallcondition.forEach((parentFilter:any, parentIndex:any) => {
   if (parentFilter.clause !== undefined) {
   
     this.Parent_Conditons(true,parentFilter.clause,parentIndex)
   }
 
   this.field[parentIndex] = [];
   this.operator[parentIndex] = [];
   this.orbitalValue[parentIndex] = [];
 
   this.value_type[parentIndex] = [];
   this.anotherfield[parentIndex] = [];
   parentFilter.conditions.forEach((ChildValues:any, childIndex:any) => {
     if (ChildValues !== undefined) {
       // Initialize arrays
       this.field[parentIndex][childIndex] = [];
       this.operator[parentIndex][childIndex] = [];
       this.orbitalValue[parentIndex][childIndex] = [];
       this.value_type[parentIndex][childIndex] = [];
       this.anotherfield[parentIndex][childIndex] = [];

       // if (parentFilter.ChildValuess.length >= childIndex) {
         if (this.grp[parentIndex][childIndex]?.flag === undefined) {
           this.addgrp(parentIndex,childIndex)
         }
       // }
 
       // Use find to find matching options and operators
       const filteredOption = this.options.find((res:any) => res.field_name === ChildValues.column);
       if (filteredOption) {
         this.setflag(filteredOption, parentIndex, childIndex);
         this.getOperators(filteredOption, parentIndex, childIndex);
         this.button_Flag = true;
 
         const filteredOperatorOption = this.operatorOptions[parentIndex][childIndex].find(
           (resOperator:any) => resOperator.value.toLowerCase() === ChildValues.operator.toLowerCase()
         );
 
         if (filteredOperatorOption) {
           this.opertorchange(filteredOperatorOption, parentIndex, childIndex);
           this.apiflag = true;
           this.field[parentIndex][childIndex] = filteredOption;
           this.operator[parentIndex][childIndex] = filteredOperatorOption;
           this.value_type[parentIndex][childIndex] =ChildValues.value_type
           // if(this.operator[p])
           if (filteredOption.type === "time.Time" && filteredOperatorOption.type === "time.Time") {
             if (
               (filteredOperatorOption.value == "in_between" ||filteredOperatorOption.value == "between_age"  ) &&  // ! this used for the value from another input box
               filteredOperatorOption.anotherfield == true 
             ) {
               this.orbitalValue[parentIndex][childIndex]=ChildValues.value[0]
                this.anotherfield[parentIndex][childIndex]=ChildValues.value[1]
             } else {
               this.orbitalValue[parentIndex][childIndex]=ChildValues.value
             }
           }
            else {
             if (filteredOperatorOption.anotherfield == true && filteredOperatorOption.value == "in_between") {
               this.orbitalValue[parentIndex][childIndex]=ChildValues.value[0]
                this.anotherfield[parentIndex][childIndex]=ChildValues.value[1]
             } else {
                this.orbitalValue[parentIndex][childIndex]=ChildValues.value;
             }
           }
           // this.orbitalValue[parentIndex][childIndex] = ChildValues.value;
           this.convertdata_into_string(parentIndex, childIndex);
         }
       }
     }
   });
 });


  console.log("THIS",this);
    }
  
   converRawdataintoArray(filter:any):Promise<any> {
    return new Promise(async (resolve, reject) => {
      let final:any[]=[]
  let arr:any[] = []
      var parentFilter:any
  for (let index = 0; index < filter.length; index++) {
  const element = filter[index];
  const clonedElement = { ...element };
  parentFilter = { ...clonedElement };
  parentFilter.conditions = [];
  for (let conditionIndex = 0; conditionIndex < clonedElement.conditions.length; conditionIndex++) {
    const condition = clonedElement.conditions[conditionIndex];
  
    if (condition.conditions) {
      arr.push(condition);
    } else {
      parentFilter.conditions.push(condition);
    }
  }
  final.push(parentFilter);
  }
  arr.forEach((xyz:any)=>{
    final.push(xyz)
  })
  resolve(final)
    })
   }
  
    ngOnDestroy(){
      this.grp=[]
      this.field=[]
      this.operator=[]
      this.orbitalValue=[]
      this.orbitalOptions=[]
      this.operatorOptions=[]
      this.flag=[]
      this.anotherfield=[]
      this.inputflag=[]
      this.options=[]
      this.apiflag=false
           
    }
}
