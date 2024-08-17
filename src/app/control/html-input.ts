import { Component, EventEmitter, Output, OnInit, AfterViewInit } from '@angular/core';
import { FieldType, FormlyFieldConfig } from '@ngx-formly/core';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'html-input',
  template: `
    <style>
    .header {
        margin-top: 100px;
        text-align: center;
        margin-bottom: 40px;
      }
      .html-header {
        margin: 15px 0 5px;
      }

      .html {
        border: 1px solid #ddd;
        border-radius: 4px;
        padding: 0.5rem;
        background-color: #f1f1f1;
        min-height: 20px;
        max-height: 10rem;
        overflow: auto;
      }

      </style>
     <div style="margin:15px 0px 20px 0px;background-color: white;width:100%">
    
    <span style="margin-left:14px">{{field.props!['label'] || "HTML"}}</span>

     <angular-editor height="50px" minHeight="50px"
        [formlyAttributes]="field"
        [formControl]="FormControl"
        [config]="editorConfig" (ngModelChange)="editorContentChanged($event)" [(ngModel)]="data" [required]=required></angular-editor>

        <div style="margin-top: 5px; color: #888; font-size: 12px;text-align: right;">
            {{ formControl.value ? text.length : 0 }}/{{ this.field.props?.maxLength }}
        </div>
        
  <mat-error *ngIf="text.length > maxLength">Maximum length exceeded.</mat-error>
        <!-- <mat-error *ngIf="this.field.props?.required && !this.formControl.value">{{validation.required}}</mat-error> -->
     </div>
     
  `
  // <mat-error *ngIf="FormControl.hasError('required')">{{this.field.props?.label}} is required</mat-error>

})
export class HtmlInput extends FieldType<any> implements OnInit {

  data: any
  required:any
  validation:any
  maxLength:any
  text:any=""

  hide = [
    'undo',
    'redo',
    'strikeThrough',
    'insertImage',
    'link',
    'unlink',
    'insertVideo',
    'insertHorizontalRule',
    'customClasses',
    'toggleEditorMode',
    // 'fontName'

  ]
  editorConfig: any = {
    editable: true,
    spellcheck: true,
    showToolbar: false,
    // sanitize: false,
    height: '5rem',
    minHeight: '3rem',
    placeholder: 'Enter text here...',
    translate: 'no',
    defaultParagraphSeparator: '',
    defaultFontName: '',
    defaultFontSize: '',
    toolbarHiddenButtons: [this.hide]
  }
  public get FormControl() {
    return this.formControl as FormControl;
  }
  ngOnInit() {
    let key = this.field.key as string
    this.data = this.field.model[key]
    this.required=this.field.props?.required || false
    this.validation=this.field.validation?.messages
    this.editorConfig.editable = !this.field.props?.disabled
    this.editorConfig.showToolbar = !this.field.props?.disabled
    this.maxLength = this.field.props?.maxLength
    // To remove  the html tags and  space (hexadecimal) value
    if(this.model[this.field.key] != undefined){
      this.text=this.data.replace( /(<([^>]+)>)/gi, '');
      this.text=this.text.replace( /(&#[0-9]+;)/gi, ' ')
    }
    
  }

  editorContentChanged(event: string): void {
  // To remove  the html tags and  space (hexadecimal) value
  if(event == "" || event == undefined)return
   this.text=event.replace( /(<([^>]+)>)/gi, '');
   this.text=this.text.replace( /(&#[0-9]+;)/gi, ' ')
  }

  
}
