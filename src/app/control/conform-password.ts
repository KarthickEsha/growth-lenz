import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { FieldType } from '@ngx-formly/core';

@Component({
    selector: 'app-passwords-match-field',
    template: `
    <mat-form-field style="width: 100%" appearance="outline">
    <mat-label>{{field.props!['label']}}</mat-label>
 <input type="password" matInput height="10px" minHeight="10px" [type]="hide ? 'password' : 'text'" [required]="this.required" (input)="updateModel($event)"  placeholder={{placeholder}}  [formControl]="thisFormControl">
 <mat-icon matSuffix (click)="hide = !hide">{{hide ? 'visibility_off' : 'visibility'}}</mat-icon>
 </mat-form-field>
 <mat-error style="font-size: 12px; text-align:start; margin-top:-3%;" *ngIf="!passwordsMatch">{{ error }}</mat-error>      
  `,

    //  <mat-error style="font-size: 12px;" *ngIf="oldValue != currentValue">{{error}}</mat-error>
    //   <mat-error *ngIf="this.field.props?.required">{{this.field.props?.label}} is required</mat-error>
})
export class PasswordsMatchFieldComponent extends FieldType implements OnInit {
    constructor() {
        super();
    }
    hide: boolean = true;
    matchfield: any
    error: any
    oldValue: any
    currentValue: any
    placeholder: any
    required: any
    passwordsMatch: boolean = true;
    public get thisFormControl() {
        return this.formControl as FormControl;
    }
    ngOnInit(): void {
        this.required = this.field.props?.required
        this.error = this.field.props?.['errorMessage']
        this.placeholder = this.field.props?.['placeholder']

    }

    updateModel(event: any) {

        this.checkPassword(event.target.value);
    }

    checkPassword(event: any) {
        this.matchfield = this.field.props?.attributes
        this.oldValue = this.field.model[this.matchfield]
        this.currentValue = event

        this.passwordsMatch = this.oldValue === this.currentValue || (!this.oldValue || !this.currentValue);
    }
}
