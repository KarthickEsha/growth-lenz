import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { DataService } from 'src/app/services/data.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-dynamic-view',
  templateUrl: './dynamic-view.component.html',
  styleUrls: ['./dynamic-view.component.css']
})
export class DynamicViewComponent {
  formName:any
id:any
fields:any
selectedModel:any
pageHeading:any
collectionName:any
onCancelRoute:any
config:any
showLogo:any
logo:any
headingId:any
viewId:any
tooltip:any
user_type:any

  constructor(private httpClient:HttpClient,
    private route:ActivatedRoute,
    private dataService:DataService,
    private router:Router,
    private location: Location){

  }
ngOnInit(){
  debugger
 this.route.params.subscribe(params => {
    if (params['form']) {
      this.formName = params['form'];

    }
    if (params['id'] != undefined) {
      this.id = params['id']
    }
  })
  this.loadConfig()
  this.user_type = sessionStorage.getItem('user_type')
}



loadConfig(){
  this.httpClient.get("assets/jsons/"+ this.formName +"-view.json").subscribe((config:any)=>{
    // this.pageHeading =config.pageHeading
    this.config=config
    this.pageHeading = config.heading_name
    this.tooltip = config.editTooltip
    this.logo =config.logo
    this.headingId = config.keyField
    this.fields = config.form.fields
    this.onCancelRoute = config.onCancelRoute
    this.collectionName = config.form.collectionName
    this.getData()
  })
}

view:any
getData(){
this.dataService.getparentdataById(this.collectionName,this.id).subscribe((res:any)=>{
  this.selectedModel = res.data
  console.log(this.selectedModel)
  this.view = this.selectedModel[this.pageHeading]
  this.viewId =this.selectedModel[this.headingId]
  this.showLogo = this.selectedModel[this.logo]

})
}

goBack(){
  // this.router.navigate([`${this.onCancelRoute}`]);
  this.location.back();
}

edit(){
  this.router.navigate([`${this.config.editRoute}`,this.selectedModel[this.config.keyField],
  ]);
}
}
