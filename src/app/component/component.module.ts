import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { DatatableComponent } from './datatable/datatable.component';

import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppLayoutModule } from './app-layout/app-layout.module';
import { AuthenticationModule } from './authentication/authentication.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AgGridModule } from 'ag-grid-angular';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { FormlyFieldConfig, FormlyModule } from '@ngx-formly/core';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { DateAdapter, MatNativeDateModule, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormlyMatCheckboxModule } from '@ngx-formly/material/checkbox';
import { FormlyMatDatepickerModule } from '@ngx-formly/material/datepicker';
import { FormlyMatInputModule } from '@ngx-formly/material/input';
import { FormlyMatSelectModule } from '@ngx-formly/material/select';
import { FormlyMatRadioModule } from '@ngx-formly/material/radio';
import { FormlyMaterialModule } from '@ngx-formly/material';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormlyMatFormFieldModule } from '@ngx-formly/material/form-field';
import { FormlyMatTextAreaModule } from '@ngx-formly/material/textarea';
import { MatTabsModule } from '@angular/material/tabs';
import { MatExpansionModule } from '@angular/material/expansion';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { TokenInterceptor } from '../services/token.interceptor';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { MatButtonModule } from '@angular/material/button';
import { ActionButtonComponent } from './datatable/button';
import { FormlyMatToggleModule } from '@ngx-formly/material/toggle'; 
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MyLinkRendererComponent } from './datatable/cellstyle';
import { MatGridListModule } from '@angular/material/grid-list';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ControlModule } from '../control/control.module';
import { DynamicFormComponent } from './dynamic-form/dynamic-form.component';
 import { AppRoutingModule } from '../app-routing.module';
 import {MatStepperModule} from '@angular/material/stepper';
import { DynamicFilterComponent } from './dynamic-filter/dynamic-filter.component';
 import { NgSelectModule } from '@ng-select/ng-select'; 
import {MatRadioModule} from '@angular/material/radio'; 
import { CalendarModule } from 'primeng/calendar';
import { DynamicViewComponent } from './dynamic-view/dynamic-view.component';
import { AngularEditorModule } from '@kolkov/angular-editor';
import { StatusColorComponent } from './datatable/cellcolor'; 
import { LeafletModule } from '@asymmetrik/ngx-leaflet'; 
import { FullCalendarModule } from '@fullcalendar/angular';
import { NgxMatDatetimePickerModule, NgxMatTimepickerModule } from '@angular-material-components/datetime-picker';
import { NgxMatMomentModule } from '@angular-material-components/moment-adapter';

import { NgxChartsModule } from '@swimlane/ngx-charts'; 
import { DatasetComponent } from './dataset/dataset.component';
import { NgmodelComponent } from './dataset/ngmodel/ngmodel.component';
import { FormlyformComponent } from './formlyform/formlyform.component';
import { DisplayDataComponent } from './formlyform/display-data/display-data.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatChipsModule } from '@angular/material/chips';
import { AggridDesignComponent } from './aggrid-design/aggrid-design.component';
import { DropDownAgggrid } from './master-single-detail-form/dropdownAggrid';
import { MasterButtonComponent } from './master-single-detail-form/master-button';
import { MasterSingleDetailFormComponent } from './master-single-detail-form/master-single-detail-form.component';








const MY_DATE_FORMATS = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'DD-MMM-YYYY',
    monthYearLabel: 'MMMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY'
  },
};

export function patternValidationMessage(error: any, field: FormlyFieldConfig) {
  return `Invalid ${field.props?.label}`
}

@NgModule({
  declarations: [
    DatatableComponent,
    DynamicFormComponent,
    DynamicFilterComponent,
    ActionButtonComponent,
    StatusColorComponent,
    MyLinkRendererComponent,
    AggridDesignComponent,MasterSingleDetailFormComponent,DropDownAgggrid,MasterButtonComponent,
    DynamicViewComponent, 
    DatasetComponent,
    NgmodelComponent,
    FormlyformComponent,AggridDesignComponent,
    DisplayDataComponent
  ],
  imports: [
    NgxMatDatetimePickerModule,
    NgxMatMomentModule,
    DragDropModule,
    MatChipsModule,FullCalendarModule,
    NgSelectModule,
    // NgxPayPalModule,
    MatStepperModule,
    AppRoutingModule,
    CommonModule,
    FormlyMatToggleModule,
    BrowserModule,
    AgGridModule,
    MatProgressBarModule,
    BrowserAnimationsModule,
    CommonModule,
    MatButtonModule,
    AppLayoutModule,
    AuthenticationModule,
    FormlyModule,
    ReactiveFormsModule,
    FormlyMatCheckboxModule,
    FormlyMatDatepickerModule,
    FormlyMatInputModule,
    FormlyMatRadioModule,
    FormlyMatSelectModule,
    FlexLayoutModule,
    FormlyMaterialModule,
    MatInputModule,
    MatCheckboxModule,
    MatIconModule,
    MatAutocompleteModule,
    MatListModule,
    MatSidenavModule,
    MatCardModule,
    MatMenuModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatSelectModule,
    FormlyMatFormFieldModule,
    FormlyMatTextAreaModule,
    MatNativeDateModule,
    MatDialogModule,
    FormsModule,
    MatFormFieldModule,
    MatTabsModule,
    MatDatepickerModule,
    ControlModule,
    AngularEditorModule,
    MatGridListModule,
    LeafletModule,
    FormlyModule.forRoot({
      validationMessages: [
        { name: 'required', message: "This field is required" },
        // { name: 'minLength', message: minLengthValidationMessage },
        // { name: 'maxLength', message: maxLengthValidationMessage },
        { name: 'pattern', message: patternValidationMessage }
      ]
    }),
    MatExpansionModule,
    MatSlideToggleModule,
    MatRadioModule,
    NgxMatTimepickerModule,
    CalendarModule,
    NgxChartsModule
    
  ],


  exports: [
    DatatableComponent,
    DynamicFormComponent,
    DynamicFilterComponent, 
    NgxMatTimepickerModule,
    ControlModule,
    DynamicViewComponent,
    MatRadioModule,
    NgxChartsModule,FullCalendarModule
    
    // DatePickerComponent,
    // SchedulerComponent
  ],

  providers: [
    DatePipe,
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true
    }
  ],
})
export class ComponentModule { }
