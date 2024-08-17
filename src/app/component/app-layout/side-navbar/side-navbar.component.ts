import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, HostListener, NgZone, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { DataService } from 'src/app/services/data.service';
import { DialogService } from 'src/app/services/dialog.service';
import { NavItem } from '../nav-items';
interface SideNavToggle {
  screenwidth: number
  collapsed: boolean
}
@Component({
  selector: 'app-side-navbar',
  templateUrl: './side-navbar.component.html',
  styleUrls: ['./side-navbar.component.css']
})
export class SideNavbarComponent implements OnInit {


  @Output() onToggleSidenav: EventEmitter<SideNavToggle> = new EventEmitter

  navItems!: NavItem[]

  collapsed = true
  screenwidth = 0
  user: any
  leftpanel: any;
  leftpanel2: any;
  data: any;
  menu: any
  showSubmenu: boolean = false;
  showSubSubMenu: boolean = false;
  subsectionExpanded: { [key: string]: boolean } = {};
  logo_image: any;
  id: any;
  @ViewChild("confirmationDialog", { static: true }) confirmationDialog!: TemplateRef<any>

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private httpClient: HttpClient,
    private dataservice: DataService,
    public dialogService: DialogService,
    private zone: NgZone,
    private dialogservice:DialogService
  ) {
    let data: any = sessionStorage.getItem("auth")
    this.user = JSON.parse(data)
  }


  toggleSubsection(section: any): void {
    // Iterate through the keys (subsection names) in subsectionExpanded
    // for (let subsectionName in this.subsectionExpanded) {
    //   // Check if the current subsection is not the same as the provided section
    //   if (subsectionName !== section.displayName) {
    //     // Collapse other subsections
    //     this.subsectionExpanded[subsectionName] = false;
    //   }
    // }
  
    // Expand or collapse the provided section
    if (section.children) {
      // Toggle the expansion state of the provided section
      this.subsectionExpanded[section.displayName] = !this.subsectionExpanded[section.displayName];
    }
  }


  ngOnInit(): void {

    this.screenwidth = window.innerWidth
    //  if(this.user?.user_type == "SA" && this.user.role_id == 0){
    //   this.menu = "super-admin"
    // }
    // else if (this.user?.user_type == "SA" && this.user?.role_id == 1) {
    //   this.menu = "super-admin"
    // }
    // else if (this.user?.user_type == "SAAS" && this.user?.role_id == 2) {
    //   this.menu = "saas"
    // } else if (this.user?.user_type == "SAAS" && this.user?.role_id == 3) {
    //   this.menu = "system-user-saas"
    // } 
    
    // else if (this.user?.user_type == "Corporate Customer" && this.user?.role_id == 4) {
    //   this.menu = "corporate-customer"
    // } else if (this.user?.user_type == "Corporate Customer" && (this.user?.role_id >= 5)) {
    //   this.menu = "system-user-customer"
    // }
    // else if (this.user?.user_type == "Corporate") {
    //   this.menu = "end-client"
    // } else if(this.user?.user_type == "Home User"){
    //   this.menu = "home-user"
      
    // } else if(this.user?.user_type == "Client User"){
    //   this.menu = "company-user"
    // } 
    


    // else if (this.user?.user_type == "Corporate Customer" && this.user?.role == "Project Admin") {
    //   this.menu = "project-admin-customer"
    // }

    // this.httpClient.get("assets/menu-json/" + this.menu + ".json")
    this.dataservice.loadConfig('COORDR_menu')
    .subscribe((data: any) => {
      this.navItems = data;
      this.onToggleSidenav.emit({ collapsed: this.collapsed, screenwidth: this.screenwidth })
    })

    if (this.user?.user_type == "SAAS" || this.user?.user_type == "SA") {
      this.logo_image = "../../../../assets/images/Fieldtechy.png"
      let b =  getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim();
      document.documentElement.style.setProperty('--primary', b);
    }

    if (this.user?.user_type == "Corporate Customer") {
      this.id = sessionStorage.getItem("org_id")
      this.dataservice.getDataById("corporate_customer", this.id).subscribe((res: any) => {
        this.logo_image = res.data?.logo

      })

     
  

    //   let da: any = sessionStorage.getItem('theme')
    //   this.leftpanel2 = JSON.parse(da)
    //   // console.log(this.leftpanel2)
    //   let a = this.leftpanel2?.left_panel_color;
    //   if (typeof (a) !== 'string') {
    //   let b =  document.documentElement.style.getPropertyValue('--primary-color')
    //     document.documentElement.style.setProperty('--primary', b);
    //   } else {
    //     document.documentElement.style.setProperty('--primary', a);
    // }
  }

  if (this.user?.user_type == "Corporate" || this.user?.user_type == "Home User" || this.user?.user_type == "Client User" ) {
    this.logo_image = "../../../../assets/images/Fieldtechy.png"
   
  }

  }




  @HostListener('window:ressize', ['$event'])
  onResize(event: any) {
    this.screenwidth = window.innerWidth;
    if (this.screenwidth <= 768) {
      this.collapsed = false
      this.onToggleSidenav.emit({ collapsed: this.collapsed, screenwidth: this.screenwidth })
    }
  }

  togglecollapse(menuItem?:boolean) {
    if(!menuItem){
      this.collapsed = !this.collapsed
      this.onToggleSidenav.emit({ collapsed: this.collapsed, screenwidth: this.screenwidth })
    }
   
  }

  closesidenv() {
    this.collapsed = false
    this.onToggleSidenav.emit({ collapsed: this.collapsed, screenwidth: this.screenwidth })
  }


  logout() {
    this.dialogservice.openDialog(this.confirmationDialog,"20%","20%",{});
   
    // this.zone.run(() => {
    //   if (confirm("Are you sure you want to Logout?")) {
    //     this.router.navigate(['/login']);
    //     sessionStorage.clear();
    //     localStorage.clear();
    //   }
    // });
  }


  cancel(){
    this.dialogservice.closeModal()
  }

  logout1(){
    this.dialogservice.closeModal()
    this.router.navigate(['/login']);
    sessionStorage.clear();
    localStorage.clear();
  }


  dashboard() {
    if (this.user?.user_type == "SAAS") {
      this.router.navigate(['/saas-dashboard']);
    } else if(this.user?.user_type == "Corporate Customer") {
      this.router.navigate(['/corporate-dashboard']);
    }else if(this.user?.user_type == "SA") {
      this.router.navigate(['/saas-dashboard']);
    } else {
      this.router.navigate(['/enduser-dashboard']);
    }

  }

}
