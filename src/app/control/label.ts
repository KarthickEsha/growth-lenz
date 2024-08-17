import { Component, OnInit } from '@angular/core';
import { FieldType, FormlyFieldConfig } from '@ngx-formly/core';
import { DatePipe } from '@angular/common';
@Component({
  selector: 'label',
  template: `
    <div *ngIf="this.display=='text'"   style="margin: 10px;display:flex;flex-direction:row">
    <div style=" font-weight: bold;width:{{width}};height:{{height}}">{{this.field.props?.label}}</div>
    <div *ngIf="displayType =='text'">: {{getValue()}}</div>
    <div *ngIf="displayType !='text'" [innerHtml]="getValue()"></div>
    </div>

    <div *ngIf="this.display=='label'" style="margin-left:16px">{{this.field.props?.label}}</div>
  `
})
export class LabelView extends FieldType implements OnInit {
  displayType = 'text'
  opt: any;
  date: any
  width = "150px"
  height = "20px"
  display:any='text'
  constructor(
    private datePipe: DatePipe
  ) {
    super();
  }
  ngOnInit(): void {
    debugger
    this.opt = this.field.props || {};
    this.width = this.opt.width || "150px"
    this.height = this.opt.height || "20px"
    this.displayType = this.opt.inputType || 'text'
    this.display=this.opt.display || "text"
  }
  getValue() {
    this.date = this.field.props?.attributes
   
    if (this.date?.pipe == "date") {
      let key = this.field.key as string
      let date = this.field.model[key]
      return this.datePipe.transform(date, ("dd-MM-YYYY h:mm a"))
    }
    else {
      return this.formControl?.value
    }
  }

  getlabel(){
    debugger
   

  }
}
