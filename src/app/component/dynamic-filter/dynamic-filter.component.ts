
import { DataService } from 'src/app/services/data.service';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChange, SimpleChanges } from '@angular/core';
import * as moment from 'moment';

import { ActivatedRoute } from '@angular/router';
import * as _ from 'lodash';
@Component({
  selector: 'app-dynamic-filter',
  templateUrl: './dynamic-filter.component.html',
  styleUrls: ['./dynamic-filter.component.scss']
})
export class DynamicFilterComponent {
  dateBind: boolean = true
  projectData:any

  constructor(
    private dataService: DataService,

  ) { }
  @Input('filterOptions') filterOptions: any;
  @Input('listData') listData: any
  @Input('config') config: any
  @Input('showdefaultFilter') showdefaultFilter: any
  @Output('onClick') onClick = new EventEmitter<any>();
  @Output('filterValue') filterValue = new EventEmitter<any>();
  @Output('pdf') pdf = new EventEmitter<any>();

  ngOnInit(): void {
  




    /*
    Sample filter control option

    "filterOptions": [
      {
        "columnName": "pc_code",   --> Database column name
        "label":"Pickup Center",   --> Control Label
        "dataSource":"collection", --> Dropdown control options take from DB
        "collectionName":"pickup_center",
        "multiSelection": false,
        "labelProp":"name",
        "valueProp":"_id"
      },
      {
        "columnName": "customer_type",
        "label":"Customer type",
        "dataSource":"list",
        "multiSelection": false,
        "labelProp":"label",
        "valueProp":"value",
        "options":[
          {"label":"Credit Customer", "value":"Cr"},
          {"label":"Cash Customer", "value":"Cash"}
        ]
      }
    ],
     */
  }

  ngOnChanges(simpleChanges: SimpleChanges) {
    debugger
    if (this.filterOptions) {
      this.buildFilterOptions()
    }
  }

  buildFilterOptions() {
    debugger
    console.log(this.filterOptions);
    
    if (!this.filterOptions) return 
    this.filterOptions.forEach((op: any) => {
      if (op.dataSource == "collection") {
        this.dataService.getparentdata(op.collectionName).subscribe((res: any) => {
          op.options = res.data || []
        })
      }
      if (op.dataSource == "fixedfilter") {
        let filter = {filter:[{
          clause: this.config.filtercondition || "AND",
          conditions: this.config.dropdown_Filter
        }]}
        this.dataService.getDataByFilter(op.collectionName,filter).subscribe((res: any) => {
          op.options = res.data[0].response || []
        })
      }
if(op.dataSource == "emptyPayload"){
  let filter:any = {}
  if(op.switch_over == true){
    filter['filter']=[]
    filter['switch_over'] = true
  }
  this.dataService.getDataByFilter(op.collectionName,filter).subscribe((res: any) => {
    op.options = res.data[0].response || []
  })

}

      if (op.dataSource == "filter") {
        let conditions:any=[]
      this.dataService.makeFilterConditions(this.config.fixedFilter, conditions)
       if (conditions.length > 0){
        var filter_condition:any= {filter:[{
          clause: this.config.filtercondition || "AND",
          conditions: conditions
        }]}
       }
       
        this.dataService.getDataByFilter(op.collectionName,filter_condition).subscribe((res: any) => {
          op.options = res.data[0].response|| []
        })
      }
      
      
      else if (op.type == "datepicker" && op.addDays) {
        op.selectedValue = moment().add(op.addDays || 0, 'day')
      }
    });
  }

filteredOptions:any
filteredData(eneteredData:any) {
  
  // var conditions: any = []
  // this.filterOptions.forEach((opt: any) => {
  //   if (opt.selectedValue) {
  //  if (opt.type == 'autocomplete' && opt.selectedValue != "" || opt.type == 'text') {
  //       conditions.push({
  //         column: opt.columnName,
  //         operator: opt.operator,
  //         type: 'string',
  //         value: opt.selectedValue
  //       })
  //     }}})
  this.filteredOptions = this.projectData.filter((item:any) => {
    return item.project_name.toLowerCase().indexOf(eneteredData.toLowerCase()) > -1
  
  })
  

  // this.filterValue.emit(filterQuery);
}

  toggleSelectAll(event: any) {
    
    if (event.source.selected) {
      event.source._parent.options.map((e: any) => {
        e.select()
      });
    } else {
      event.source._parent.options.map((e: any) => {
        e.deselect()
      });
    }
  
  }

  applyFilter(event: any) {
    debugger
    const val = event.target.value
    this.filterValue.emit(val);
  }

  triggerFilter() {
    debugger
    //build the condition for all filters
    var filterQuery:any  = undefined
    var conditions: any = []
    //get filter condition from the selected/typed values
    this.filterOptions.forEach((opt: any) => {
      if (opt.selectedValue) {
        if (opt.type == 'select' && opt.selectedValue != "" || opt.type == "text") {
          conditions.push({
            column: opt.columnName,
            operator: opt.operator,
            type: 'string',
            value: opt.selectedValue
          })
        } else if (opt.type == "cascading_dropdown" || opt.type=="array_of_object") {
          conditions.push({
            column: opt.columnName,
            operator: opt.operator,
            type: 'string',
            value: opt.selectedValue
          })
        }  else if (opt.type == 'autocomplete' && opt.selectedValue != "" || opt.type == 'text') {
          
          // conditions = [
          //   {
              // clause: "AND",
                conditions.push({
                  column: opt.columnName,
                  operator: opt.operator,
                  type: 'string',
                  value: opt.selectedValue
                // }]
            })
          // ]
        }
        else if (opt.type == 'datepicker') {
          conditions.push({
            column: opt.columnName,
            operator: opt.operator,
            type: 'date',
            value: opt.selectedValue.format(opt.filterFormat)
          })
        } else if (opt.type == "data" && opt.selectedValue != "") {        //text filter type
          conditions.push({
            column: opt.columnName,
            operator: opt.operator,
            type: 'string',
            value: opt.selectedValue.charAt(0).toUpperCase() + opt.selectedValue.slice(1).trim()
          })
        } else {}
      }
    })

    if(this.config.fixed_filter == false){
      this.config.fixedFilter =[]
    }
    // Add fixed (always) filter condition
    this.dataService.makeFilterConditions(this.config.fixedFilter, conditions)
    if (conditions.length > 0) {
      filterQuery = [{
        clause: "AND",
        conditions: conditions
      }]
    }
    this.onClick.emit(filterQuery)
  }

  generatePdf() {
    this.pdf.emit(true)
  }

  onchange(data:any,filter:any){
    if(filter.onselect!=true) return
    let value=data[filter.valueProp]
let filter_option=this.filterOptions.find((op: any) => { return op.parent_key})

 
  if (filter_option?.parent_key!=undefined) {
    var conditions: any = []
    conditions.push({
      column: filter_option['parent_column'],
      operator: filter_option['operator'],
      type: filter_option['data_type'] || 'string',
      value: value
    })
      let filter= {filter:[{
        clause: this.config.filtercondition || "AND",
        conditions: conditions
      }]}
    this.dataService.getDataByFilter(filter_option.parent_key_collectionName,filter).subscribe((res: any) => {
    let data= res.data
   if(data!=null){
    filter_option.options= res.data[0].response
     filter_option.selectedValue=''
   } else {
    filter_option.options=[]
    filter_option.selectedValue=''
   }
      
      // Remove the duplicate data
      if(filter_option.remove_duplicate == true && filter_option.options!=null){
        const uniqueObjects:any[] = [];
        const seenNames = new Set();
        filter_option.options.forEach((obj:any) => {
            if (!seenNames.has(obj.title)) {
                seenNames.add(obj.title);
                uniqueObjects.push(obj);
            }
        });
        filter_option.options=uniqueObjects
      }
    },
    error=>{
      filter_option.options = error.data
    })
  }

  // if(filter_array.parent_array!=undefined){
  //   var conditions: any = []
  //   conditions.push({
  //     column: filter_array['parent_column'],
  //     operator: filter_array['operator'],
  //     type: filter_array['data_type'] || 'string',
  //     value: value
  //   })
  //     let filter= {filter:[{
  //       clause: this.config.filtercondition || "AND", 
  //       conditions: conditions
  //     }]}
  //   this.dataService.getDataByFilter(filter_array.parent_key_collectionName,filter).subscribe((res: any) => {
  //    let data = res.data[0].response[0] || []

  //    filter_array.options=data[filter_array].parent_array
  //   },
  //   error=>{
  //     filter_option.options = error.data
  //   })
  // }

}


// currentPeriodClicked(data:any){
//   debugger
//   this.filterOptions.forEach((opt:any)=>{
//     if(opt.parent){
// opt.forEach(()=>)
//       opt["min"]=
//     }
//   })
// }


currentPeriodClicked(data: any) {
  debugger;
  this.filterOptions.forEach((opt: any) => {
    if (opt.parent) {
      const toDateFilter = this.filterOptions.find(
        (filter:any) => filter.label === opt.parent
      );
      if (toDateFilter) {
        opt.minDate = moment(toDateFilter.selectedValue).add(opt.min, "days").toDate();
      }
    }
  });
}

}
