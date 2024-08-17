

import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { FieldType } from '@ngx-formly/core';

@Component({
  selector: 'password-input',
  template: `
 
 <mat-form-field style="width: 100%" appearance="outline">
                <input
                  matInput
                  [formControl]="thisFormControl"
                  placeholder={{placeholder}}
                  [type]="hide ? 'password' : 'text'"
                  type="password"
                  required
                /><mat-icon matSuffix (click)="hide = !hide">{{hide ? 'visibility_off' : 'visibility'}}</mat-icon>
                
              </mat-form-field>
              <!-- <mat-error style="font-size: 12px;">{{error}}</mat-error>  -->
       
  `,
})
export class PasswordInput extends FieldType<any> implements OnInit {

  hide: boolean = true;
  public get thisFormControl() {
    return this.formControl as FormControl;
  }

  error: any
  placeholder: any
  ngOnInit(): void {
    debugger
    this.error = this.field.props?.['errorMessage']
    this.placeholder = this.field.props?.['placeholder']
  }


}