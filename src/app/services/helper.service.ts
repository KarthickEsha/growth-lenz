import { Injectable, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormArray, Validators } from '@angular/forms';
import { DatePipe, PlatformLocation } from '@angular/common';
import { DataService } from './data.service'; 

@Injectable({
  providedIn: 'root'
})
export class HelperService implements OnInit {
  constructor(
    public dataService: DataService, 
    public loc: PlatformLocation,
    private datepipe: DatePipe) {
   
  }

  public ngOnInit() {
  }
  public isLoggedIn(): boolean {
    // check for token expiry, will fail for no token or invalid token
    const token = localStorage.getItem('token');
    try {
      return token && true || false;
    } catch (e) {
      return false;
    }
  }

  public isEmpty = (data: string) => {
    if (data === "") return true;
    return false;
  }

  getDataFromRow(row:any, col: any, type:any, prefix?:any,suffix?:any):any {
    if (!row) return ""
     if (col instanceof Array) {
        let result = ""
        for(let idx=0;idx<col.length;idx++) {
             result += this.getDataFromRow(row,col[idx],type,prefix,suffix)
        }
        return result;
     } else {
      if (col instanceof Object) {
         return  this.getDataFromRow(row,col.name,type,col.prefix,col.suffix)
      } else {
        var dot = col.indexOf('.')
        if (dot > 0) {
          if (row[col.substr(0, dot)])
            return this.getDataFromRow(row[col.substr(0, dot)], col.substr(dot + 1), type,prefix,suffix)
        }
        if (row) {
          let val = this.formatData(row[col], type)
          return  val!=""? (prefix || '') + val + (suffix || ''):""
        }
    }
    }
    return ""
  }

  ControlFormControl(formGroup:FormGroup ,name:string,_delete:boolean=true ,type?:any,required:boolean=false,defaultValue:any=null,pattern?:string) {
    if(_delete){
      if(formGroup.contains(name)) formGroup.removeControl(name)
      console.warn("THE "+name +"Is Deleted",formGroup);
      return
    }

    if(type=='Control'){
      formGroup.addControl(name , new FormControl())
    }else if(type=='Array'){
      formGroup.addControl(name , new FormArray([]))

    }else if(type == 'Group'){
      formGroup.addControl(name , new FormGroup({}))
    }

    if(required){
      formGroup.get(name)?.addValidators([Validators.required])
    }

    if(defaultValue != null){
      formGroup.get(name)?.setValue(defaultValue)
    }

  console.warn( "THE "+name , "VALUE" +formGroup.get(name)?.value);

  }
// ? Wait for Some times
  CheckValueExist(formGroup:FormGroup,controlName:any,operator:any='checknotnun',value:any=''){
    if(!formGroup.contains(controlName)) return false
    let checkValue = formGroup.get(controlName)?.value

    if(operator=='checknotnun'){
     return checkValue
    }

  }



  formatData(data:any, type:any) {
    if (!data) return ''
    if (type == "date") {
      return this.showDate(data)
    } else if (type == "time") {
      return this.showTime(data)
    } else if (type == "dateTime") {
      return this.showDateTime(data)
    } else if (type == "duration") {
      return this.convertMinsToHrsMins(data)
    }
    return data
  }


  convertMinsToHrsMins(minutes: any) {
    let hours, mins;
    var h = Math.floor(minutes / 60);
    var m = Math.round(minutes % 60);
    hours = h < 10 ? '0' + h : h;
    mins = m < 10 ? '0' + m : m;
    return hours + ':' + mins;
  }

  showDate(dt: any) {
    if (!dt) return ""
    try {
      return this.datepipe.transform(dt, 'dd-MM-yy')
    } catch (e) {
      return ""
    }
  }

  showDateTime(dt: any) {
    if (!dt) return ""
    try {
      return this.datepipe.transform(dt, 'dd-MM-yy hh:mm a')
    } catch (e) {
      return ""
    }
  }

  showFullDate(dt: any) {
    if (!dt) return ""
    try {
      return this.datepipe.transform(dt, 'EEE, MMM d, y')
    } catch (e) {
      return ""
    }
  }

  showFullDateTime(dt: any) {
    if (!dt) return ""
    try {
      return this.datepipe.transform(dt, 'EEE, MMM d, y, hh:mm a')
    } catch (e) {
      return ""
    }
  }

  showTime(dt: any) {
    if (!dt) return ""
    try {
      return this.datepipe.transform(dt, 'hh:mm a')
    } catch (e) {
      return ""
    }
  }

  public getFilteredValue(filterValue: any, data: any, column: any) {
    if (this.isEmpty(filterValue) || !data.length || !filterValue) {
      return data;
    } else {
      if (!column.length) {
        let d = data[0];
        column = Object.keys(d);
      }
      var arrayTemp: any = [];
      data.filter((d: any) => {
        Object.keys(d).map(key => {
          if (column.includes(key)) {
            if (d[key] != null && typeof d[key] != 'number' && typeof d[key] != 'object' && typeof d[key] != 'boolean') {
              if (d[key].toLowerCase().indexOf(filterValue) !== -1 || !filterValue) {
                if (arrayTemp.length != 0) {
                  var data = arrayTemp.filter((data: any) => data._id === d._id)

                  if (data.length == 0) {
                    arrayTemp.push(d);
                  }
                }
                else {
                  arrayTemp.push(d);
                }
              }
            }
          }
        });
      })
      return arrayTemp;
    }
  }
  public getToken() {

    return sessionStorage.getItem('token')
  }
  // getRole() {
  //   return sessionStorage.getItem('role')
  // }
  getUserId() {
    return sessionStorage.getItem('user_id')
  }
  
  getRole() {
    let value:any= sessionStorage.getItem('auth')
    let parsedValue:any=JSON.parse(value)
    console.log(parsedValue);
    
    return parsedValue.data.LoginResponse.role
  }
 
  getEmp_id() {
    let value:any= sessionStorage.getItem('auth')
    let parsedValue:any=JSON.parse(value)
    return parsedValue.data.LoginResponse.employee_id
  }

  getDataValidatoion(controls: any, invalidLabels: string = ''): any{
    //   for (const key in controls) {
    //       if (controls.hasOwnProperty(key)) {
    //           const control = controls[key];
      
    //           if (control instanceof FormGroup) {
    //               invalidLabels += this.getDataValidatoion(control?.controls);
    //           } else if (control instanceof FormControl && control?.status === 'INVALID') {
    //               invalidLabels +=controls[key]?._fields[0]?.props?.label + ",";
    //           }else if(control instanceof FormArray && control.status === 'INVALID'){
    //             invalidLabels +=controls[key]._fields[0].props.label + ",";
    //           }
    //       }
    //   console.log(invalidLabels);
    // }
    // var n =invalidLabels.lastIndexOf(",")
    // var value=invalidLabels.substring(0,n)
    // return value;
    for (const key in controls) {
      if (controls.hasOwnProperty(key)) {
          const control = controls[key];
  
          if (control instanceof FormGroup) {
              invalidLabels += this.getDataValidatoion(control?.controls);
          } else if (control instanceof FormControl && control?.status === 'INVALID') {
              if (controls[key]?._fields && controls[key]._fields[0]?.props?.label) {
                  invalidLabels += controls[key]._fields[0].props.label + ",";
              }
          } else if (control instanceof FormArray && control.status === 'INVALID') {
              if (controls[key]?._fields && controls[key]._fields[0]?.props?.label) {
                  invalidLabels += controls[key]._fields[0].props.label + ",";
              }
          }
      }
      // console.log(invalidLabels);
  }
  
  var n = invalidLabels.lastIndexOf(",");
  var value = invalidLabels.substring(0, n);
  return value;
  
  }

}
