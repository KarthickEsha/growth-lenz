import { Component, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { DataService } from 'src/app/services/data.service';

interface SideNavToggle {
  screenwidth: number
  collapsed: boolean
}
@Component({
  selector: 'app-default-layout',
  templateUrl: './default-layout.component.html',
  styleUrls: ['./default-layout.component.css'],
})
export class DefaultLayoutComponent {
  @Input() collapsed = false
  @Input() screenwidth = 0
  theme: any
  job_type: any

  isSideNavCollapsed = false
  constructor(private jwtService: JwtHelperService, private route: ActivatedRoute, private router: Router, private dataservice: DataService, ) {

    //switch account from  SAAS to Corporate Customer 
    // this.route.queryParams.subscribe((qparams: any) => {
    //   console.log('param', qparams)
    //   let saas_data:any = sessionStorage.getItem('auth')
    //   let user_type:any = sessionStorage.getItem('user_type')
    //   let token = qparams["code"]
    //   console.log('token', token)
    //   if (token != undefined) {
    //     let data = this.jwtService.decodeToken(token)
    //     sessionStorage.setItem("first_name", data.first_name);
    //     sessionStorage.setItem("last_name", data.last_name);
    //     sessionStorage.setItem("email_id", data.email_id);
    //     sessionStorage.setItem("org_id", data.org_id);
    //     sessionStorage.setItem("user_id", data.user_id);
    //     sessionStorage.setItem('user_type', data.user_type);
    //     sessionStorage.setItem('token', token);
    //     sessionStorage.setItem('saas_data',saas_data );
    //     sessionStorage.setItem('switch_over_by',user_type );
    //     localStorage.setItem(data.email_id, token);
    //     sessionStorage.setItem('auth', JSON.stringify(data));
    //     this.router.navigate(['/corporate-dashboard']);
    //   }

    // })
  }

  // ngOnInit() {
  //   let userType: any = sessionStorage.getItem('user_type')
  //   let orgId: any = sessionStorage.getItem('org_id')
  //   if (userType == "Corporate Customer") {
  //     this.dataservice.getDataById("corporate_customer", orgId).subscribe((res: any) => {
  //       this.theme = res.data.theme
  //       console.log(this.theme, "theme");
  //       document.documentElement.style.setProperty('--sidenav-color', this.theme.left_panel_color);
  //       document.documentElement.style.setProperty('--filter-button', this.theme.filter_button_color);
  //       document.documentElement.style.setProperty('--cancel-button', this.theme.cancel_button_color);
  //       document.documentElement.style.setProperty('--page-heading-color', this.theme.page_title_color);
  //       document.documentElement.style.setProperty('--ag-header-color', this.theme.grid_header_color);
  //       document.documentElement.style.setProperty('--submit-button', this.theme.save_button_color);
  //       document.documentElement.style.setProperty('--button-color', this.theme.save_button_color);
  //       document.documentElement.style.setProperty('--other-button-color', this.theme.other_button_color);
  //       document.documentElement.style.setProperty('--menu-font', this.theme.menu_font_color);
  //       document.documentElement.style.setProperty('--header-font', this.theme.header_font_color);
  //     })
  //   }
  //   else if (userType == "SAAS") {
  //     //  document.documentElement.style.setProperty('--cancel-button',"0f5f4b");
  //     document.documentElement.style.setProperty('--sidenav-color', "#0f5f4b");
  //     document.documentElement.style.setProperty('--filter-button', "#0f5f4b");
  //     document.documentElement.style.setProperty('--page-heading-color', "black");
  //     document.documentElement.style.setProperty('--ag-header-color', "rgb(245,245,245)");
  //     document.documentElement.style.setProperty('--submit-button', "#0f5f4b");
  //     document.documentElement.style.setProperty('--other-button-color', "#0f5f4b");
  //     document.documentElement.style.setProperty('--menu-font', "white");
  //     document.documentElement.style.setProperty('--header-font', "rgba(0, 0, 0, 0.54)");
  //   } else {
  //     document.documentElement.style.setProperty('--sidenav-color', "#0f5f4b");
  //     document.documentElement.style.setProperty('--filter-button', "#0f5f4b");
  //     document.documentElement.style.setProperty('--page-heading-color', "black");
  //     document.documentElement.style.setProperty('--ag-header-color', "rgb(245,245,245)");
  //     document.documentElement.style.setProperty('--submit-button', "#0f5f4b");
  //     document.documentElement.style.setProperty('--other-button-color', "#0f5f4b");
  //     document.documentElement.style.setProperty('--menu-font', "white");
  //     document.documentElement.style.setProperty('--header-font', "rgba(0, 0, 0, 0.54)");
  //   }

  //   // this.get_notification()
  //   // this.getEmitter();

  //   navigator.serviceWorker.addEventListener('message', (event) => {
  //     if (event.data.action === 'openUrl') {
  //       // Handle the routing based on the URL received from the service worker
  //       this.router.navigateByUrl(event.data.url);
  //     }
  //   });
  // }


  onToggleSidenav(data: SideNavToggle) {
    debugger
    this.screenwidth = data.screenwidth
    this.collapsed = data.collapsed

    let styleclass = ""
    if (this.collapsed && this.screenwidth > 768) {
      styleclass = 'body-trimmed'
    } else if (this.collapsed && this.screenwidth <= 768 && this.screenwidth > 0) {
      styleclass = 'body-md-screen'
    }
    return styleclass
  }

 
  class() {

    let styleclass = ""
    if (this.collapsed && this.screenwidth > 768) {
      styleclass = 'body-trimmed'
    } else if (this.collapsed && this.screenwidth <= 768 && this.screenwidth > 0) {
      styleclass = 'body-md-screen'
    }
    return styleclass
  }




}
