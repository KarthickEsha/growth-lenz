import { NgModule, LOCALE_ID } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Tab } from './tab';
import { MatTabGroup, MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { AgGridModule } from 'ag-grid-angular';
import { AbstractControl, FormsModule, ReactiveFormsModule, ValidationErrors } from '@angular/forms';
import { FormlyMatDatepickerModule } from '@ngx-formly/material/datepicker';
import { FormlyFieldConfig, FormlyModule } from '@ngx-formly/core';
import { AngularEditorModule } from '@kolkov/angular-editor';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule, MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDialogModule } from '@angular/material/dialog';
import { HtmlInput } from './html-input';
import { MultiSelectInput } from './multiselect-input';
import { SelectInput } from './select-input';
import { DateTimeInput } from './datetime-input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';

import { NgSelectModule } from '@ng-select/ng-select';

import { LabelView } from './label';
import { FileInput } from './file-input';
import { ImageInput } from './image-input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AutoComplete } from './autocomplete-input';
import { ButtonInput } from './button-input';
import { Nestedform } from './nestedform';
import { MatPrefixInput } from './mat-prefix-input';
import { PasswordInput } from './password-input';
import { CustomPopupInput } from './custompopup-input';
import { TimeInput } from './timepicker';
import { GoogleMapsModule } from '@angular/google-maps';
import { Location } from './location';

import { BrowserModule } from '@angular/platform-browser';

import { DateInput } from './datepicker';
import { PasswordsMatchFieldComponent } from './conform-password';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { HidePasswordFieldComponent } from './hide-password';
import { CustomDecimalInputType } from './custom-decimal-input';
import { OnlyDecimalDirective } from './decimal-directive';
import { CheckboxInputFieldComponent } from './checkbox-input';
import { NgxSpinnerModule } from 'ngx-spinner';
import { ColorPickerInputComponent } from './color-picker';
import { NgxColorsModule } from 'ngx-colors';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatRadioModule } from '@angular/material/radio';
import { CalendarModule } from 'primeng/calendar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormlyLabelView } from './label_view';
import { MultiCheckboxInput } from './multicheckbox.input';
import { ChipTypeComponent } from './chips-input';
import { MatChipsModule } from '@angular/material/chips';
import { NgxMatTimepickerModule } from 'ngx-mat-timepicker';
import { NgxMatDatetimePickerModule, NgxMatNativeDateModule } from '@angular-material-components/datetime-picker';
import { FormlyFieldDateTimePicker } from './datetimepicker';
import { MatSelectAutoComplete } from './matselect-autocomplete-input';
import { AutogenerateId } from './autogenerateid-input';
import { radiobutton } from './radiobutton';
// import { BulkUploadComponent } from './bulk-upload';





// import { TextInput } from './text-input';
// import { NgxMaskModule } from 'ngx-mask';





//date validation
export function lengthvalidation(
  control: AbstractControl,
  field: FormlyFieldConfig,
  options = {},
): ValidationErrors {
  debugger
  let label = field.props?.label
  let value: any = field.props?.attributes
  if (control.value > field.model[value.parentKey]) {
    return { 'date-validation': { message: `${label}` + " Should not be  lesser than " + `${value.label}` } }
  } else {
    return {}
  }


}

//Max Length validation
export function maxlengthvalidation(
  control: AbstractControl,
  field: FormlyFieldConfig,
  options = {},
): ValidationErrors {
  debugger

  let label = field.props?.label
  let value: any = field.props?.attributes
  return { 'max-length': { message: `${label}` + " invalid" + `${value.label}` } }
  // let val=control.value.toString()
  // if(val.length > 5){
  //  val=val.substring(0, 5);
  //   if(val.endsWith('.')!=true){
  //    let float_value=parseFloat(val)
  //     control.setValue(float_value)
  //   } else{
  //     let float_value=parseFloat(val)
  //     control.setValue(float_value)
  //   }


}



export function ValidatorMessage(error: any, field: FormlyFieldConfig) {
  ValidatorMessage
  return `${field.props?.label} is INVALID`;
}







// const maskConfig: Partial<IConfig> = {
//   validation: false,
// };

const lang = 'en-US';
const formlyConfig = {

  extras: { lazyRender: true, resetFieldOnHide: true },
  validationMessages: [
    { name: 'required', message: 'This field is required' },
    { name: 'pattern', message: ValidatorMessage },
  ],
  validators: [
    {
      name: 'date-validation',
      validation: lengthvalidation,
    },
    {
      name: 'max-length',
      validation: maxlengthvalidation,
    }
  ],

  types: [
    { name: 'tab-input', component: Tab },
    {
      name: 'select-input', component: SelectInput, validationMessages: [
        { name: 'required', message: 'This field is required' },
      ]
    },
    {
      name: 'html-input', component: HtmlInput, validationMessages: [
        { name: 'required', message: 'This field is required' },
      ]
    },
    { name: 'date-input', component: DateInput },
    { name: 'multiselect-input', component: MultiSelectInput },
    { name: 'label-view', component: LabelView },
    { name: 'datetime_input', component: DateTimeInput },
    { name: 'file-input', component: FileInput },
    { name: 'datetimepicker', component: FormlyFieldDateTimePicker },
    { name: 'image-input', component: ImageInput },
    { name: 'autocomplete-input', component: AutoComplete },
    { name: 'matselectauto-input', component: MatSelectAutoComplete },
    {
      name: 'button-input', component: ButtonInput, validationMessages: [
        { name: 'required', message: 'This field is required' },
        { name: 'pattern', message: ValidatorMessage },
      ]
    },
    { name: 'password-input', component: PasswordInput },
    { name: 'matprefix-input', component: MatPrefixInput },
    { name: 'custompopup-input', component: CustomPopupInput },
    { name: 'time-input', component: TimeInput },
    { name: 'location', component: Location },
    { name: 'hidePassword', component: HidePasswordFieldComponent },
    { name: 'conformPassword', component: PasswordsMatchFieldComponent },
    {
      name: 'custom-decimal-input', component: CustomDecimalInputType, validationMessages: [
        { name: 'required', message: 'This field is required' },
        { name: 'pattern', message: ValidatorMessage },
      ],
    },
    { name: "checkbox-input", component: CheckboxInputFieldComponent },
    { name: "multicheckbox-input", component: MultiCheckboxInput },
    {
      name: 'color-picker-input', component: ColorPickerInputComponent, validationMessages: [
        { name: 'required', message: 'This field is required' }
      ],
    },
    { name: 'label', component: FormlyLabelView },
    { name: 'chips-input', component: ChipTypeComponent },
    // { name: 'text-input', component: TextInput}
    { name: "radio-button", component: radiobutton },
    // { name: "bulk-upload", component: BulkUploadComponent}

  ]
}

@NgModule({
  declarations: [
    OnlyDecimalDirective,
    Tab,
    FileInput,
    HtmlInput,
    LabelView, AutogenerateId,
    DateInput,
    MultiSelectInput,
    SelectInput,
    DateTimeInput,
    ImageInput,
    AutoComplete,
    ButtonInput,
    Nestedform,
    MatPrefixInput,
    PasswordInput,
    CustomPopupInput,
    TimeInput,
    Location,
    PasswordsMatchFieldComponent,
    CustomDecimalInputType,
    HidePasswordFieldComponent,
    CheckboxInputFieldComponent,
    ColorPickerInputComponent,
    MultiCheckboxInput,
    FormlyLabelView, radiobutton,
    ChipTypeComponent,
    FormlyFieldDateTimePicker,
    MatSelectAutoComplete
  ],


  imports: [
    BrowserModule,
    CommonModule,
    MatChipsModule,
    MatCardModule,
    MatTabsModule,
    MatDatepickerModule,
    MatButtonModule,
    MatSidenavModule,
    // NgxMatMomentModule,
    MatNativeDateModule,
    BrowserAnimationsModule,
    MatRadioModule,
    AgGridModule,
    MatDatepickerModule,
    ReactiveFormsModule,
    FormlyMatDatepickerModule,
    FormlyModule.forRoot(formlyConfig),
    FormsModule,
    AngularEditorModule,
    MatIconModule,
    MatMenuModule,
    MatSelectModule,
    MatInputModule,
    MatOptionModule,
    MatFormFieldModule,
    MatExpansionModule,
    MatDialogModule,
    MatNativeDateModule,
    FormlyMatDatepickerModule,
    MatCheckboxModule,
    // NgxMatTimepickerModule.setLocale(lang),
    NgSelectModule,
    GoogleMapsModule,
    MatDatepickerModule,
    CalendarModule,
    MatIconModule,
    MatAutocompleteModule,
    MatSlideToggleModule,
    NgxSpinnerModule,
    NgxColorsModule,
    NgxMatTimepickerModule,
    CalendarModule,
    NgxMatDatetimePickerModule,
    MatTooltipModule,
    NgxMatNativeDateModule,
    MatAutocompleteModule
  ],
  exports: [
    Tab,
    HtmlInput,
    LabelView,
    DateInput,
    MatRadioModule,
    MultiSelectInput,
    SelectInput,
    DateTimeInput,
    FileInput,
    ImageInput,
    AutoComplete,
    ButtonInput,
    Nestedform,
    MatPrefixInput,
    PasswordInput,
    CustomPopupInput,
    TimeInput,
    Location,
    PasswordsMatchFieldComponent,
    CustomDecimalInputType,
    HidePasswordFieldComponent,
    CheckboxInputFieldComponent,
    ColorPickerInputComponent,
    FormlyLabelView,
    MultiCheckboxInput,
    ChipTypeComponent,
    NgxMatTimepickerModule,
    FormlyFieldDateTimePicker,
    NgxMatNativeDateModule,
    MatSelectAutoComplete

  ],
  providers: [{ provide: LOCALE_ID, useValue: lang }, MatTabGroup, Tab],
})
export class ControlModule { }



