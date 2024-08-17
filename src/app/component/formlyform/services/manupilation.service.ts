import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { v4 as uuidv4 } from "uuid";

@Injectable({
  providedIn: 'root'
})
export class ManupilationService {
  
   Raw_to_formly(data: any[],changedData: any[]=[]){
    
    data.map((item:any) => {
           let value: any= {}
      if(item.jsonName != "formgroup"){
// ? TODO 
            value =  {
              type: item.jsonName,
              key: item.key,
              className: item.className || 'row',
              props: item.props || {},
              defaultValue:item.defaultValue || ''

          } 
        }
        if(item?.['labelChange']){
        //   let label = item.props.labelPropTemplates.map((s:any) => `{{${s}}}`).join(" - ");
          value['props']['labelProp']='label'
        //   value['props']['labelPropTemplate'] = label
        }
        // if(_.hasIn(item,'options') && !_.isEmpty(item.options)){ 

          if(["select-autocomplete","select-input"].includes(item.jsonName) && _.get(item,'props.fetch') != "staic" ){
            delete value['props'].options
          }
        // }
    if(_.hasIn(item,'fieldGroup')){
 
      if(_.hasIn(item,'className')){
        value['fieldGroupClassName'] = item.className || ''
      }
       value['fieldGroup']=[]
      if(_.hasIn(item,'template')){
        changedData.push({ template: `<h2 style="text-align: center;" class="page-title">${item.template}</h2>`})
      } 
      value.fieldGroup.push(... this.Raw_to_formly(item.fieldGroup) )
      if(item.isformArray){
        let data:any ={
          "key": item.formArraykey,
          "type": "repeat",
          props:item.formArray || {},
        }
        data['hideExpression']=item.hideExpression

        if(!_.isEmpty(value)){
          data['fieldArray']={
            ...value
          }
        }
        value=data
      }
    }

    if(item.jsonName != "formgroup" && _.isEmpty(value?.props?.label)){
      value.props.label = item.displayName
    }

    if(_.hasIn(item,'hideExpression')){
      value['hideExpression']=item.hideExpression
    }
    changedData.push(value)
    
    })
    return changedData
  }
   formly_to_raw(data: any[],parentId?:any,parentType?:any): any[] {
    return data.map((item: any) => {
        let rawItem: any = {};
        if (item.type) {
            rawItem.jsonName = item.type;
            rawItem.key = item.key;
            rawItem.className = item.className || 'row';
            rawItem.props = item.props || {};
            rawItem.defaultValue = item.defaultValue || '';
            rawItem.id = uuidv4();
        }
        if (parentId) {
          rawItem.parentId = parentId;
        }
      let typedef: any = {
        "tab-input": {},
        "stepper": {},
        "select": {option : true},
        "checkbox": {option : true},
        "multicheckbox": {option : true},
        "date-input": { dateattributes: true },
        "time-input": { timeattributes: true },
        "select-autocomplete": { checkvalue: true },
        "input-text-enterkey": { autocomplete: true },
        "matprefix-input": { prefixvalue: true },
        "select-input": { optionsDataSource: true },
        "location": { location: true },
        "map": { location: true } 
      };
      
      if (typedef.hasOwnProperty(item.type)) {
        rawItem = { ...rawItem,...typedef[item.type] };
        
        if (['tab-input', 'stepper'].includes(item.type)) {
          rawItem.static = 'multiform';
          rawItem.multiform = true;
          if (!parentId) {
              rawItem.multiforms = true;
          }
      } 
      }
      if (['tab-input', 'stepper'].includes(parentType)) {
        rawItem.props = item.props;
        rawItem.type = 'multiform';
          rawItem.multiform = true;
        } 

        if (item.fieldGroup) {
          if(!rawItem.jsonName){
            rawItem.jsonName = "formgroup"
          }
          rawItem.id = uuidv4();
          if (['tab-input', 'stepper'].includes(parentType)) {
            delete rawItem.jsonName
          }

            rawItem.fieldGroup = this.formly_to_raw(item.fieldGroup,rawItem.id,rawItem.jsonName);
          
            if (item.fieldGroupClassName) {
                rawItem.className = item.fieldGroupClassName;
            }
            if (item.fieldGroup.find((i: any) => i.template)) {
                rawItem.template = item.fieldGroup.find((i: any) => i.template).template;
            }
        }

        if (item.type === 'repeat') {
            rawItem.jsonName ="formgroup"
            
          rawItem.isformArray = true;
          rawItem.formArraykey = item.key;
          rawItem.formArray={}
          rawItem.fieldGroup = this.formly_to_raw(item?.fieldArray?.fieldGroup,rawItem.id)
          
          if(item.key){
            rawItem.formArray['key']= item.key;
          }
          if(item.label){
            rawItem.formArray['label']= item.label;
          }
          if(item.hideExpression){
            rawItem.formArray['label']= item.label;
          }
          // let id =uuidv4()
          // rawItem['parentId']=id
          //  let changedData={
          //   "displayName": "Row",
          //   "iconName": "../../../../assets/images/requriement.svg",
          //   "jsonName":"formgroup", id:id,            props : item.props || {},

          //   "fieldGroup":[rawItem]
          // }
          // rawItem =changedData
          // console.warn(rawItem);

        }
        if(item?.props?.labelPropTemplate){
          rawItem['labelChange'] = true
          let formattedString = item.props.labelPropTemplate;
          let matches = [...formattedString.matchAll(/\{\{([^}]+)\}\}/g)];
          let labelPropTemplates = matches.map(match => match[1].trim());
          rawItem.props.labelPropTemplates=[]
          rawItem.props.labelPropTemplates = labelPropTemplates;
        }
        if (item.hideExpression) {
            rawItem.hideExpression = item.hideExpression;
        }
        return rawItem;
    });
}

  // {
  //   "type": "input",
  //   "key": "key",
  //   "className": "row",
  //   "props": {
  //     "label": "Field Key",
  //     "placeholder": "Field Key",
  //     "required": true
  //   },
  // }{
  //   "type": "select",
  //   "key": "datatype",
  //   "className": "row",
  //   "props": {
  //     "label": "Data Type",
  //       "placeholder": "Data Type" ,
  //     "options":[
  //       {
  //         label:"Numeric",
  //         value:"number"
  //       },{
  //         label:"Text",
  //         value:"text"
  //       },
  //       ]
  //   },"defaultValue": "text"
  //  }, 
}
// ? USEING


// addData(newData: any, parentId?: string) {
//   const success = this.dataManipulationService.insertData(this.data, newData, parentId);

//   if (!success) {
//     console.log('Parent ID not found, or insertion failed.');
//   }
// }
// replaceItem(id: string, newData: any) {
//   const success = this.dataManipulationService.replaceData(this.data, id, newData);

//   if (!success) {
//     console.log('Item ID not found, or replacement failed.');
//   } else {
//     console.log('Item replaced successfully.');
//   }
// }

// addNewItem() {
//   const newData = { id: 'new', name: 'New Item', fieldGroup: [] };
//   this.dataService.insertData(this.data, newData, null); // Adds to root
// }

// replaceItem(id: string) {
//   const newData = { id: id, name: 'Updated Item', fieldGroup: [] };
//   this.dataService.replaceData(this.data, id, newData);
// }

// deleteItem(id: string) {
//   this.dataService.deleteData(this.data, id);
// }