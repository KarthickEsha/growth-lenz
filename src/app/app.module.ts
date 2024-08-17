import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { MatButtonModule } from '@angular/material/button';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ComponentModule } from './component/component.module';
import { FormlyModule } from '@ngx-formly/core';
import { ReactiveFormsModule } from '@angular/forms';
import { JwtModule } from '@auth0/angular-jwt';
import { MatFormFieldDefaultOptions, MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatGridListModule } from '@angular/material/grid-list';
import { AuthGuard} from './services/auth-guard.service';
import { FormsModule } from '@angular/forms';
import { AuthGuard2 } from './services/authgaurd2.service';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { NgxSpinnerModule } from 'ngx-spinner';
import { CalendarModule } from 'primeng/calendar';
import { SharedService } from './services/utils';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';

const appearance: MatFormFieldDefaultOptions = {
  appearance: 'outline'
};

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ComponentModule,
    FormlyModule,
    ReactiveFormsModule,
    MatButtonModule,
    ScrollingModule,
    FlexLayoutModule,
    MatExpansionModule,
    MatGridListModule,
    FormsModule,
    MatSlideToggleModule,
    NgxSpinnerModule,
    JwtModule.forRoot({
      config: {
        tokenGetter: tokenGetter,
      },
    }),
  
    CalendarModule,
    MatChipsModule,
    MatTabsModule
  ],

  providers: [
    // AuthGuardService,
    AuthGuard,
    SharedService,
    AuthGuard2,

    
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: appearance
    }],

  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  bootstrap: [AppComponent]
})
export class AppModule { }
export function tokenGetter() {
  return sessionStorage.getItem("token");
}



// {
//   "type": "logo_upload",
//   "key": "addressLogoHidden",
//   "className": "flex-1",
//   "props": {
//     "label": "Address Logo",
//     "placeholder": "Address Logo",
//     "required": true,
//     "expressions": {
//       "hide": "!model.addressLogoHidden"
//     }
//   }
// }