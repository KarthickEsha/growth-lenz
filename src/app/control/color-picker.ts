import { ChangeDetectionStrategy, Component, AfterViewInit } from "@angular/core";
import { FieldType } from "@ngx-formly/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { validColorValidator } from "ngx-colors";
import { validate } from "uuid";

@Component({
  selector: "color-picker-input",
  template: `

<!-- <mat-form-field>
<input matInput [ngxMatColorPicker]="picker" [formControl]="formControl" />
<button mat-icon-button color="primary" ngTooltip="Edit User">
    <mat-icon fontSet="fas" fontIcon="fa-edit"></mat-icon>
</button>
<ngx-mat-color-toggle matSuffix [for]="picker"></ngx-mat-color-toggle>
<ngx-mat-color-picker #picker></ngx-mat-color-picker>
</mat-form-field> -->
<!-- <ngx-colors ngx-colors-trigger   (change)="onCheckboxChange($event)"  [formControl]="colorFormControl"
></ngx-colors> -->
<!-- 
<form class="example-form2" >
  <mat-form-field class="example-full-width">
    <mat-label>{{ field.props!['label'] }}</mat-label>
    <input matInput />
    <ngx-colors
      class="suffix"
      matSuffix
      ngx-colors-trigger
    ></ngx-colors>
    <mat-error
      *ngIf="this.exampleForm.controls['inputCtrl'].hasError('invalidColor')"
    >
      The color is invalid.
    </mat-error>
  </mat-form-field>
</form> -->
<style>
  .suffix {
    float: right;
    align-items: baseline;
    margin-right: 10px;
    margin-top: -10px;
  }
</style>
<mat-form-field class="example-full-width">
  <mat-label>{{ field.props!['label'] }}</mat-label>
  <div style="display: flex; align-items: center;">
    <input matInput formControlName="inputCtrl"  placeholder={{placeholder}} (input)="onColorChange($event)" readonly/>
    <ngx-colors
      class="suffix"
      (input)="onColorChange($event)"
      ngx-colors-trigger
      [formControl]="formControl"
      [formlyAttributes]="field"
    ></ngx-colors>
    <mat-icon matSuffix class="reseticon" (click)="resetColor()" [attr.disabled]="!formControl.value" fontSet="fas" fontIcon="fa-undo"></mat-icon>
  </div>
</mat-form-field>
`
})
export class ColorPickerInputComponent extends FieldType<any> {
  color: any;
  leftColor: any;
  placeholder: any;

  constructor() {
    super();
    debugger
  }


  public get FormControl() {
    return this.formControl as FormControl;
  }

  chage(data:any){
    console.log();
    
  }
  ngOnInit(): void {
     if(this.model.isEdit==true){
      this.formControl.setValue(this.FormControl.value)
    }else{
      this.formControl.setValue('');
    }

//     const data_Change:any= this.form.get(this.field.key) as FormControl
//     console.log(data_Change);
    
//  data_Change.valueChanges((data:any)=>{
//    console.log(data);
   
//    if(typeof(data)=="string"){
//      this.formControl.setValue(this.formControl.value)
 
//    }else{
//  this.resetColor()
//    }
//  })

    //     this.placeholder = this.field.props?.['placeholder']
    // this.exampleForm.controls["inputCtrl"].valueChanges.subscribe((color) => {
    //     if (this.exampleForm.controls["pickerCtrl"].valid) {
    //       this.exampleForm.controls["pickerCtrl"].setValue(color, { emitEvent: false });
    //     }
    //   });

    //   this.exampleForm.controls["pickerCtrl"].valueChanges.subscribe((color) => {
    //     this.exampleForm.controls["inputCtrl"].setValue(color, { emitEvent: false });
    //   });


    // if (this.field.props?.required) {
    //     this.exampleForm.controls["pickerCtrl"].setValidators([Validators.required]);
    //     this.exampleForm.controls["inputCtrl"].setValidators([Validators.required]);

    //     this.exampleForm.updateValueAndValidity();


    // }
  }

  onColorChange(event: any) {
  if(typeof(event)=="string"){
    this.field.formControl?.setValue(event);
    let variableName: any = this.field.name
    if (event != null) {
      document.documentElement.style.setProperty(variableName, event);
      console.log(event)
    }
  }else{
this.resetColor()  
}
  }

  resetColor() {    
    this.formControl.setValue(''); 
    let variableName: any = this.field.name
    document.documentElement.style.setProperty(variableName, '');

  }



}