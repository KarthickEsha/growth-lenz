import { Component, ViewChild, OnInit, OnDestroy, ChangeDetectorRef, AfterViewInit, Injectable, Input, OnChanges, SimpleChanges, EventEmitter, Output, TemplateRef } from '@angular/core';
import { NavItem } from '../nav-items';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { HttpClient } from "@angular/common/http";
import { MediaMatcher } from '@angular/cdk/layout';

import { MatSidenav } from '@angular/material/sidenav';
import { DataService } from 'src/app/services/data.service';
import { DialogService } from 'src/app/services/dialog.service';
import { FormService } from 'src/app/services/form.service';
import { debounceTime } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
// import { EmitService } from 'src/app/services/emitter.service';
import { SharedService } from 'src/app/services/utils';


//import { ChangePasswordComponent } from '../../authentication/change-password/change-password.component';

@Component({
  selector: 'app-app-header',
  templateUrl: './app-header.component.html',
  styleUrls: ['./app-header.component.css']
})
export class AppHeaderComponent implements OnInit {
  @ViewChild('childMenu') public childMenu: any;
  @Input('company_logo') company_logo: any
  navItems!: NavItem[]
  logo = environment.logoUrl
  CustomerList: any
  role: any
  id: any
  data: any
  profile_image: any
  isContentVisible: boolean = false;
  notification: any
  notify_count: any
  logo_image: any
  @ViewChild("editViewPopup") editViewPopup!: TemplateRef<any>;
  // @ViewChild('editViewPopup') public editViewPopup: any;
  @Output('edit') edit = new EventEmitter<any>();
  user_type: any
  authdata: any
  filter!: any;
  profile_name: any
  profile_email: any
  showProfileInfo: boolean = false
  show_edit_icon: boolean = true
  @ViewChild("drawer") drawer!: MatSidenav;
  @Output() dataToParentOnInit: EventEmitter<any> = new EventEmitter<any>();
  notificationData: any
  isNotificationDrawerOpen = false
  totalNotificationCount = 0
  private clickSubject = new Subject<void>();
  notificationIconClicked = false;
  form!: FormGroup;
  isConnected: boolean = false;
  userOptions = [
    { value: "SAAS", collection: "system_user" },
    { value: "Engineer", collection: "engineer" },
    { value: "Corporate Customer", collection: "system_user" },
    { value: "End User", collection: "user" },
  ];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private httpClient: HttpClient,
    private dataservice: DataService,
    public dialogService: DialogService,
    public formService: FormService,
    private dilog: MatDialog,
    private fb: FormBuilder,
    public cdr: ChangeDetectorRef,
    // private emitter: EmitService,
    private connectionService: SharedService
  ) {
    this.user_type = sessionStorage.getItem("user_type")
    let local_data: any = sessionStorage.getItem('auth')
    this.authdata = JSON.parse(local_data)

    this.form = this.fb.group(
      {
        title: ["", Validators.required],
        body: ["", Validators.required],
        type: new FormControl(null, Validators.required),
        user_type: ["", Validators.required],
        users: [""]
      });
    
  }


  emitterRefresh() {
    debugger
    this.connectionService.isConnected$.subscribe((status: any) => {
      this.isConnected = status;
      this.cdr.detectChanges();
    });
  }

  ngOnInit() {
    debugger
  //   let notification = { "filter": [],"sort":[{
  //     "sort": "desc",
  //     "colId": "notified_on"
  // }] };

    // this.clickSubject.pipe(debounceTime(10)).subscribe(() => this.onClickNotification());

    // this.dataToParentOnInit.emit(this);
    // this.id = sessionStorage.getItem("org_id")
    // let filter = {

    //   start: 0,
    //   end: 50,
    //   filter: [],
    //   sort: [],
    //   switch_over: true,
    // }

    // this.dataservice.getDataByFilter("corporate_customer", filter).subscribe((res: any) => {
    //   if (res.data != null) {
    //     this.CustomerList = res?.data[0]?.response.filter((a: any) => {
    //       if (a.company_name) {
    //         return a
    //       }
    //     })
    //   }
    // })


    //
    // if (this.user_type == "SAAS") {
    //   this.logo_image = "../../../../assets/images/profile_pic.svg"
    //   this.dataservice.getDataById("saas", this.id).subscribe((res: any) => {
    //     this.profile_name = res.data?.name
    //     sessionStorage.setItem("user_data",JSON.stringify(res.data))

    //   })
    //   this.profile_email = sessionStorage.getItem('email_id')
    // }

    // if (this.user_type == 'SA') {
    //   this.logo_image = "../../../../assets/images/profile_pic.svg"
    //   this.profile_email = sessionStorage.getItem('email_id')
    // }
    // if (this.user_type == "Corporate Customer") {
    //   this.dataservice.getDataById("corporate_customer", this.id).subscribe((res: any) => {
    //     this.logo_image = "../../../../assets/images/profile_pic.svg"
    //     this.profile_name = res.data?.company_name
    //     sessionStorage.setItem("saas_id",res.data.created_by)
    //     sessionStorage.setItem("user_data",JSON.stringify(res.data))
    //   })
    //   this.profile_email = sessionStorage.getItem('email_id')
    // }

    // if (this.user_type == "Corporate" || this.user_type == "Client User" || this.user_type == "Home User") {

    //   this.dataservice.getDataById("user", this.authdata.user_id).subscribe((res: any) => {
    //     this.profile_name = res.data?.name
    //     if(res.status == 200 && res.data != null){
    //       sessionStorage.setItem("saas_id",res.data?.saas_id)
    //     }
        
    //     if (res.data?.profile_image != "" && res.data?.profile_image != undefined) {
    //       this.logo_image = res.data?.profile_image
    //     } else {
    //       this.logo_image = "../../../../assets/images/profile_pic.svg"
    //     }
    //     sessionStorage.setItem("user_data",JSON.stringify(res.data))

    //   })
    //   this.profile_email = sessionStorage.getItem('email_id')
    // }
    //  this.notifications()
  }



  toggleProfileInfo() {
    this.showProfileInfo = !this.showProfileInfo;
  }


  //patch the selected data to the field
  selectionChange(value: any) {
    // this.dataservice.getById("auth/switch-user", value._id).subscribe((res: any) => {
    //   if (res.status == 200) {

    //     // const url = this.router.serializeUrl(
    //     //   this.router.createUrlTree([`/corporate-dashboard`], 
    //     //     {queryParams: {
    //     //       code:res.data.token}
    //     //     })
    //     // );

    //     const url = this.router.serializeUrl(
    //       this.router.createUrlTree([`/default-component`],
    //         {
    //           queryParams: {
    //             code: res.data.token
    //           }
    //         })
    //     );
    //     window.open(url, '_blank');
    //   }


    // }, (error: any) => {
    //   this.dialogService.openSnackBar(error.error?.message, "OK");
    // })

  }

  // Switch account as Corporate Customer by SAAS
  setSelectedCusId(event: any) {
    this.dataservice.getDataById("entities/user", event._id).subscribe((res: any) => {
      this.role = sessionStorage.getItem("role")
      this.company_logo = sessionStorage.getItem("company_logo")
      this.router.navigate(['/data/corporate-admin-dashboard']);
    })
  }

  homepage(event: any) {
    this.router.navigate(['/home']);
  }

  navigate(item: any) {
    this.router.navigate([item.route]);
  }

  settings() {
    this.router.navigate(['/settings'])
  }

  company_settings() {
    this.router.navigate(['/company-settings'])
  }


  editicon(data: any) {
    this.edit.emit(data)
    this.show_edit_icon = !this.show_edit_icon
    this.isContentVisible == true;
  }

  notifications() {
    // this.dataservice.getData("request_verification").subscribe((res: any) => {
    //   this.notification = res.data
    //   this.notify_count = res.data.length
    //   console.log(this.notification)
    // })
  }

  drawer_open() {
    this.drawer.toggle();
    this.notifications()
  }


  route_page(data: any) {
    this.router.navigate(["/notification/" + `${data._id}`]);
  }

  onClickNotificationDebounced(): void {
    this.clickSubject.next();
  }

  restartEmitterServer() {
    // this.emitter.connectServer();
  }


  onClickNotification(): void {
    this.notificationIconClicked = true;
    this.isNotificationDrawerOpen = !this.isNotificationDrawerOpen;

    if (this.drawer) {
      this.drawer.open();
    }

    if (this.isNotificationDrawerOpen) {
      let notification = { "filter": [],"sort":[{
        "sort": "desc",
        "colId": "notified_on"
    }] };
      // this.dataservice.getNotification(notification).subscribe((res: any) => {
      //   this.notificationData = res.data[0].response;
      //   this.totalNotificationCount = this.notificationData.length;
      //   // this.transform(this.notificationData)
      // });
    }
  }

  notificatonViewed(data: any) {

    let isSeen = { "is_seen": true }
  //   this.dataservice.notificationViews(data._id, isSeen).subscribe((res: any) => {
  //     res
  //     this.notificationIconClicked = false;
  //     let notification = { "filter": [],"sort":[{
  //      "sort": "desc",
  //      "colId": "notified_on"
  //  }] };
  //    this.dataservice.getNotification(notification).subscribe((res: any) => {
  //      if (res.data != null) {
  //        this.notificationData = res.data[0].response
  //        this.totalNotificationCount = this.notificationData.length;

      //  }
    //  })
 
    // })
   
  }

  closeNotificaton(data: any) {

    let isSeen = { "is_seen": true }
    // this.dataservice.notificationViews(data._id, isSeen).subscribe((res: any) => {
    //   const index = this.notificationData.findIndex((item: any) => item._id === data._id);
    //   if (index !== -1) {
    //     this.notificationData.splice(index, 1);
    //     this.cdr.detectChanges();
    //     this.totalNotificationCount = this.notificationData.length;
    //   }

    // })
  }

  onAddButonClick() {
    this.dilog.open(this.editViewPopup, {
      width: "30%",
      height: "auto",
    });
  }

  finalFilter: any[] = [];
  getFilterData(selectedUserType: any[]) {
    if (selectedUserType.length === 1) {
      this.finalFilter = [];
        const collection = selectedUserType[0].collection;
        const value = selectedUserType[0].value;
        this.makeAPICall(collection, value);
    } else if(selectedUserType.length > 1) {
      this.finalFilter = [];
        selectedUserType.forEach((type:any) => {
            const collection = type.collection;
            const value = type.value;
            this.makeAPICall(collection, value);
        });
    } else {
      this.finalFilter = [];
    }
  }

  makeAPICall(collection: string, value: string) {
    let filter: any
    if(collection == "system_user") {
      filter = {
        "filter": [
          {
              "clause": "AND",
              "conditions": [
                  {
                      "column": "user_type",
                      "operator": "EQUALS",
                      "type": "string",
                      "value": value
                  }
              ]
          }
      ]
      }
    } else {
      filter = {}
    }
    this.dataservice.getDataByFilter(collection, filter).subscribe((res: any) => {
      let filteredData: any[];
      if (collection === "engineer") {
          let data = res.data[0].response;
          filteredData = data.map((e: any) => {
              return {
                  full_name: `${e.contact.first_name} ${e.contact.last_name}`,
                  _id: `${e._id}`
              };
          });
      } else if (collection === "user") {
          let data = res.data[0].response;
          filteredData = data.map((e: any) => {
            return {
              full_name: `${e.client_name}`,
              _id: `${e._id}`
            }
          });
      } else {
          let data = res.data[0].response;
          filteredData = data.map((e: any) => {
            return {
              full_name: `${e.contact.first_name} ${e.contact.last_name}`,
              _id: `${e._id}`
            }
          });
      }
      this.finalFilter.push(...filteredData);
      console.error(this.finalFilter);
  });
}

  closeDialog() {
    this.dilog.closeAll();
  }

  sendEmitterMessage() {
    if (this.form.invalid) {
      this.form.markAllAsTouched()
      return
    }
    let channelName: any = sessionStorage.getItem('channel_name')
    let channelKey: any = sessionStorage.getItem('channel_key')
    let userID: any = sessionStorage.getItem('user_id')
    let values = this.form.value.user_type.map((e: any) => e.value);
    console.log(this.form.value.users);
    console.log(this.finalFilter);
    let matchedIds = this.findIds(this.form.value.users, this.finalFilter);
    const messageString = { 
      "from": userID,
      "to":matchedIds,
      "user_type":values,
      "type":this.form.value.type, 
      "data" : {
        "title":this.form.value.title, 
        "body":this.form.value.body, 
      }}
    const messageObject = JSON.stringify(messageString);
    // this.emitter.sendMessage(channelKey, channelName, messageObject);
  }

  findIds(users: any, filter: any) {
    let result: any = [];
    users.forEach((user: any) => {
        const matchedUser = filter.find((item: any) => item.full_name === user);
        if (matchedUser) {
            result.push(matchedUser._id);
        }
    });
    return result;
}

  clearAllData() {

    let completedCount = 0;
    const totalCount = this.notificationData.length;

    this.notificationData.forEach((item: any, index: number) => {
      let isSeen = { "is_seen": true };
      // this.dataservice.notificationViews(item._id, isSeen).subscribe((res: any) => {
      //   console.log('Updated data:', res);
      //   completedCount++;
      //   if (completedCount === totalCount) {
      //     // All API calls have completed, update notificationData to an empty array
      //     this.notificationData = [];
      //     this.totalNotificationCount = this.notificationData.length;
      //   }
      // });
    });

  }


  getFormattedDate(date: Date): string {

    const today = new Date();
    const dates = new Date(date);

    const diffInMs = Math.abs(today.getTime() - dates.getTime());
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const minutesDifference = Math.round(((diffInMs % (1000 * 60 * 60 * 24)) % (1000 * 60 * 60)) / (1000 * 60));

    if (diffInHours === 0) {
      return `${minutesDifference} minutes ago`;
    }
    else if (diffInHours < 24) {
      return `${diffInHours} hours ${minutesDifference} minutes ago`;
    } else {
      return dates.toLocaleString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true });
    }

    // "0001-01-01T00:00:00Z"

  }
}


