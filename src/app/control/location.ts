import { FieldType,} from '@ngx-formly/core';
import { Component, ElementRef, NgZone, OnInit,ViewChild } from '@angular/core';
import * as geolib from 'geolib'; 
import { FormControl } from '@angular/forms';
import { LocationService, Maps } from '../services/location-service';
import { DataService } from '../services/data.service';
import { DialogService } from '../services/dialog.service';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';
interface Entry {
  place: google.maps.places.PlaceResult;
  marker: google.maps.Marker;
 
 
  ellipse: google.maps.Polygon;

  location:any; // Replace 'any' with the actual type of location if available
}

let colorIndex = 0;
const GOOGLE_MAPS_API_KEY = 'AIzaSyCfFOJKcxzq3BMnJPZBZ52P80r3kKGTOhw';
const place = null as unknown as google.maps.places.PlaceResult;
type Components = typeof place.address_components;

@Component({
  selector: 'location',
  template: `

  <style>p {
    font-family: Lato;
  }
  
  dl {
    font-size: 13px;
  }
  
  dl code {
    padding: 0 3px;
    border: 1px solid #ccc;
    white-space: nowrap;
  }
  
  input[type=text] {
    width: 100%;
    padding: 3px;
  }
  
  table {
    margin: 10px 0;
    border: 1px solid red;
  }
  

  .map {
    margin: 10px 0;
    height: 400px;
    width:100%
  }
 
  .button-container {
    display: flex;
    align-items: center;
  }

 
  .custom-button{
    background-color: #013688;
    color: white;
    border: none;
    cursor: pointer;
    height: 26px;
    width: 70px;
    margin-left: 10px;
}
  



  </style>
  <mat-label >{{field.props!['label']}} <mat-label>
  <div *ngIf="show== true" class="button-container">
  <input 
    placeholder={{field.props.placeholder}}
    autocorrect="off"
    autocapitalize="off"
    spellcheck="off"
    type="text"
    [readonly]=input_readonly
    class="form-control"
    [formControl]="FormControl"  
  [formlyAttributes]="field"
  [required]="required"
    #search
  />

  <button mat-raised-button (click)="searchLocation()" [disabled]="this.model.disableEdit" class="custom-button">Search</button>
</div>


<div class="map" #map></div>

  `
})

export class Location extends FieldType<any> implements OnInit {
  @ViewChild('search')
  public searchElementRef!: ElementRef;
  public geoCoder!:any;
  @ViewChild('map',{static:true})
  public mapElementRef!: ElementRef;
  show:boolean=true
  public entries:Entry[] = [];
  private currentMarker: google.maps.Marker | null = null;
  public place!: google.maps.places.PlaceResult;
  required:any
  input_readonly:boolean = false

  public locationFields = [
    'name',
    'cityName',
    'stateCode',
    'stateName',
    'countryName',
    'countryCode',
  ];

  private map!: google.maps.Map;

  constructor(public locationService: LocationService,
    private http: HttpClient,
     private ngZone: NgZone,
      private  dataService:DataService,
      public dialogService: DialogService   ) {
    super();
    // locationService.api.then((maps) => {
    //   this.initAutocomplete(maps);
    //   this.initMap(maps);
    // });
  }
  ngOnInit(): void {
    this.locationService.api.then((maps) => {
      this.initAutocomplete(maps);
      this.initMap(maps);
    });
  }
  public get FormControl() {
    return this.formControl as FormControl;
  }

  
  

  initAutocomplete(maps: Maps) {
    debugger
    if(this.model.disableEdit && this.field.address_disabled) return  // to hide the dropdown
    this.show=this.field?.showsearchbar
    this.required=this.field.props?.required
    let autocomplete = new maps.places.Autocomplete(
      this.searchElementRef?.nativeElement
    ); 
    console.log(autocomplete)
    autocomplete.addListener('place_changed', () => {
      this.ngZone.run(() => {
        this.onPlaceChange(autocomplete.getPlace());
      });
    });



  }

 
initMap(maps: Maps) {
     this.show=this.field.showsearchbar
  let center
  let location=this.model[this.field.key]
  if(this.model.disableEdit && this.field.address_disabled){
this.input_readonly = true
  }

  if(this.field.props.attribute == "array_of_object"){
    const keys = this.field.key.split(".");
  
    // Check if the split operation resulted in an array with at least one key
    if (keys.length > 0) {
      location = keys.reduce((o: any, i: any) => o && o[i], this.model);
    }
  }
  if(location!=undefined  && Object.keys(location).length > 0){
let address=""

    if(location.street){
      address += location.street +","
       }
    if(location.area_name){
      address += location.area_name+","
       }
    if(location.city){
      address += location.city+","
       }
       if(location.zipcode){
        address += location.zipcode+","
         }
    if(location.state){
      address += location.state+","
    }
       
    if(location.country){
      address += location.country
       }

    // let address=location?.area_name + "," + location?.city +","+ location?.state +","+ location?.country
    this.searchElementRef.nativeElement.value=address
    center=new google.maps.LatLng(location.coordinates[1], location.coordinates[0]);
    
  


  } else{
    center=new google.maps.LatLng(20.593684, 78.96288);
    this.searchElementRef.nativeElement.value=""
  }
  this.map = new maps.Map(this.mapElementRef.nativeElement, {
    zoom: 7,
    center:center
  });

  const marker = new google.maps.Marker({
    position: center,
    animation: google.maps.Animation.DROP,
    map: this.map,
   draggable: this.field.draggable,
  });
  this.map.setCenter(center);
  this.map.setZoom(15); 
 
 // While drag the Marker
 marker.addListener("dragend", () => {
  // patch the  lat and long in control
  let location= marker.getPosition() as google.maps.LatLng

  let coordinates=[
    location.lng(),
    location.lat()
  ]
   this.field.formControl.value.coordinates=coordinates
  console.log(this.formControl.value)
   });

// for Engineer profile, address name bind
   if(this.field.address_code == true){
    let address=""

    if(location.street){
      address += location.street +","
       }
    if(location.area_name){
      address += location.area_name+","
       }
    if(location.city){
      address += location.city+","
       }
       if(location.zipcode){
        address += location.zipcode+","
         }
    if(location.state){
      address += location.state+","
    }
       
    if(location.country){
      address += location.country
       }
       this.searchElementRef.nativeElement.value=address
  }


   if(this.field.check_country_validation && this.model?.work_location_type == "On-site" && this.model[this.field.key]?.country_code != undefined){
    this.country_validation(this.model[this.field.key].country_code,"on_site_service_providing_countries",this.model[this.field.parent_key])
   }
   if(this.field.check_country_validation && this.model?.work_location_type == "Remote"  && this.model[this.field.key]?.country_code != undefined){
    this.country_validation(this.model[this.field.key].country_code,"remote_service_providing_countries",this.model[this.field.parent_key])
   }

   if(this.field.check_country_validation_in_client && this.model?.work_location_type == "On-site" && this.model[this.field.key]?.country_code != undefined){
    let saas_id = sessionStorage.getItem("saas_id")
    this.country_validation(this.model[this.field.key].country_code,"on_site_service_providing_countries",saas_id)
   }
   if(this.field.check_country_validation_in_client && this.model?.work_location_type == "Remote" && this.model[this.field.key]?.country_code != undefined){
    let saas_id = sessionStorage.getItem("saas_id")
    this.country_validation(this.model[this.field.key]?.country_code,"remote_service_providing_countries",saas_id)
   }
}

  
  
  searchLocation() {


    const searchInput = this.searchElementRef.nativeElement;
    const searchQuery = searchInput.value;
    

    if (searchQuery) {
      const autocomplete = new google.maps.places.AutocompleteService();
      autocomplete.getPlacePredictions(
        {
          input: searchQuery,
        },
        (predictions, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK) {
            if (predictions && predictions.length > 0) {
              const firstPrediction = predictions[0];
              if (firstPrediction.place_id) {
                const placesService = new google.maps.places.PlacesService(this.map);
                placesService.getDetails(
                  {
                    placeId: firstPrediction.place_id,
                  },
                  (place:any, status) => {
                    if (status === google.maps.places.PlacesServiceStatus.OK) {
                      this.onPlaceChange(place);
                      this.map.setCenter(place.geometry!.location!);
                      this.map.setZoom(15); // Adjust the zoom level as per your requirements
                    }
                  }
                );
              }
            }
          }
        }
      );
    }
    
  }

  onPlaceChange(place: google.maps.places.PlaceResult) {
    
    this.map.setCenter(place.geometry!.location!);
        console.log(place.geometry!.location)

    const marker = new google.maps.Marker({
      position: place.geometry!.location,
      animation: google.maps.Animation.DROP,
      map: this.map,
     draggable: true, 
    });
  

    
// While drag the Marker
   marker.addListener("dragend", () => {
   // patch the  lat and long in control
   let location= marker.getPosition() as google.maps.LatLng
   let coordinates=[
    location.lng(),
    location.lat()
  ]
   this.field.formControl.value.coordinates=coordinates
   console.log(this.formControl.value)
    });

 
    


    if (this.currentMarker) {
      this.currentMarker.setMap(null);
    }
    this.currentMarker = marker;
    const rectangle = new google.maps.Rectangle({
      strokeOpacity: 0.8,
      strokeWeight: 2,
      strokeColor: 'transparent',
      fillOpacity: 0,
      map: this.map,
      bounds: place.geometry!.viewport,
    });

    const expandedRectangle = new google.maps.Rectangle({
    
      strokeOpacity: 0.8,
      strokeWeight: 0.5,
      strokeColor: 'transparent',
      fillOpacity: 0,
      map: this.map,
      bounds: expandBounds(place.geometry!.viewport!.toJSON(), 5000),
    });

    const location = this.locationFromPlace(place);

    const ellipse = new google.maps.Polygon({
      paths: toEllipse(location!.bounds).map(
        ({ latitude, longitude }) => new google.maps.LatLng(latitude, longitude)
      ),
     
      strokeOpacity: 1,
      strokeWeight: 1,
      strokeColor: 'transparent',
      fillOpacity: 0,

    });
    ellipse.setMap(this.map);

    this.entries.unshift({
      place,
      marker,
      ellipse,
      location,
    });


   
     // Set latitude and longitude in the form control
  if (this.currentMarker) {
    let location= marker.getPosition() as google.maps.LatLng
    const latitude = location.lat();
    const longitude =location.lng();
    console.log(latitude,longitude)
    const area:any= this.entries[0]?.place.address_components
    const street_name=this.entries[0].location.name
    const area_name:any=area[1].long_name
    const city=this.entries[0].location.cityName
    const state=this.entries[0].location.stateName
    const country=this.entries[0].location.countryName
    const zipcode=this.entries[0].location.poastalCode
    let coordinates=[
      longitude,
     latitude,
    ]
          let data:any={
            coordinates,
            "street":street_name,
          "area_name":area_name,
          "city":city,
          "state":state,
          "country":country,
         "zipcode":zipcode
          }
          if(this.field.country_code == true){
            data=Object.assign(data,{"country_code":this.entries[0].location.countryCode})
          }

         
          if(this.field.address_code == true){
            data=Object.assign(data,{"country_code":this.entries[0].location.countryCode,"state_code":this.entries[0].location?.stateCode})
          }
          // if(this.field.address_code_name==true){
          //   data=Object.assign(data,{"country_code":this.entries[0].location.countryCode,"state_code":this.entries[0].location?.stateCode})
          // }
          if(this.field.zipcode_required){
            if(data.zip_code==undefined){
              this.formControl.setErrors({ 'required': true }); // Set a custom error
              return this.dialogService.openSnackBar(this.field.error_msg,"OK")
            }
          }
    this.field.formControl.setValue(data);

    if((this.field.check_country_validation || this.field.check_country_validation_in_client)&& this.model.work_location_type == undefined){
      this.field.formControl.setValue(null)
      return this.dialogService.openSnackBar("Please select the work location type","OK")
    }

    if(this.field.check_country_validation && this.model?.work_location_type == "On-site" && data.country_code != undefined){
      this.country_validation(data.country_code,"on_site_service_providing_countries",this.model[this.field.parent_key])
     }

     if(this.field.check_country_validation && this.model?.work_location_type == "Remote" && data.country_code != undefined){
      this.country_validation(data.country_code,"remote_service_providing_countries",this.model[this.field.parent_key])
     }

    //  End Client /Home User Validation
    if(this.field.check_country_validation_in_client && this.model?.work_location_type == "On-site" && data.country_code != undefined){
      let saas_id = sessionStorage.getItem("saas_id")
      this.country_validation(data.country_code,"on_site_service_providing_countries",saas_id)
     }

     if(this.field.check_country_validation_in_client && this.model?.work_location_type == "Remote" && data.country_code != undefined){
      let saas_id = sessionStorage.getItem("saas_id")
      this.country_validation(data.country_code,"remote_service_providing_countries",saas_id)
     }
     if(this.field.project_based){
       let project_id =sessionStorage.getItem('project_id')
      this.country_validation(data.country_code,"on_site_service_providing_countries",project_id)
     }
    
  }
   // Update the input field value with the formatted address
   const formattedAddress = place.formatted_address;
   this.searchElementRef.nativeElement.value = formattedAddress;
  }

 
  country_validation(countrycode:any,field:any,value:any){
let country_code= countrycode
 if(this.field.collectionName && country_code!=undefined){
  this.dataService.getparentdataById(this.field.collectionName,value).subscribe((res:any)=>{
    let data = res.data
    if(data!=undefined ){
      let isPresent
      if(this.field.project_based){
        let on_site_country :any[]=[] = data[this.field.parent_columns[0]] || []
        let remote_site_country :any[]=[] = data[this.field.parent_columns[1]] || []
        
        let total_country = [...on_site_country,...remote_site_country]
         let country:any= [...new Set(total_country)];
         isPresent =country.includes(countrycode) 
      } else 

      isPresent = data[field].includes(countrycode) 
      if(!isPresent){
        this.dialogService.openSnackBar(this.field.error_msg,"OK")
        this.field.formControl.setErrors({ 'country_valid': false }); // Set a custom error
         this.field.formControl.value.country_code = undefined
      }
    }
  })




 }



  }

  // country_validation_remote(countrycode:any,field:any){
  //   let saas_id = sessionStorage.getItem("saas_id")
  //   if(this.field.collectionName2 && countrycode!=undefined && saas_id != undefined){
  //   this.dataService.getDataById("saas",saas_id).subscribe((res:any)=>{
  //     let data = res.data
  //     if(data!=undefined ){
  //       let isPresent = data[field].includes(countrycode) 
  //       if(!isPresent){
  //         this.dialogService.openSnackBar("The selected project country does not match the job post country","OK")
  //         this.field.formControl.setErrors({ 'country_valid': false }); // Set a custom error
  //          this.field.formControl.value.country_code = undefined
  //       }
  //     }


  public locationFromPlace(place: google.maps.places.PlaceResult) {
    debugger
    const components = place.address_components;
    if (components === undefined) {
      return null;
    }

    const areaLevel3 = getShort(components, 'administrative_area_level_3');
    const locality = getLong(components, 'locality');

    const cityName = locality || areaLevel3;
    const countryName = getLong(components, 'country');
    const countryCode = getShort(components, 'country');
    const stateCode = getShort(components, 'administrative_area_level_1');
    const stateName = getLong(components, 'administrative_area_level_1');
    const poastalCode = getLong(components, 'postal_code');
    const name = place.name !== cityName ? place.name : null;

    const coordinates = {
      latitude: place.geometry!.location!.lat(),
      longitude: place.geometry!.location!.lng(),
    };

    const bounds = place.geometry!.viewport!.toJSON();

    // placeId is in place.place_id, if needed
    return {
      name,
      cityName,
      poastalCode,
      countryName,
      countryCode,
      stateCode,
      stateName,
      bounds,
      coordinates,
    };
  }
}

function getComponent(components: Components, name: string) {
  return components!.filter((component) => component.types[0] === name)[0];
}

function getLong(components: Components, name: string) {
  const component = getComponent(components, name);
  return component && component.long_name;
}

function getShort(components: Components, name: string) {
  const component = getComponent(components, name);
  return component && component.short_name;
}

function toEllipse({ north, south, east, west }: cosmos.LatLngBoundsLiteral) {
  const latitude = (north + south) / 2;
  const longitude = (east + west) / 2;
  const r1 =
    geolib.getDistance(
      { latitude: north, longitude },
      { latitude: south, longitude }
    ) / 2;
  const r2 =
    geolib.getDistance(
      { latitude, longitude: west },
      { latitude, longitude: east }
    ) / 2;

  const center = { latitude, longitude };
  const latitudeConv =
    geolib.getDistance(center, { latitude: latitude + 0.1, longitude }) * 10;
  const longitudeCong =
    geolib.getDistance(center, { latitude, longitude: longitude + 0.1 }) * 10;

  const points: cosmos.Coordinates[] = [];
  const FULL = Math.PI * 2;
  for (let i = 0; i <= FULL + 0.0001; i += FULL / 8) {
    points.push({
      latitude: latitude + (r1 * Math.cos(i)) / latitudeConv,
      longitude: longitude + (r2 * Math.sin(i)) / longitudeCong,
    });
  }
  return points;
}

function expandBounds(bounds: cosmos.LatLngBoundsLiteral, meters: number) {
  const SQRT_2 = 1.4142135623730951;
  const { longitude: west, latitude: north } = geolib.computeDestinationPoint(
    {
      latitude: bounds.north,
      longitude: bounds.west,
    },
    SQRT_2 * meters,
    315
  );
  const { longitude: east, latitude: south } = geolib.computeDestinationPoint(
    {
      latitude: bounds.south,
      longitude: bounds.east,
    },
    SQRT_2 * meters,
    135
  );
  return { west, north, east, south };
}

namespace cosmos {
  export interface Coordinates {
    /**
     * Coordinates latitude.
     * @type {number}
     */
    latitude: number;
    /**
     * Coordinates longitude.
     * @type {number}
     */
    longitude: number;
  }
  export interface LatLngBoundsLiteral {
    /**
     * LatLngBoundsLiteral east.
     * @type {number}
     */
    east: number;
    /**
     * LatLngBoundsLiteral north.
     * @type {number}
     */
    north: number;
    /**
     * LatLngBoundsLiteral south.
     * @type {number}
     */
    south: number;
    /**
     * LatLngBoundsLiteral west.
     * @type {number}
     */
    west: number;
  }
}