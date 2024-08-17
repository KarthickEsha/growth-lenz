import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { FieldType } from '@ngx-formly/core';

@Component({
  selector: 'formly-field-radio',
  template: `
    <div style="display: flex; align-items: center;">
      <div style="margin-right: 10px;">
        <h5>{{ label }}</h5>
      </div>
      <div>
        <ng-container>

          <input style="margin-left: 20px;" type="radio" [name]="'Simple'" [disabled]="disabled" (change)="setValue('Yes')" [checked]="values === 'Yes'" /> Yes
          <input style="margin-left: 20px;" type="radio" [name]="'Simple'"  [disabled]="disabled" (change)="setValue('No')" [checked]="values === 'No'" /> No
        </ng-container>
      </div>
    </div>
  `,
})
export class radiobutton extends FieldType implements OnInit {
  opt: any;
  label: any;
  values: any;
  disabled:any=false;
  ngOnInit(): void {
    this.opt = this.field.props || {};
    this.label = this.opt.label || '';
this.values=this.formControl.value  

  }

  setValue(type: any) {
    console.log(type);
    
    this.formControl.setValue(type);
  }
}
