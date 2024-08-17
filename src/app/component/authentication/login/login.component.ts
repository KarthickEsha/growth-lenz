import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DataService } from 'src/app/services/data.service';
import { JwtHelperService } from '@auth0/angular-jwt';
import { DialogService } from 'src/app/services/dialog.service';
import { environment } from 'src/environments/environment';
import { HelperService } from 'src/app/services/helper.service';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  frmLogin!: FormGroup
  user_data: any
  hide: boolean = true;
  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private dataService: DataService,
    private jwtService:JwtHelperService,
    private helpService:HelperService,
    private dialogService:DialogService,
    private helperService:HelperService
  ) {
    localStorage.clear();
    // this.helpService.setSelectedOrgId(this.helpService.getSubDomainName())
  }
  
  ngOnInit(): void { 
        this.frmLogin = this.formBuilder.group({
          id: new FormControl('',Validators.required),
          password: new FormControl('',Validators.required)
        }); 
  }

  login() {
    let user_data = this.frmLogin.value
    this.dataService.login(user_data).subscribe((res: any) => {
      if (res) {

        let loginresponse = res.data.LoginResponse;
        this.user_data = this.jwtService.decodeToken(loginresponse.token) 
        localStorage.setItem('selectedOrgId', loginresponse.org?._id)
        sessionStorage.setItem('token', loginresponse.token);
        sessionStorage.setItem('auth', JSON.stringify(res));
        this.dialogService.openSnackBar(res.data.Message  ,"OK"); 
        this.router.navigate(['/list/screen']);


    }
  })
  }


 


}
 