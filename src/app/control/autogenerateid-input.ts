
import { Component, OnInit } from '@angular/core';
import { DataService } from '../services/data.service';
import { FormControl } from '@angular/forms';
import { FieldType } from '@ngx-formly/core';



@Component({
 selector: 'autogenerateid-input',
 template: `
    <input
      *ngIf="this.field.type !== 'number'; else numberTmp"
      matInput
      #input
      [id]="id"
      [type]="this.field.type || 'text'"
      [readonly]="to.readonly"
      [required]="to.required"
      [formControl]="formControl"
      [formlyAttributes]="field"
      [tabIndex]="to.tabindex"
      [placeholder]="to.placeholder"
      (keydown.enter)="frmSubmit($event,field)"
      (input)="inputEvent(input, $event)"
      (focus)="onFocus($event)"
    />
    <ng-template #numberTmp>
      <input
        matInput
        [id]="id"
        type="number"
        [readonly]="to.readonly"
        [required]="to.required",
        [formControl]="FormControl"
        [formlyAttributes]="field"
        [tabIndex]="to.tabindex"
        [placeholder]="to.placeholder"
        (keydown.enter)="frmSubmit($event,field)"
        (focus)="onFocus($event)"
      />
    </ng-template>
 `,
})
export class AutogenerateId extends FieldType<any> implements OnInit {
  
  constructor(private dataService:DataService){
    super();
  }

   ngOnInit() {
   //this.getAutoNumber();
    if(!this.field.props?.isEdit) {
      this.getAutoNumber();
    } else {
      this.field.props.readonly = true
    }
  }
  public get FormControl() {
    return this.formControl as FormControl;
  }
  frmSubmit(event:any,field:any) {
    //debugger
    if (!field.props.onEnterSubmit) {
      try {
        let ctrl = event.currentTarget.form.elements[event.currentTarget.tabIndex+1]
        ctrl.focus()
        ctrl.click()
      } catch {

      }
      event.preventDefault()
      event.stopPropagation()
    }
  }

  frmLeave(value:any, field:any) {
    if(field.props.searchableField) {
      var filterQuery = {filter:[{
        clause: "AND",
        conditions: [
         {column: field.props.searchColumnName, operator: "EQUALS", value:value},
       ]
     }]}
     this.dataService.getDataByFilter(field.props.searchCollectionName,filterQuery).subscribe(
       (result:any) => {
         var list = result.data[0].response || [];
        //  field.parent.formControl.value[field.props.searchResult] = list;
         field.parent.formControl.get(field.props.columnName)._fields[0].props.options = list
       },
       error => {
           //Show the error popup
           console.error('There was an error!', error);
       }
     );
    }
  }

  getAutoNumber() {
    var opt = this.field?.props['autoId']
    if (opt) {
      this.field.formControl.setValue('[Auto Number]')
      this.field.props.readonly = true
    }
  }

  getValue(val:any,opt:any) {
    opt.suffix || ''
    var l = (opt.pattern || '000000').length
    return (opt.prefix || '') + val.toString().padStart(l, 0) + (opt.suffix || '')
  }

  onFocus(event:any) {
      setTimeout(()=>{
        event.target.select()
      }, 50);
  }

  inputEvent(input: any, event: any) {
  input.value = event.target.value.toUpperCase();
  }
}
