import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Component, HostListener, TemplateRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSidenav } from '@angular/material/sidenav';
import * as _ from 'lodash';
import { Subject } from 'rxjs';
import { DataService } from 'src/app/services/data.service';
import { DialogService } from 'src/app/services/dialog.service';
import { ManupilationService } from './services/manupilation.service';
import { v4 as uuidv4 } from "uuid";
import { ActivatedRoute, Router } from '@angular/router';
@Component({
  selector: 'app-formlyform',
  templateUrl: './formlyform.component.html',
  styleUrls: ['./formlyform.component.css']
})
export class FormlyformComponent {
  navItems!: any[]
  collapsed = true
  screenwidth = 0    
  subsectionExpanded: { [key: string]: boolean } = {};
  logo_image: any; 
  project_Data:any=[] 
  @ViewChild("drawer") drawer!: MatSidenav;
  formlyField:any[]=[]
  formlmodel:any={}
  formlform:FormGroup = new FormGroup({})
  @ViewChild("editViewPopup", { static: true })  editViewPopup!: TemplateRef<any>;

  @ViewChild("FilterPopup", { static: true }) FilterPopup!: TemplateRef<any>; 
  filterParms:any =[]
  
  constructor(
   public dialogService: DialogService, 
   public dataservices:DataService, 
   public dragdrop :ManupilationService,
   private route:ActivatedRoute,
   private router:Router
  ) {
  }
  //  data: any[] = []
  class(){
    let styleclass=""
    if(this.collapsed && this.screenwidth > 768 ){
      styleclass='body-trimmed'
    } else if(this.collapsed && this.screenwidth <=768   ){
      styleclass='body-md-screen'
    } 
 
     

    return styleclass
  }

  toggleSubsection(section: any): void {
    for (let subsectionName in this.subsectionExpanded) { 
      if (subsectionName !== section.displayName) { 
        this.subsectionExpanded[subsectionName] = false;
      }
    } 
    if (section.children) { 
      this.subsectionExpanded[section.displayName] = !this.subsectionExpanded[section.displayName];
    }
  }

  public data1: Array<any> = [];
  public data: Array<any> = [];

  public invert: boolean = true;
  public onDragDrop$ = new Subject<CdkDragDrop<Array<any>>>();
  


  screenId:any
  selectProject:any
  form:FormGroup = new FormGroup({})
  model:any ={}
  fields:any =[


    // ? Multi Form
    
  {
    "fieldGroup": [  
      {
        "type": "select",
        "key": "jsonName",
        "className": "row",
        "props": {
          "label": "Multi Form Type",
            "placeholder": "Multi Form Type" ,
          "options":[
            {
              label:"Tab",
              value:"tab-input"
            },{
              label:"Stepper",
              value:"stepper"
            } 
            ]
        },"defaultValue": "tab-input"
      },{
          "type": "select",
          "key": "props.type",
          "className": "row",
          "props": {
            "label": "Stepper Direction",
              "placeholder": "Stepper Direction" ,
            "options":[
              {
                label:"Horizontal",
                value:"horizontal"
              },{
                label:"Vertical",
                value:"vertical"
              } 
              ]
          } ,
          "hideExpression": "model?.jsonName != 'stepper'"
        }, 
        {
          "type": "input",
          "key": "hideExpression",
          "className": "row",
          "props": {
            "label": "Hide Expression",
            "placeholder": "Hide Expression" 
          },
        }
    ],
  "hideExpression": "model?.static != 'multiform'"
}, 

// ? Add Sub Form

{
  "fieldGroup": [  
    {
      "type": "input",
      "key": "props.label",
      "className": "row",
      "props": {
        "label": "Group Name",
      }
    },
  ],
"hideExpression": "model?.type !='multiform'"
}, 


// ? FORMGROPUP
    {
        "fieldGroup": [  
          {
            "type": "input",
            "key": "template",
            "className": "row",
            "props": {
              "label": "Group Name",
              "placeholder": "Group Name"
        
            },
          },    {
            "type": "select",
            "key": "className",
            "className": "row",
            "props": {
              "label": "Class Name",
                "placeholder": "Class Name" ,
              "options":[
                {
                  label:"None",
                  value:""
                }, {
                  label:"Flex",
                  value:"display-flex"
                },
                {
                label:"flex 1",
                value:"flex-1"
              }
              ,{
                label:"flex 2",
                value:"flex-2"
              },{
                label:"flex 3",
                value:"flex-3"
              },{
                label:"flex 4",
                value:"flex-4"
              },{
                label:"flex 5",
                value:"flex-5"
              },{
                label:"flex 6",
                value:"flex-6"
              },{
                label:"flex 7",
                value:"flex-7"
              },{
                label:"flex 8",
                value:"flex-8"
              },{
                label:"flex 9",
                value:"flex-9"
              },{
                label:"flex 10",
                value:"flex-10"
              },{
                label:"flex 11",
                value:"flex-11"
              },{
                label:"flex 12",
                value:"flex-12"
              }]
            },"defaultValue": "display-flex"
          }
          ,{
            key: 'isformArray',
            type: 'checkbox',
            props: { label: 'Is FormArray' },
            },
            {
        "type": "input",
        "key": "formArraykey",
        "className": "row",
        "props": {
          "label": "Form Array Key",
          "placeholder": "Form Array Key"
      }
      }   ,{
        "type": "input",
        "key": "formArray.key",
        "className": "row",
        "props": {
          "label": "Form Array Label",
          "placeholder": "Form Array Label"
      },
      } ,{
        "type": "input",
        "key": "hideExpression",
        "className": "row",
        "props": {
          "label": "Hide Expression",
          "placeholder": "Hide Expression" 
        }
      }
    ],
      "hideExpression": "model?.jsonName !='formgroup'"
    }, 

// ? DEFAULT
   { template: '<h2 style="text-align: center;" class="page-title">Key Config</h2>' ,
  "hideExpression": "model?.jsonName =='formgroup' ||  model?.multiform || model?.location"},
    {
    "fieldGroup": [
      {
        "fieldGroupClassName": "display-flex",
        "fieldGroup": [
          {
            "type": "input",
            "key": "key",
            "className": "flex-6",
            "props": {
              "label": "Field Key",
              "placeholder": "Field Key",
              "required": true
            }
          },
          {
            "type": "input",
            "key": "props.label",
            "className": "flex-6",
            "props": {
              "label": "Display Label",
              "placeholder": "Display Label",
              "required": true
            }
          }
        ]
      },
      {
        "type": "input",
        "key": "props.placeholder",
        "className": "row",
        "props": {
          "label": "Placeholder"
        }
      },
      {
        "key": "props.required",
        "type": "checkbox",
        "props": {
          "label": "Is Required"
        }
      },
      {
        "fieldGroupClassName": "display-flex",
        "fieldGroup": [
          {
            "type": "select",
            "key": "props.type",
            "className": "flex-6",
            "props": {
              "label": "Data Type",
              "placeholder": "Data Type",
              "options": [
                {
                  "label": "Numeric",
                  "value": "number"
                },
                {
                  "label": "Text",
                  "value": "text"
                }
              ]
            },
            "hideExpression": " ! (model?.jsonName =='input' || model?.jsonName =='input-text-enterkey' || model?.jsonName == 'matprefix-input' ) "
          },
          {
            "type": "select",
            "key": "className",
            "className": "flex-6",
            "props": {
              "label": "Class Name",
              "placeholder": "Class Name",
              "options": [
                {
                  "label": "None",
                  "value": ""
                },
                {
                  "label": "Row",
                  "value": "row"
                },
                {
                  "label": "flex 1",
                  "value": "flex-1"
                },
                {
                  "label": "flex 2",
                  "value": "flex-2"
                },
                {
                  "label": "flex 3",
                  "value": "flex-3"
                },
                {
                  "label": "flex 4",
                  "value": "flex-4"
                },
                {
                  "label": "flex 5",
                  "value": "flex-5"
                },
                {
                  "label": "flex 6",
                  "value": "flex-6"
                },
                {
                  "label": "flex 7",
                  "value": "flex-7"
                },
                {
                  "label": "flex 8",
                  "value": "flex-8"
                },
                {
                  "label": "flex 9",
                  "value": "flex-9"
                },
                {
                  "label": "flex 10",
                  "value": "flex-10"
                },
                {
                  "label": "flex 11",
                  "value": "flex-11"
                },
                {
                  "label": "flex 12",
                  "value": "flex-12"
                }
              ]
            },
            "defaultValue": "flex-6"
          }
        ]
      },
      {
        "type": "input",
        "key": "defaultValue",
        "className": "row",
        "props": {
          "label": "Defualt Value"
        }
      },
      {
        "type": "input",
        "key": "props.description",
        "className": "row",
        "props": {
          "label": "Description"
        }
      },
      {
        "type": "input",
        "key": "hideExpression",
        "className": "row",
        "props": {
          "label": "Hide Expression",
          "placeholder": "Hide Expression"
        }
      },
      //  ?                Select Api call
      // {
      //   "fieldGroup": [
      //     {
      //       "type": "select-input",
      //       "key": "props.optionsDataSource.collectionName",
      //       "className": "row",
  
      //       "props": {
      //         "label": "From Collection Name",
  
      //         "Collections": "model_config",
      //         "labelProp": "model_name",
      //         "valueProp": "collection_name",
  
      //         "multifilter_condition": {
      //           "clause": "AND",
      //           "conditions": [
      //             {
      //               "column": "is_collection",
      //               "operator": "EQUALS",
      //               "type": "string",
      //               "value": "Yes"
      //             }
      //           ]
      //         },
      //         "placeholder": "From Collection Name"
      //       }
      //     },
      //     {
      //       "key": "labelChange",
      //       "type": "checkbox",
      //       "props": { "label": "Is the label in more than one field?" }
      //     },
      //     {
      //       "key": "props.fullObject",
      //       "type": "checkbox",
      //       "props": { "label": "Does value need to be completely attached ?" }
      //     },
  
      //     {
      //       "type": "select-input",
      //       "key": "props.labelProp",
      //       "className": "row",
      //       "parentKey": "props.optionsDataSource.collectionName",
      //       "props": {
      //         "label": "Display Value",
      //         "placeholder": "Display Value",
      //         "multifiltertype": "Simple",
      //         "labelProp": "json_field",
      //         "valueProp": "json_field",
      //         "optionsDataSource": {
      //           "collectionName": "data_model"
      //         },
      //         "multifilter_condition": {
      //           "clause": "AND",
      //           "conditions": [
      //             {
      //               "column": "model_name",
      //               "operator": "EQUALS",
      //               "type": "string",
      //               "value": ""
      //             }
      //           ]
      //         }
      //       },
      //       "hideExpression": "model?.labelChange"
      //     },
      //     {
      //       "type": "select-autocomplete",
      //       "key": "props.labelPropTemplates",
      //       "className": "row",
      //       "props": {
      //         "parent": {
      //           "key": "props.optionsDataSource.collectionName",
      //           "filter": [
      //             {
      //               "column": "model_name",
      //               "operator": "EQUALS",
      //               "valuetype": "get",
      //               "type": "string",
      //               "value": "props.optionsDataSource.collectionName"
      //             }
      //           ]
      //         },
      //         "label": "Display Value",
      //         "placeholder": "Display Value",
      //         "ChildaddValue": "props.labelPropTemplate",
      //         "multifiltertype": "Simple",
      //         "labelProp": "json_field",
      //         "valueProp": "json_field",
      //         "optionsDataSource": {
      //           "collectionName": "data_model",
      //           "multiSelect": true
      //         }
      //       },
      //       "hideExpression": "!model?.labelChange"
      //     },
      //     {
      //       "type": "input",
      //       "key": "props.labelPropTemplate",
      //       "className": "row",
      //       "props": {
      //         "label": "Label Template"
      //       },
      //       "hideExpression": "!model?.labelChange"
      //     },
      //     {
      //       "type": "select-input",
      //       "key": "props.valueProp",
      //       "className": "row",
      //       "parentKey": "props.optionsDataSource.collectionName",
      //       "props": {
      //         "label": "Binding Value",
      //         "placeholder": "Binding Value",
  
      //         "multifiltertype": "Simple",
      //         "labelProp": "json_field",
      //         "valueProp": "json_field",
      //         "optionsDataSource": {
      //           "collectionName": "data_model"
      //         },
      //         "multifilter_condition": {
      //           "clause": "AND",
      //           "conditions": [
      //             {
      //               "column": "model_name",
      //               "operator": "EQUALS",
      //               "type": "string",
      //               "value": ""
      //             }
      //           ]
      //         }
      //       },
      //       "hideExpression": "model?.props?.fullObject"
      //     }
      //   ],
      //   "hideExpression": "!model?.optionsDataSource"
      // },
      //  ?                Input Value Check  

      {
        "fieldGroup": [
          {
            "type": "select-input",
            "key": "props.searchCollectionName",
            "className": "row",
  
            "props": {
              "label": "Check Collection Name",
  
              "Collections": "model_config",
              "labelProp": "model_name",
              "valueProp": "collection_name",
  
              "multifilter_condition": {
                "clause": "AND",
                "conditions": [
                  {
                    "column": "is_collection",
                    "operator": "EQUALS",
                    "type": "string",
                    "value": "Yes"
                  }
                ]
              },
              "placeholder": "Check Collection Name"
            }
          },
          {
            "type": "select-input",
            "key": "props.seachColumn",
            "className": "row",
            "parentKey": "props.searchCollectionName",
            "props": {
              "label": "Check Value",
              "placeholder": "Check Value",
  
              "multifiltertype": "Simple",
              "labelProp": "json_field",
              "valueProp": "json_field",
              "optionsDataSource": {
                "collectionName": "data_model"
              },
              "multifilter_condition": {
                "clause": "AND",
                "conditions": [
                  {
                    "column": "model_name",
                    "operator": "EQUALS",
                    "type": "string",
                    "value": ""
                  }
                ]
              }
            }
          }
        ],
        "hideExpression": "!model?.checkvalue"
      },
      //  ?                AutoComplete 

      // {
      //   "fieldGroup": [
      //     {
      //       "type": "select",
      //       "key": "props.controlType",
      //       "className": "flex-6",
      //       "props": {
      //         "label": "Control Type",
      //         "placeholder": "Control Type",
      //         "options": [
      //           {
      //             "label": "Select",
      //             "value": "select"
      //           },
      //           {
      //             "label": "Auto Complete",
      //             "value": "autoComplete"
      //           }
      //         ]
      //       },
      //       "defaultValue": "autoComplete"
      //     },
      //     {
      //       "type": "select-autocomplete",
      //       "key": "props.optionsDataSource.collectionName",
      //       "className": "row",
      //       "props": {
      //         "controlType": "autoComplete",
      //         "label": "Check Collection Name",
      //         "optionsDataSource": {
      //           "collectionName": "model_config",
      //           "infinityScroll": true
      //         },
      //         "filter": {
      //           "fixed": {
      //             "column": "is_collection",
      //             "operator": "EQUALS",
      //             "type": "string",
      //             "value": "Yes"
      //           }
      //         },
      //         "labelProp": "model_name",
      //         "valueProp": "collection_name",
      //         "placeholder": "Check Collection Name"
      //       }
      //     },
      //     {
      //       "fieldGroupClassName": "display-flex",
      //       "fieldGroup": [
      //         {
      //           "key": "props.optionsDataSource.multiSelect",
      //           "type": "checkbox",
      //           "className": "flex-6",
      //           "props": { "label": "Is Multi Select is Need" }
      //         },
      //         {
      //           "key": "props.optionsDataSource.infinityScroll",
      //           "type": "checkbox",
      //           "className": "flex-6",
      //           "props": { "label": "Is Virtual Scroll is Need" }
      //         }
      //       ]
      //     },
      //     {
      //       "type": "select-autocomplete",
      //       "key": "props.valueProp",
      //       "className": "row",
      //       "props": {
      //         "label": "Bind Value",
      //         "optionsDataSource": {
      //           "collectionName": "data_model",
      //           "infinityScroll": true
      //         },
      //         "parent": {
      //           "key": "props.optionsDataSource.collectionName",
      //           "filter": {
      //             "column": "model_name",
      //             "operator": "EQUALS",
      //             "type": "string",
      //             "value": "props.optionsDataSource.collectionName",
      //             "valuetype": "get"
      //           }
      //         },
      //         "labelProp": "json_field",
      //         "valueProp": "json_field",
      //         "placeholder": "Bind Value"
      //       }
      //     },
  
      //     {
      //       "type": "select-autocomplete",
      //       "key": "props.labelProp",
      //       "className": "row",
      //       "props": {
      //         "label": "Label Value",
      //         "optionsDataSource": {
      //           "collectionName": "data_model",
      //           "infinityScroll": true
      //         },
      //         "parent": {
      //           "key": "props.optionsDataSource.collectionName",
      //           "filter": {
      //             "column": "model_name",
      //             "operator": "EQUALS",
      //             "type": "string",
      //             "value": "props.optionsDataSource.collectionName",
      //             "valuetype": "get"
      //           }
      //         },
      //         "labelProp": "json_field",
      //         "valueProp": "json_field",
      //         "placeholder": "Label Value"
      //       }
      //     }
      //   ],
      //   "hideExpression": "!model?.autocomplete"
      // },
      {
        "type": "input",
        "key": "parentKey",
        "className": "row",
        "props": {
          "label": "Parent Key Name",
          "placeholder": "Parent Key Name"
        }
      },
      //  ?                Mat Prefix 
      {
        "fieldGroup": [
          {
            "type": "select",
            "key": "props.prefixType",
            "className": "flex-6",
            "props": {
              "label": "Prefix  Type",
              "placeholder": "Prefix Type",
              "options": [
                {
                  "label": "Icon",
                  "value": "icon"
                },
                {
                  "label": "Text",
                  "value": "text"
                }
              ]
            }
          },
          {
            "key": "props.searchableField",
            "type": "checkbox",
            "props": { "label": "Is Value Need To Be Compare" }
          },
          {
            "type": "select",
            "key": "props.patchtype",
            "className": "flex-6",
            "props": {
              "label": "Prefix Patch Type",
              "placeholder": "Prefix Patch Type",
              "options": [
                {
                  "label": "Simple",
                  "value": "Simple"
                },
                {
                  "label": "local",
                  "value": "local"
                },
                {
                  "label": "Linked",
                  "value": "Linked"
                }
              ]
            },
            "hideExpression": "model?.props?.searchableField && ! model?.props?.searchableField"
          },
  
          {
            "fieldGroupClassName": "display-flex",
            "hideExpression": "model?.props?.searchableField",
            "fieldGroup": [
              {
                "type": "select-input",
                "key": "props.searchCollectionName",
                "className": "flex-6",
  
                "props": {
                  "label": "Check Collection Name",
  
                  "Collections": "model_config",
                  "labelProp": "model_name",
                  "valueProp": "collection_name",
  
                  "multifilter_condition": {
                    "clause": "AND",
                    "conditions": [
                      {
                        "column": "is_collection",
                        "operator": "EQUALS",
                        "type": "string",
                        "value": "Yes"
                      }
                    ]
                  },
                  "placeholder": "Check Collection Name"
                }
              },
              {
                "type": "select-input",
                "key": "props.seachColumn",
                "className": "flex-6",
                "parentKey": "props.searchCollectionName",
                "props": {
                  "label": "Check Value",
                  "placeholder": "Check Value",
  
                  "multifiltertype": "Simple",
                  "labelProp": "json_field",
                  "valueProp": "json_field",
                  "optionsDataSource": {
                    "collectionName": "data_model"
                  },
                  "multifilter_condition": {
                    "clause": "AND",
                    "conditions": [
                      {
                        "column": "model_name",
                        "operator": "EQUALS",
                        "type": "string",
                        "value": ""
                      }
                    ]
                  }
                }
              }
            ]
          }
        ],
        "hideExpression": "!model?.prefixvalue"
      },

      {
        "fieldGroupClassName": "display-flex",
  
        "fieldGroup": [
          {
            "type": "input",
            "key": "props.max",
            "className": "flex-6",
            "props": {
              "type": "number",
              "label": "Max Number"
            },
            "hideExpression": "!model?.props?.type || model?.props?.type !== 'number'"
          },
          {
            "type": "input",
            "key": "props.min",
            "className": "flex-6",
            "props": {
              "type": "number",
              "label": "Min Number"
            },
            "hideExpression": "!model?.props?.type || model?.props?.type !== 'number'"
          }
        ]
      },
      {
        "fieldGroupClassName": "display-flex",
  
        "fieldGroup": [
          {
            "type": "input",
            "key": "props.minLength",
            "className": "flex-6",
            "props": {
              "type": "number",
              "label": "Max Length"
            },
            "hideExpression": "!model?.props?.type"
          },
          {
            "type": "input",
            "key": "props.maxLength",
            "className": "flex-6",
            "props": {
              "type": "number",
              "label": "Min Length"
            },
            "hideExpression": "!model?.props?.type"
          }
        ]
      },
      {
        "type": "input",
        "key": "props.pattern",
        "className": "row",
        "props": {
          "label": "Validation Pattern"
        },
        "hideExpression": "!model?.props?.type"
      },
      {
        "type": "checkbox",
        "key": "props.readonly",
        "className": "row",
        "props": {
          "label": "Is Readonly"
        }
      }
    ],

    // ],
      "hideExpression": "model?.jsonName =='formgroup'|| model?.multiform"
    },

    // ? OPtion
    {
      "fieldGroupClassName": "row",
      "hideExpression": "!model?.option",
      "fieldGroup": [
            {
              "key": "props.options",
              "type": "repeat",
              "props":{
            "label": "Options"
              },
              "fieldArray": {
                "fieldGroupClassName": "display-flex",
                "fieldGroup": [
                  // {
                  //   "fieldGroupClassName": "display-flex",
                  //   "fieldGroup": [
                      {
                        "type": "input",
                        "key": "label",
                        "className": "flex-6",
                        "props": {
                          "label": "Display Value",
                        }
                      },{
                        "type": "input",
                        "key": "value",
                        "className": "flex-6",
                        "props": {
                          "label": "Binding Value",
                        }
                      }
                  //   ]
                  // }
                  
                ]
              }
            }]
    }, 
        // ? Date And Time
    { "template": '<h2 style="text-align: center;" class="page-title">Date Configuration</h2>' ,
    "hideExpression": "!model?.dateattributes"},
    {

      "fieldGroupClassName": "row",
      "hideExpression": "!model?.dateattributes",
      "fieldGroup": [
        {
          "type": "select",
          "key": "props.attributes.hide",
          "className": "row",
          "props": {
            "label": "Custom Validation To Hide", 
            "options":[
              {
                label:"None",
                value:""
              },{
                "label":"Past Days",
                "value":"past_date"
              },{
                "label":"Future Days",
                "value":"future_date"
              },{
                "label":"D.O.B",
                "value":"dob"
              },
              ]
          }
          },{
            "type": "input",
            "key": "props.attributes.add_days",
            "className": "row",
            "props": {
              "label": "Add Number of Date", 
              "type":"number"
            }
            }
      ]
    }, 
      // ?Time
      { "template": '<h2 style="text-align: center;" class="page-title">Time Configuration</h2>' ,
      "hideExpression": "!model?.timeattributes"},
      {
  
    "fieldGroupClassName": "row",
    "hideExpression": "!model?.timeattributes",
    "fieldGroup": [
       {
        "type": "select",
        "key": "props.timeFormat",
        "className": "row",
        "props": {
          "label": "Choose Time Format", 
          "options":[
            {
              label:"None",
              value:""
            }, {
              "label":"12 Hrs",
              "value":12
            },{
              "label":"24 Hrs",
              "value":24
            },
            ]
        },"defaultValue":12
        },
        
{
  "fieldGroupClassName": "display-flex",
  "fieldGroup": [
        {
          "type": "time-input",
          "key": "props.attributes.min",
          "className":"flex-6",
          "props": {
          "label": "Start Time",
          "width":"150px",
          "height":"20px",
          }
        },
        {
          "type": "time-input",
          "key": "props.attributes.max",
          "className":"flex-6",
          "props": {
          "label": "End Time",
          "width":"150px",
          "height":"20px",
          }
        }
        ]
    }
    ]
      }

  ]
  // master-detail
  selected:any[]=[]
  // ?OBJECT  STRUCTRUE 
  // ?Config Stringfy
  formGroup:FormGroup= new FormGroup({
    _id:new FormControl('',[Validators.required]),
    name:new FormControl('',[Validators.required]),
    status:new FormControl("A",[Validators.required]),
    type:new FormControl("Form",[Validators.required]),
    config:new FormGroup({
            pageHeading:new FormControl('',[Validators.required]),
            formType:new FormControl("simpleform",[Validators.required]),
            onCancelRoute:new FormControl('' ,[Validators.required]),
            editMode: new FormControl("popup",[Validators.required]),
            token_need_to_set:new FormControl(false),
            form:new FormGroup({
                  collectionName:new FormControl('',[Validators.required]),
                  fields:new FormControl( '',[Validators.required])
              }),
    })
  })
  ngOnInit(): void {
    // this.onDragDrop$.subscribe(this.onDrop);
    this.onDragDrop$.subscribe(event => this.onDrop(event,this));

    this.navItems=[
      {
        "displayName": "Standard",
        "children": [
           {
            "displayName": "Input",
            "iconName": "../../../../assets/images/requriement.svg",
            "jsonName":"input",
            "templateName":"Input", 
          },   {
            "displayName": "Select",
            "iconName": "../../../../assets/images/requriement.svg",
            "jsonName":"select",
            "templateName":"Select", 
                "option":true
          }, 

          {
            "displayName": "Data & Time",
            "iconName": "../../../../assets/images/requriement.svg",
            "jsonName":"datetime-input" , 
            "templateName":"Data & Time Picker",
            "dateattributes":true
          },{
          "displayName": "Date Only",
          "iconName": "../../../../assets/images/requriement.svg",
          "jsonName":"date-input", 
          "templateName":"Data Picker",
          "dateattributes":true
        },{
          "displayName": "Time Only",
          "iconName": "../../../../assets/images/requriement.svg",
          "jsonName":"time-input", 
          "templateName":"Time Picker",
          "timeattributes":true
        },
      {
        "displayName": "Radio Button",
        "iconName": "../../../../assets/images/requriement.svg",
        "jsonName":"radio", 
        "templateName":"Radio Button",
        "option":true
      }, 
       {
        "displayName": "CheckBox",
        "iconName": "../../../../assets/images/requriement.svg",
        "jsonName":"checkbox", 
        "templateName":"CheckBox"
      },
       {
        "displayName": "Multi CheckBox",
        "iconName": "../../../../assets/images/requriement.svg",
        "jsonName":"multicheckbox", 
        "templateName":"Multi CheckBox",
        "option":true
      },
      {
          "displayName": "File Input",
          "iconName": "../../../../assets/images/requriement.svg",
          "jsonName":"file-input", 
          "templateName":"File Input"
        },{
          "displayName": "Textarea",
          "iconName": "../../../../assets/images/requriement.svg",
          "jsonName":"textarea",
          "templateName":"Textarea"
        }
        ]
      },
      {
        "displayName": "Custom",
        "children": [
        {
          "displayName": "AutoComplete",
          "iconName": "../../../../assets/images/requriement.svg",
          "jsonName":"select-autocomplete",
          "templateName":"AutoComplete", 
          "autocomplete":true,
        }, 
         {
          "displayName": "Input Check With Api Call",
          "iconName": "../../../../assets/images/requriement.svg",
          "jsonName":"input-text-enterkey" ,
          "hint":"Input Check With Api Call",
          "templateName":"Input Check",
          "checkvalue":true, 
        }
        ,{
          "displayName": "Prefix",
          "iconName": "../../../../assets/images/requriement.svg",
          "jsonName":"matprefix-input" , 
          "templateName":"Prefix Input",
          "prefixvalue":true, 
        },
        {
        "displayName": "Dynamic Select",
        "iconName": "../../../../assets/images/requriement.svg",
        "jsonName":"select-input" ,
        "hint":"This Select Used For Reciving Data For Relation Mapping.", 
        "templateName":"Dynamic Select",
        "optionsDataSource":true,
         
        },
        {
        "displayName": "Multi Select",
        "iconName": "../../../../assets/images/requriement.svg",
        "jsonName":"select-input" ,
        "hint":"This Select Used For Reciving Data For Relation Mapping.", 
        "templateName":"Multi Select",
        "optionsDataSource":true,
        props:{ 
          multiple:true
        }
        },{
          "displayName": "HTML Input",
          "iconName": "../../../../assets/images/requriement.svg",
          "jsonName":"html-input",
          "templateName":"HTML Input"
        }
        
        ]
      }, {
        "displayName": "Location",
        "children": [
          {
            "displayName": "Google",
            "iconName": "../../../../assets/images/requriement.svg",
            "jsonName":"location" ,
            "hint":"This Used For Getting Lat ,long", 
            "showsearchbar": true,
            "draggable": true, 
            "templateName":"Google",
            "location":true
            },
            {
            "displayName": "Leaflet",
            "iconName": "../../../../assets/images/requriement.svg",
            "jsonName":"map" ,
            "hint":"This Used For Getting Lat ,long", 
            "templateName":"Leaflet", 
            "showsearchbar": true,
            "draggable": true,
            "location":true
            }

        ]},
      {
          "displayName": "Container",
          "children": [
            {
              "displayName": "Row",
              "iconName": "../../../../assets/images/requriement.svg",
              "jsonName":"formgroup", 
              "fieldGroup":[]
            }  ,{
              "displayName": "Tab",
              "iconName": "../../../../assets/images/requriement.svg",
              "static":"multiform", 
              "templateName":"Tab Container" ,
              "jsonName":"tab-input", 
              "fieldGroup":[  {
                id:uuidv4(),
                type:"multiform",
                "multiform":true,
                "fieldGroup": []
              }],
              "multiform":true,
              "multiforms":true
            },  {
              "displayName": "Stepper",
              "iconName": "../../../../assets/images/requriement.svg",
              "static":"multiform", 
              "templateName":"Stepper Container" ,
              "jsonName":"stepper", 
              "fieldGroup":[  {
                id:uuidv4(),
                type:"multiform",
                "multiform":true,
                "fieldGroup": []
              }],
              "multiform":true,
              "multiforms":true
            },
          ]
        },
      ]
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
    this.dataservices.getDataByFilter("model_config", filterCondition1).subscribe((res: any) => {
        this.selected = res.data[0].response.map((response: any) => {
          return {
            model_name: response.model_name
              .replace(/_/g, " ")
              .toUpperCase()
              .replace(/_/g, " "),
            value: response.collection_name,
          };
        });
      });


      if(this.route.snapshot.paramMap.has('id')){
        this.dataservices.getDataById('screen',this.route.snapshot.paramMap.get('id')).subscribe((res: any)=>{
          console.log(res);
          let data:string = res.data[0]['config']
          res.data[0]['config'] = JSON.parse(res.data[0]['config'])
        let jsonString = data.replace(/"templateOptions"/g, '"props"');
          let value = this.dragdrop.formly_to_raw(JSON.parse(jsonString)['form']['fields'])
       console.log("CHANGE",value);
       this.data = value;  
          this.formGroup.patchValue(res.data[0]);
        })
      }
    }

    filterClick(){
      if(this.Collection){
        this.dialogService.openDialog(this.FilterPopup,null,null)
      }
    }

    ondragEnter(event: any){
        event?.toElement.classList.add("cdk-drop-list-dragging")
        event.preventDefault();      
    }
    onDragleave(event: any) {
      event?.fromElement.classList.remove("cdk-drop-list-dragging") 
      event.preventDefault();      
    }
  closesidenv() {
    this.collapsed = false
  }
  onDragStart(event: DragEvent, draggedObject: any) {
    event?.dataTransfer?.setData("data", JSON.stringify(draggedObject));
  }

  onDragOver(event: any) {
    event.preventDefault();  
    
  }

    itemDetele(value: any) {
      const findAndDelete = (data: any[], id: string, parentId: string | null) => {
        if (!parentId) {
          const index = data.findIndex(item => item.id === id);
          if (index > -1) {
            data.splice(index, 1);  
            return true; 
          }
        } else {
          const parentIndex = data.findIndex(item => item.id === parentId);
          if (parentIndex > -1) {
            const childIndex = data[parentIndex].fieldGroup?.findIndex((item: any) => item.id === id);
            if (childIndex > -1) {
              data[parentIndex].fieldGroup.splice(childIndex, 1);  
              return true;  
            }
          }
        }
        for (const item of data) {
          if (item.fieldGroup && findAndDelete(item.fieldGroup, id, parentId)) {
            return true;  
          }
        }
        return false;  
      };
      const deleted = findAndDelete(this.data, value.id, value.parentId);
      if (!deleted) {
        console.error('Item to delete not found.', value);
      }
    }
    // ? Due to option changes
    clonefield:any[]=[]
  action(event:any){
    this.model={}
    this.clonefield=[]
    if(event.action =='delete'){
      this.itemDetele(event)
      return
    } 
    
    if(event.action =='addsubform'){
      console.log("sub Form");
      event['fieldGroup'].push(
        {
          id:uuidv4(),
          type:"multiform",
          "multiform":true,
          "fieldGroup": []
        }
      )
      return
    }
    // this.model=_.cloneDeep(event)
    this.model=event
    this.clonefield=_.cloneDeep(this.fields)
    
    this.drawer.open()
  }
  
  get Collection(){
    return (_.hasIn(this.model,'autocomplete') || _.hasIn(this.model,'optionsDataSource') ) ? (_.get(this.model,'autocomplete') || _.get(this.model,'optionsDataSource') ) : false
  }

  applyData(){
    console.log(this.model);
    console.log(this.form.value); 
    this.drawer.close()
  }
  saveFilter(event:any,model:any){
    console.log(event);
    console.log(model);
    _.set(this.model,'props.multifilter',event['grp'])
    console.log(model);
console.warn(model);

  }
  onDrop(event: any,ctrl?:any) { 
      let dragedData: any = event?.dataTransfer?.getData("data");
      let data: any = _.isEmpty(dragedData) ? '' : JSON.parse(dragedData);
  if (_.isEmpty(data)) {
    if(event.container.data['jsonName'] == 'tab-input' || event.container.data['jsonName'] == "stepper"){
      // ( item.data.jsonName == "formgroup" ||item.data.jsonName == "tab-input" ||item.data.jsonName == "stepper" ||item.data.jsonName == "multiform")
      this.dialogService.openSnackBar("NOT INSERTED","OK")
      ctrl.dialogService.openSnackBar("NOT INSERTED","OK")
      return
    }
    if(!Array.isArray(event?.container?.data)){
      // ( item.data.jsonName == "formgroup" ||item.data.jsonName == "tab-input" ||item.data.jsonName == "stepper" ||item.data.jsonName == "multiform")
      // this.dialogService.openSnackBar("NOT INSERTED","OK")
      this.dialogService.openSnackBar("NOT INSERTED","OK")
      ctrl.dialogService.openSnackBar("NOT INSERTED","OK")
      return
    }
    
    console.log(event.previousContainer.data,
      event.container.data,
      event.previousIndex,
      event.currentIndex);
    
       if (event.container === event.previousContainer) {
        moveItemInArray(
          event.container.data,
          event.previousIndex,
          event.currentIndex
        );
      } else {
        if(event?.container?.id == "parent"){
          delete event.previousContainer['data'][event.previousIndex]['parentId']
        }else{
          event.previousContainer['data'][event.previousIndex]['parentId'] =  event?.container?.id || event?.container?.element?.nativeElement?.id
        }
        transferArrayItem(
          event.previousContainer.data,
          event.container.data,
            event.previousIndex,
            event.currentIndex
        );
      }
    return
    let values = JSON.parse(event?.dataTransfer?.getData("dragdata") || '');

          this.drag_drop(event, values);
          return;
      }
      data['id'] = uuidv4();
      let Id = event.toElement.id;
      event.toElement.classList.remove("cdk-drop-list-dragging")

      // if(data?.jsonName== "repeat" &&! _.hasIn(data.fieldArray,'id')){
      //   data.fieldArray["id"]= uuidv4();
      // }

      if (Id !== '') {
          if (Id == 'parent') {
              this.data.push(data);
              return;
          }
          let dataIndex = this.data.findIndex(val => val.id === Id);
          let foundChildData: any = -1;
          let type: any = '';
          let parentIndex: any = -1;
          let childIndex: any = -1;
          if (dataIndex == -1) {

            const flattenNestedData = (data: any[]): any[] => {
              return data.flatMap((item) => {
                  if (!item.hasOwnProperty('fieldGroup') && !item.hasOwnProperty('fieldArray')) {
                      return item;
                  }
          
                  let nestedItems = [];
                  if (item.hasOwnProperty('fieldGroup') && !_.isEmpty(item.fieldGroup)) {
                      nestedItems = flattenNestedData(item.fieldGroup);
                  }
                  if (item.hasOwnProperty('fieldArray') && !_.isEmpty(item.fieldArray.fieldGroup)) {
                      nestedItems = nestedItems.concat(flattenNestedData(item.fieldArray.fieldGroup));
                  }
          
                  return [item, ...nestedItems];
              });
          };
          
          const flattenedData  = flattenNestedData(this.data);
              // const flattenedData = this.data.flatMap((item) => {
              //     if (item.hasOwnProperty('fieldGroup') && !_.isEmpty(item.fieldGroup)) {
              //         return [item, ...item.fieldGroup];
              //     }
              //     if (item.hasOwnProperty('fieldArray') && !_.isEmpty(item.fieldArray.fieldGroup)) {
              //       return [item, ...item.fieldArray.fieldGroup];
              //   }
              //     return item;
              // });
              dataIndex = flattenedData.findIndex(val => val.id === Id);
              foundChildData = flattenedData[dataIndex];

              if(!_.isEmpty(foundChildData) &&foundChildData.hasOwnProperty('fieldGroup') ){
                foundChildData.fieldGroup.push(data)
                return
              }
              type = 'child';
              if (!_.isEmpty(foundChildData)) parentIndex = this.data.findIndex((val) => val.id === foundChildData.parentId);
              if (parentIndex != -1 && !_.isEmpty(this.data[parentIndex]['fieldGroup'])) childIndex = this.data[parentIndex]['fieldGroup'].findIndex((val: any) => val.id == Id);
          }
          if (dataIndex !== -1) {
              if (!_.isEmpty(foundChildData) && type == 'child') {
                  data['parentId'] = foundChildData.id;
                  if (foundChildData.hasOwnProperty('parentId') && foundChildData.hasOwnProperty('fieldGroup')) {
                      if (this.data[parentIndex]['fieldGroup'][childIndex].id == foundChildData.id) {
                          this.data[parentIndex]['fieldGroup'][childIndex]['fieldGroup'].push(data);
                      }
                  }
                  else if (foundChildData.hasOwnProperty('parentId')) {
                      if (foundChildData.jsonName != 'formgroup') {
                          data['parentId'] = foundChildData.parentId;
                          this.data[parentIndex]['fieldGroup'].push(data);
                      }
                      else {
                          this.data[parentIndex]['fieldGroup'][childIndex]['fieldGroup'].push(data);
                      }
                  }
              }
              else if (this.data[dataIndex]?.hasOwnProperty('fieldGroup') && type != 'child') {
                  data['parentId'] = Id; 
                  if(this.data[dataIndex]['jsonName'] == 'tab-input' || this.data[dataIndex]['jsonName'] == "stepper" || !this.data[dataIndex]?.hasOwnProperty('fieldGroup')){
                    this.dialogService.openSnackBar("NOT INSERTED","OK")
                    return
                  }
                  // this.data[dataIndex]['fieldGroup'].push(data);
                  this.data[dataIndex]['fieldGroup'].push(data);
              }
          }
      } else {
          this.data.push(data);
      }
      event?.dataTransfer?.clearData?.();
  } 
  
  drag_drop(event:any,value:any){
    let oldData =_.cloneDeep(value)
    let transferId = event.toElement.id
    let parentIndex = this.data.findIndex(data => data.id ==  transferId ) ;
    if(parentIndex != -1 || transferId == 'parent'){
    value.id=uuidv4()
    delete value.parentId
    if( parentIndex != -1 &&  _.hasIn(this.data[parentIndex],'fieldGroup')){
      value.parentId=this.data[parentIndex].id
      this.data[parentIndex]['fieldGroup'].push(value)
    }else{
      if(transferId == 'parent'){
        this.data.push(value)
      }else{
      this.data.splice(parentIndex+1,0,value)
    }
    }
    if(!_.isEmpty(oldData)){
      this.itemDetele(oldData)
    }
  }else{
    const itemPath = findItemPath(this.data,transferId);
    console.log('Path to the item:', itemPath);
    if (itemPath) {
      value.id=uuidv4()
      delete value.parentId
      if( parentIndex != -1 &&  _.get(this.data,itemPath)){
        value.parentId=this.data[parentIndex].id
        // this.data[parentIndex]['fieldGroup'].push(value)
      }
      // ? The Set value
      let d =_.set(this.data,itemPath,value)
      console.warn(d);

      function modelvalue(data:any,path:any){
        return data[path]
      }
        const item = modelvalue(this.data,itemPath);
        console.error('Found item:', item);
        if(!_.isEmpty(oldData)){
          this.itemDetele(oldData)
        }
    }
  }
    
  function findItemPath(data:any, targetId:any, path = '') {
  for (let i = 0; i < data.length; i++) {
      if (data[i].id === targetId) {
          // Found the target item, return the constructed path
          return `${path}[${i}]`;
      } else if (data[i].fieldGroup && data[i].fieldGroup.length) {
          // Continue searching in the next level of fieldGroup
          const foundPath:any = findItemPath(data[i].fieldGroup, targetId, `${path}[${i}]["fieldGroup"]`);
          if (foundPath) return foundPath;
      }
  }
  // Return null if the item wasn't found
  return null;
  }
    // DELETE

    event?.dataTransfer?.clearData?.();

  }
 
  preview(){
    console.log(this.data);
    
    this.formlyField=[...this.dragdrop.Raw_to_formly(this.data)]
    console.log("AFTER",this.formlyField);
    this.formlmodel={}
    this.dialogService.openDialog(
      this.editViewPopup,
      "50%",
      null,
      {}
    );
    this.formlform.markAsUntouched()

  }

  save(){
    
    ((this.formGroup.get('config')as FormGroup).get('form') as FormGroup).get("fields")?.setValue([...this.dragdrop.Raw_to_formly(this.data)])
    // console.log([...this.dragdrop.Raw_to_formly(this.data)]);
    
    if(!this.formGroup.valid ||_.isEmpty(this.data)){
      this.dialogService.openSnackBar("Missing Required Fields","OK")
      return
    }

    let formValue =this.formGroup.getRawValue()
    console.log(formValue);
    
    formValue.config = JSON.stringify(formValue.config)
    console.log(formValue);

    let id =formValue._id
    delete formValue._id
    this.dataservices.update('screen',id,formValue).subscribe((res:any)=>{
      console.log(res);
      this.dialogService.openSnackBar(res.data)
      this.router.navigateByUrl('list/screen')
    })
  }
 
@HostListener('window:ressize', ['$event'])
onResize(event: any) {
  this.screenwidth = window.innerWidth;
  if (this.screenwidth <= 768) {
    this.collapsed = false
  }
}

togglecollapse(menuItem?: boolean) {
  if (!menuItem) {
    this.collapsed = !this.collapsed
  }

}



// dragging = false;
// @HostListener('document:mousemove', ['$event'])
// onMouseMove(event: MouseEvent) {
//   if (this.dragging) {
//     const sidebarWidth = event.pageX + 2;
//     const mainLeft = event.pageX + 2;
//     console.log(event.pageX);
//     console.log(event);
//     console.error((window.innerWidth - event.pageX + 2 ));
    
//     this.setSidebarWidth(sidebarWidth);
//     this.setMainLeft(mainLeft);
//   }
// }

// //#region  //? Dragging
// @HostListener('document:mouseup')
// onMouseUp() {
//   if (this.dragging) {
//     this.dragging = false;
//     this.removeGhostBar();
//   }
// }

// onMouseDown(event: MouseEvent) {
//   event.preventDefault();
//   this.dragging = true;
//   this.createGhostBar(event.pageX);
// }

// createGhostBar(left: number) {
//   const ghostBar = document.createElement('div');
//   ghostBar.id = 'ghostbar';
//   ghostBar.style.width = '3px';
//   ghostBar.style.backgroundColor = '#000';
//   ghostBar.style.opacity = '0.5';
//   ghostBar.style.position = 'absolute';
//   ghostBar.style.cursor = 'col-resize';
//   ghostBar.style.zIndex = '999';
//   ghostBar.style.left = left + 'px';
//   ghostBar.style.height = '100%';
//   document.body.appendChild(ghostBar);
// }

// removeGhostBar() {
//   const ghostBar = document.getElementById('ghostbar');
//   if (ghostBar) {
//     ghostBar.remove();
//   }
// }

// setSidebarWidth(width: number) {
//   const sidebar = document.getElementById('sidebar');
//   if (sidebar) {
//     sidebar.style.width = width + 'px';
//     console.warn(sidebar);
    
//     // sidebar.style.left = width + 'px';
//   }
// }

// setMainLeft(left: number) {
//   const main = document.getElementById('main');
//   if (main) {
//     // main.style.left = left + 'px';
//   }
// }
// dragging = false;

// onMouseMove(event: MouseEvent) {
//   if (this.dragging) {
//     const drawerWidth = event.pageX + 2;
//     this.setDrawerWidth(drawerWidth);
//   }
// }

// onMouseUp() {
//   if (this.dragging) {
//     this.dragging = false;
//   }
// }

// onMouseDown(event: MouseEvent) {
//   event.preventDefault();
//   this.dragging = true;
// }

// setDrawerWidth(width: number) {
//   const drawer = document.getElementById('drawer');
//   if (drawer) {
//     drawer.style.width = width + 'px';
//   }
// }

// //#endregion
// dragging = false;

// onMouseMove(event: MouseEvent) {
//   if (this.dragging) {
//     const drawer = document.getElementById('drawer');
//     if (drawer) {
//       const drawerRect = drawer.getBoundingClientRect();
//       let addwidth = window.innerWidth - event.pageX + 2 
//       const newWidth = drawerRect.left +addwidth
//       drawer.style.width = newWidth + 'px';
//     }
//   }
// }

// onMouseUp() {
//   this.dragging = false;
// }

// onMouseDown() {
//   this.dragging = true;
// }

// dragging = false;
//   startX: number = 0;
//   initialWidth: number = 0;

//   onMouseMove(event: MouseEvent) {
//     if (this.dragging) {
//       const deltaX = event.pageX - this.startX;
//       const newWidth = this.initialWidth + deltaX;
//       this.setDrawerWidth(newWidth);
//     }
//   }

//   onMouseUp() {
//     if (this.dragging) {
//       this.dragging = false;
//     }
//   }

//   onMouseDown(event: MouseEvent) {
//     this.dragging = true;
//     this.startX = event.pageX;
//     this.initialWidth = this.getDrawerWidth();
//   }

//   setDrawerWidth(width: number) {
//     const drawer = document.getElementById('drawer');
//     if (drawer) {
//       drawer.style.width = width + 'px';
//     }
//   }

//   getDrawerWidth(): number {
//     const drawer = document.getElementById('drawer');
//     if (drawer) {
//       const drawerStyle = window.getComputedStyle(drawer);
//       return parseFloat(drawerStyle.width);
//     }
//     return 0;
//   }
}

