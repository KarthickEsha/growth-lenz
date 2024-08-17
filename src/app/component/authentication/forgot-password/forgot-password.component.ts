import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { DataService } from 'src/app/services/data.service';
import { DialogService } from '../../../services/dialog.service';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {
  forgetPassword!: FormGroup
  otpPassword!: FormGroup
  resetPassword!: FormGroup
  currentTimer: any;
  twostepverify!:FormGroup
  hide: boolean = false;
  @Input('frmLogin') frmLogin: any
  data: string = ""
  Otp: boolean = false
  sendOtp: any
  disabled: boolean = false
  passwordMismatch:boolean =false
  collection: any
  email_data: string | null = null;
  otpData: any;
  showOtpForm: boolean = false
  showResetForm: boolean = false
  show2stepForm:boolean = false
  showForm: boolean = false
  resendOtp: boolean = false;
  displayTimer: boolean = false;
  display: string = '';
  timeLeft: number = 60
  interval: any
  unamePattern = "^[a-z0-9_-]*$"; 
  buttonClicked: boolean = false;
  resetButtonClicked:boolean = false
  authdata:any
  show_spinner: boolean = false
  constructor(
    private formBuilder: FormBuilder,
    private dataService: DataService,
    private dialogService: DialogService,
    private router: Router,
    private route: ActivatedRoute,
    private loader: NgxSpinnerService

  ) {
  }
  ngOnInit() {
    debugger
    this.show_spinner = false
    this.route.params.subscribe((params: any) => {
      this.data = params.user_type
    });
    this.forgetPassword = this.formBuilder.group({
      emailaddress: new FormControl(null, [Validators.required,
        Validators.pattern('^\\w+([\\.-]?\\w+)*@\\w+([\.-]?\\w+)*(\\.\\w{2,3})+$')
      ])
    });
    this.otpPassword = this.formBuilder.group({
      otp: new FormControl(null, Validators.required),
      // otp2: new FormControl(null, Validators.required),
      // otp3: new FormControl(null, Validators.required),
      // otp4: new FormControl(null, Validators.required),
      // otp5: new FormControl(null, Validators.required),
      // otp6: new FormControl(null, Validators.required)
    });
    this.resetPassword = this.formBuilder.group({
      newPassword: new FormControl(null, [Validators.required,
        Validators.pattern('^(?=.*[A-Z])(?=.*[a-z])(?=.*\\d)(?=.*[@#$%^&+=!]).{8,10}$')
      ]),
      confirmPassword: new FormControl(null,
         [Validators.required]),
    }, {
      validators: this.passwordMatchValidator, // Add the custom validator here
    });
  }

 
 passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const newPasswordControl = control.get('newPassword');
    const confirmPasswordControl = control.get('confirmPassword');
  
    if (!newPasswordControl || !confirmPasswordControl) {
      return null;
    }
    const newPassword = newPasswordControl.value;
    const confirmPassword = confirmPasswordControl.value;
    if (newPassword !== confirmPassword || newPassword === '' || confirmPassword === '') {
      return { passwordMismatch : true };
    }
    
    return null;
  }
 
  onDigitInput(event: any) {
    let element;
    if (event.code !== 'Backspace')
      element = event.srcElement.nextElementSibling;
    if (event.code === 'Backspace')
      element = event.srcElement.previousElementSibling;
    if (element == null)
      return;
    else
      element.focus();
  }

  forgotPassword() {
    debugger
    // let id = this.frmLogin.value.userId
    let email_data = this.forgetPassword.value.emailaddress;
    let user_data = this.resetPassword.value
    if (this.data == "client") {
      this.collection = "user"
    } else if (this.data == "saas") {
      this.collection = "saas"
    }
    else if (this.data == "corporate_customer") {
      this.collection = "corporate_customer"
    }
    let resetPwd = {
      id: email_data,
      user_type: this.data,
      new_Password: user_data.newPassword,
      confirm_Password:user_data.confirmPassword

    }
    this.resetButtonClicked = true
    let path = "reset-password/" + `${this.collection}`
    this.show_spinner = true
    this.loader.show();
    // this.dataService.getSendOtp(path, resetPwd).subscribe((res: any) => {
    //   this.otpData = res.data
    //   this.resetButtonClicked = false
    //   if(res.status == 200){
    //     this.show_spinner = false
    //     this.loader.hide();
    //     this.Otp =true
    //     this.showResetForm = false;
    //     this.showOtpForm = false;
    //     this.showForm =true
    //   }else{
    //     this.show_spinner = false
    //     this.loader.hide();
    //     this.dialogService.openSnackBar("OTP send successfully", "OK")
    //   }
    // },error=>{
    //   this.show_spinner = false
    //   this.loader.hide();
    //   this.dialogService.openSnackBar(error.error.message, "OK")
    // });
  }


  otp() {
    debugger
    let email_data = this.forgetPassword.value.emailaddress;
    let otp_data = this.otpPassword.value
    let parseOtp = parseInt(otp_data.otp)
    if (this.data == "client") {
      this.collection = "user"
    } else if (this.data == "saas") {
      this.collection = "saas"
    }
    else if(this.data == "corporate_customer") {
      this.collection = "corporate_customer"
    } else {
      console.log("Error");
    }
    let otpVerify: any = {
      otp: parseOtp,
      id: email_data
    }
     let path = "validate-otp/" + `${this.collection}`
     debugger
     if (otp_data.otp == null||otp_data.otp =='') {
      this.dialogService.openSnackBar("Enter OTP", "OK");
    } else if (otp_data.otp.length !== 6) {
      this.dialogService.openSnackBar("Enter Valid OTP", "OK");
    } else {
      // this.dataService.getSendOtp(path, otpVerify).subscribe((res: any) => {
      //   if(res.status == 200) {
      //     this.otpData = res.data
      //     this.showResetForm = true;
      //     this.showForm =true
      //     this.showOtpForm = false;
      //   } else {
      //     this.dialogService.openSnackBar(res.message,"OK");
      //   }
      // })
    }
  }

  params: any

  otpEmail() {
    debugger
    let email_data = this.forgetPassword.value.emailaddress;
    if(email_data === null || email_data === undefined || email_data === '') {
      this.forgetPassword.markAllAsTouched();
      this.dialogService.openSnackBar("Enter Email", "OK")
    } else {
      let data = {
        id: email_data,
        user_type: this.data
      }
      this.buttonClicked = true
      let path = "send-otp/" + `${email_data}` + "/" + `${data.user_type}`
      sessionStorage.setItem('email', email_data);
      // this.dataService.getSendOtp(path, data).subscribe((res: any) => {
      //   if(res.status == 200) {
      //     this.showOtpForm = true;
      //     this.showForm =true
      //     this.buttonClicked = false
      //     this.sendOtp = res.data
      //     this.dialogService.openSnackBar(res.message, "OK")
      //     this.start(2);
      //   }
      // },(error:any)=>{
      //   this.dialogService.openSnackBar(error.error?.message,"OK");
      //   this.buttonClicked = false
      // })
      this.authdata=sessionStorage.getItem('email')
     
    }
  }

  destroyEmail() {
    sessionStorage.removeItem('email');
  }
  
ResendOtp(){
  debugger
  this.displayTimer=false
  if (this.currentTimer) {
    clearInterval(this.currentTimer);
  }

  this.otpPassword.reset()
  let emailGet = sessionStorage.getItem('email')
    let data = {
      email_data: emailGet,
      data: this.data
    }
    let path = "send-otp/" + `${emailGet}` + "/" + `${this.data}`
    // this.dataService.getSendOtp(path, data).subscribe((res: any) => {
    //   if(res.status == 200) {
    //     this.showOtpForm = true;
    //     this.sendOtp = res.data
    //     this.dialogService.openSnackBar(res.message, "OK")
    //     this.start(2)
    //   }
    // },(error:any)=>{
    //   this.dialogService.openSnackBar(error.error?.message,"OK");
    // })
}

show_resend_code(){
  if(this.display !=""){
    const time = moment(this.display, "HH:mm");
    const hours = time.format("HH"); // Extract hours
    const minutes = time.format("mm"); // Extract minutes
    if(hours <="00" && minutes <="60"){
      return true
    } else {
      return false
    }
   
  } else {
    return false
  }
}


  login() {
    this.router.navigate(['/login/' +`${this.data}`]);
    // this.router.navigate(["/forgotpassword/"+`${this.type}`]);
  }
  Twostepotp() { }

  start(minute: number) {
    if (this.currentTimer) {
      clearInterval(this.currentTimer);
    }

    this.resendOtp = false;
    let seconds = minute * 60;
    let textSec: any = '0';
    let statSec = 60;

    const prefix = minute < 10 ? '0' : '';

    const timer = setInterval(() => {
      seconds--;
      if (statSec != 0) statSec--;
      else statSec = 59;

      if (statSec < 10) {
        textSec = '0' + statSec;
      } else {
        textSec = statSec;
      }

      this.display = `${prefix}${Math.floor(seconds / 60)}:${textSec}`;
      this.displayTimer = true;

      if (seconds == 0) {
        clearInterval(timer);
        this.resendOtp = true;
        this.displayTimer = false;
      }
    }, 1000);
    this.currentTimer = timer;
  }

Resendtwostep(){}
Twostep(){}
}
