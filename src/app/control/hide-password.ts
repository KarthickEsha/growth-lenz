import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { FieldType } from '@ngx-formly/core';

@Component({
  selector: 'app-hide-password',
  template: `
 
 <mat-form-field style="width: 100%" appearance="outline">
 <mat-label>{{this.field.props?.label}}</mat-label>
                <input
                  matInput
                  [formControl]="thisFormControl"
                  placeholder={{placeholder}}
                  [type]="hide ? 'password' : 'text'" 
                  type="password"
                  minlength="8"
                  maxlength="10"
                  [required]="this.required"
                  (input)="validateInput($event)"
                /><mat-icon matSuffix (click)="hide = !hide">{{
                  hide ? "visibility_off" : "visibility"
                }}</mat-icon>
                <mat-error *ngIf="thisFormControl.hasError('required')">{{this.field.props?.label}} is required</mat-error>
                <mat-error style="font-size:10px" *ngIf="thisFormControl.hasError('minlength')">
                Password must be 8 to 10 characters long
      </mat-error>
      <mat-error style="font-size:10px" *ngIf="thisFormControl.hasError('maxlength')">
        Password must be 8 to 10 characters long
      </mat-error>
      <mat-error *ngIf="this.thisFormControl.hasError('passwordNotMatch')">
    {{this.error}}
    </mat-error>
               <mat-error style="font-size:10px" *ngIf="thisFormControl.hasError('pattern')">{{this.validationMessage}}</mat-error>
              </mat-form-field>
       
  `,
})
export class HidePasswordFieldComponent extends FieldType implements OnInit {
  required: any
  validationMessage: any
  hide: boolean = true;
  error: any
  placeholder: any

  public get thisFormControl() {
    return this.formControl as FormControl;
  }

  ngOnInit(): void {

    this.validationMessage = this.field.props?.['errorMessage']
    this.required = this.field.props?.required
    this.error = this.field.props?.['errorMessage']
    this.placeholder = this.field.props?.['placeholder']
  }

  validateInput(value: any) {
    debugger
    let currentField: any = this.field.key
    let parentKey = this.field.props?.['parentKey']
    if(parentKey){
    if ((this.model[currentField] !== undefined && this.model[currentField] !== "")&& (this.model[parentKey] !== undefined && this.model[parentKey] !== "")) {
      if (value.target.value != this.model[parentKey]) {
        this.error = this.field.props?.['message']
        this.formControl.setErrors({passwordNotMatch:true})
      }

      if (value.target.value == this.model[parentKey]) {
        this.error = null
        this.formControl.setErrors(null)
        const parentControl = this.formControl?.parent?.get(parentKey);
        if (parentControl) {
          parentControl.setErrors(null);
        }
        
      }

    }
  }
  }

}