import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { DefaultLayoutComponent } from "./component/app-layout/default-layout/default-layout.component";
import { DynamicFormComponent } from "./component/dynamic-form/dynamic-form.component";
import { DatatableComponent } from "./component/datatable/datatable.component";
import { LoginComponent } from "./component/authentication/login/login.component";
import { LoginLayoutComponent } from "./component/app-layout/login-layout/login-layout.component";
import { RegisterComponent } from "./component/authentication/register/register.component";
import { AuthGuard } from "./services/auth-guard.service";
import { AuthGuard2 } from "./services/authgaurd2.service";
import { MasterSingleDetailFormComponent } from "./component/master-single-detail-form/master-single-detail-form.component";
import { FormlyformComponent } from "./component/formlyform/formlyform.component";

const routes: Routes = [
  {
    path: "",
    redirectTo: "login",
    pathMatch: "full",
  },
  {
    path: "login",
    // path: "login/:data",
    loadChildren: () =>
      import("./component/authentication/authentication.module").then(
        (m) => m.AuthenticationModule
      ),
    component: LoginComponent,
  },
  // {
  //   path: "register",
  //   loadChildren: () =>
  //     import("./component/authentication/authentication.module").then(
  //       (m) => m.AuthenticationModule
  //     ),
  //     canActivate: [AuthGuard],
  //   component: RegisterComponent
  // },
  {
    path: "add",
    component: DefaultLayoutComponent,
    children: [
      {
        path: ":form",
        component: DynamicFormComponent,
      },
    ],
  },
  {
    path: "edit",
    component: DefaultLayoutComponent,
    children: [
      {
        path: ":form/:id",
        component: DynamicFormComponent,
      },
    ],
  },

  {
    path: "list",
    component: DefaultLayoutComponent,
    children: [
      {
        path: "",
        component: DatatableComponent,
      },
      {
        path: ":form",
        component: DatatableComponent,
      },
    ],
  },
  {
    path: "formdesign",
    component: DefaultLayoutComponent,

    children: [
      { path: "", component: FormlyformComponent },
      { path: ":id", component: FormlyformComponent },
    ],
  },
  {
    path: "data",

    component: DefaultLayoutComponent,
    children: [
      {
        path: "list/:form",
        component: DatatableComponent,
      },
      // MAster Single COmponent
      {
        path: "add/:form",
        component: MasterSingleDetailFormComponent,
      },
      {
        path: "edit/:form/:id",
        component: MasterSingleDetailFormComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
