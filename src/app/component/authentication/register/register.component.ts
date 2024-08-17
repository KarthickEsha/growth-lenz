// import { HttpClient } from '@angular/common/http';
// import { Component, OnInit } from '@angular/core';
// import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
// import { Router } from '@angular/router';
// import { JwtHelperService } from '@auth0/angular-jwt';
// import { FormlyFieldConfig, FormlyFormOptions } from '@ngx-formly/core';
// import { DataService } from 'src/app/services/data.service';
// import { DialogService } from 'src/app/services/dialog.service';
// import { NgxSpinnerService } from 'ngx-spinner';

import { Component } from "@angular/core";


// export function ConfirmPasswordValidator(controlName: string, matchingControlName: string) {
//   return (formGroup: FormGroup) => {
//     let control = formGroup.controls[controlName];
//     let matchingControl = formGroup.controls[matchingControlName]
//     if (
//       matchingControl.errors &&
//       !matchingControl.errors['confirmPasswordValidator']
//     ) {
//       return;
//     }
//     if (control.value !== matchingControl.value) {
//       matchingControl.setErrors({ confirmPasswordValidator: true });
//     } else {
//       matchingControl.setErrors(null);
//     }
//   };
// }
@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {

}
//   // form!: FormGroup;
//   user_data: any;
//   hide_password: boolean = true;
//   hide_cpassword: boolean = true;
//   headClient: boolean = false;
//   headEngineer: boolean = false;
//   // callingCode: string = "+91"; // Default calling code for the selected country (e.g., "+44" for Great Britain)
//   showEngineerAssignType: boolean = false;
//   flag: boolean = true
//   show_spinner:boolean=false
//   form: any = new FormGroup({});
//   model: any = {};
//   options: FormlyFormOptions = {};
//   fields!: FormlyFieldConfig[]
//   buttonClicked = false;
//   countrylist:any[]=[]
//   // typeSelected: string;

//   constructor(
//     private formBuilder: FormBuilder,
//     private httpclient: HttpClient,
//     private router: Router,
//     private dataService: DataService,
//     public jwtService: JwtHelperService,
//     private dialogService: DialogService,
//     private loader: NgxSpinnerService
//   ) {
//     // this.typeSelected = 'line-spin-clockwise-fade';

//     let data = localStorage.getItem("role")
//     this.user_data = data
//     if (this.user_data == "client") {
//       this.model.flag = true
//     } else {
//       this.model.flag = false
//     }
//     if (this.user_data == 'client') {
//       this.headClient = true;
//     }
//     else {
//       this.headEngineer = true;
//     }
//   }

//   countries: any
//   roles: any

//   ngOnInit(): void {
//     this.httpclient.get("assets/jsons/" + "register" + "-" + "form.json").subscribe((config: any) => {
//         this.fields = config.form.fields;
//         console.log(config);
//         this.show_spinner=false



//   this.dataService.getparentdata('get-country').subscribe((res:any)=>{
//     if(res.data !=null){
//       this.countrylist = res.data
//       console.log( this.countrylist,"countrylist")
//     }
    
//   })

//       })


//   }

//   register() {
//     debugger
//     this.show_spinner=true
//     this.buttonClicked = true;
//     if (!this.form.valid) {
//       this.buttonClicked = false;
//       this.dialogService.openSnackBar("Error in your data or missing mandatory fields", "OK");
//       return;
//     }
//     this.loader.show();
//     //concat the calling code and mobile number
//     let data: any = {}
//     let data1: any = {}
//     // console.log(this.form);
//     console.log(this.model);
//     let country = this.countrylist.filter((a:any)=>{return a.calling_code == this.model.calling_code})

//     data1['first_name'] = this.model.first_name
//     data1['last_name'] = this.model.last_name
//     data1['email_id'] = this.model.email
//     data1['calling_code'] = this.model.calling_code
//     data1['mobile_number'] = this.model.mobile_number
//     data['password'] = this.model.password
//     data['profile_update_percentage'] = 10
//     data['confirm_password'] = this.model.confirm_password
//     data['contact'] = data1
//     data['user_type']=this.model.user_type
//     if(this.headEngineer){
//       data["status"]= "UnApproved"
//       data["available_status"]= "Available"
//     }
//     if(country.length == 1){
//       data1['primary_address']={
//         'country_code':country[0]._id
//       }
//     }
//     // this.user_data="field-engineer"
//     localStorage.setItem('emailId', this.model.email)
//     // localStorage.setItem('user_data',this.user_data)
//     localStorage.setItem('calling_code', this.model.calling_code)
//     localStorage.setItem('role', this.user_data)
//     localStorage.setItem('phone', this.model.mobile_number)
//     if (this.model.password == this.model.confirm_password) {
//       this.dataService.userRegister(data, this.user_data).subscribe((res: any) => {
//         this.loader.hide();
//         if (res.status == 200) {
//           this.dialogService.openSnackBar(res.message, "OK")
//           this.show_spinner=false
//           this.router.navigate([`/verification/${this.user_data}`]);
//           this.buttonClicked = false;
//         } else {
//           this.dialogService.openSnackBar(res.message, "OK")
//         }
//       }, (error) => {
//         this.show_spinner=false
//         this.loader.hide();
//         this.buttonClicked = false
//       })
//     } else {
//       this.loader.hide();
//       this.dialogService.openSnackBar("Password and confirm password do not match", "OK")
//     }
//   }

//   // function checkPasswordMatch(password, confirmPassword) {
//   //   if (password !== confirmPassword) {
//   //     throw new Error("Password and confirm password do not match");
//   //   }
//   // }

//   // Example usage:
//   // try {
//   //   const password = "myPassword";
//   //   const confirmPassword = "differentPassword";
//   //   checkPasswordMatch(password, confirmPassword);
//   //   console.log("Passwords match!");
//   // } catch (error) {
//   //   console.error(error.message); // This will log the error message if passwords don't match
//   // }




//   // onCountryChange(country: any) {
//   //   this.callingCode = country.callingcode;
//   // }
//   ngOnDestroy() {
//     sessionStorage.clear()
//   }
// }

