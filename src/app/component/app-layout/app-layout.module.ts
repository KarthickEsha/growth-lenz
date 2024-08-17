import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppFooterComponent } from './app-footer/app-footer.component';
import { AppHeaderComponent } from './app-header/app-header.component';
import { DefaultLayoutComponent } from './default-layout/default-layout.component';
import { MenuItemComponent } from './menu-item/menu-item.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { HttpClientModule } from '@angular/common/http';
import { MatInputModule } from '@angular/material/input';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatExpansionModule } from '@angular/material/expansion';
import { LoginLayoutComponent } from './login-layout/login-layout.component';
import { MatSelectModule } from '@angular/material/select';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import { NgSelectModule } from '@ng-select/ng-select';
import { SideNavbarComponent } from './side-navbar/side-navbar.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import {MatBadgeModule} from '@angular/material/badge';
import { ReactiveFormsModule } from '@angular/forms';
import {MatRadioModule} from '@angular/material/radio';
import { HelloComponent } from './app-header/popup.component';
import {MatTooltipModule} from '@angular/material/tooltip';


@NgModule({
  declarations: [
    AppFooterComponent,
    AppHeaderComponent,
    DefaultLayoutComponent,
    LoginLayoutComponent,
    MenuItemComponent,
    SideNavbarComponent,
    HelloComponent
  ],
  imports: [
    BrowserModule,
    MatRadioModule,
    ReactiveFormsModule,
    RouterModule,
    BrowserAnimationsModule,
    CommonModule,
    MatMenuModule,
    MatTooltipModule,
    MatIconModule,
    MatToolbarModule,
    MatButtonModule,
    MatAutocompleteModule,
    NgSelectModule,
    HttpClientModule,
    MatInputModule,
    MatSidenavModule,
    MatListModule,
    FlexLayoutModule,
    MatExpansionModule,
    MatSelectModule,
    MatDialogModule,
    MatCardModule,
    MatBadgeModule
  ],


  exports: [
    AppHeaderComponent,
    AppFooterComponent,
    DefaultLayoutComponent,
    LoginLayoutComponent,
    MenuItemComponent,
    HelloComponent,
    MatIconModule,
  ]
})
export class AppLayoutModule { }
