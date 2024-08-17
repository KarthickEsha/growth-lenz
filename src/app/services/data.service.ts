import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";
import * as _ from "lodash";
import * as moment from "moment";
import { firstValueFrom, Observable } from "rxjs";
import { DialogService } from "./dialog.service";

@Injectable({
  providedIn: "root",
})
export class DataService {
  constructor(private http: HttpClient, private dilogService: DialogService) {}

  public getWsBaseUrl() {
    return environment.apiBaseUrl;
  }

  getRole() {
    let value: any = sessionStorage.getItem("auth");
    let parsedValue: any = JSON.parse(value);
    console.log(parsedValue);

    return parsedValue.data.LoginResponse.role;
  }

  /**Api
   * @screenApi loadScreenConfigJson,loadListConfigJson,loadReportConfigJson
   *
   * @baseCrud
   * @getData It take input as Collectionname Get All data
   * @getDataById it take input collectioname , id(_id)
   * @deleteDataById it take input collectioname , id(_id)
   * @save it take input collectioname , data
   * @update it take the input collectioname,_id , data
   * @getDataByFilter it take input as filter condition and take the match data list
   */

  //#region  // ? Screen Config
  /**
   * This method mainly used for Form Json Name
   * IT Can used for both  Screen List Json (or) form Json (or) menu Json
   * @screenId Screen Name
   * @data must be in (Screen-Json-name-list) (or) (form-Json-name) (or) (menujosnname) && etc...
   */
  public loadScreenConfigJson(
    screenId: string,
    collectionName?: any
  ): Observable<any> {
    return this.loadConfig(screenId, collectionName);
  }

  /**
   * This method used for Screen List Json
   * @screenId Screen only List Json Name Because we ADD Screen name + -list
   */
  public loadListConfigJson(screenlistId: string): Observable<any> {
    return this.loadConfig(screenlistId + "-list");
  }

  /**
   * This method used for Screen List Json
   * @screenId Screen only Resport Json Name Because we ADD Screen name + -report
   */
  public loadReportConfigJson(screenreportId: string): Observable<any> {
    return this.loadConfig(screenreportId + "-report");
  }

  /**
   * This method used for Screen View Json
   * @screenId Screen only View Json Name Because we ADD Screen name + -view
   */
  public loadViewConfigJson(screenViewId: string): Observable<any> {
    return this.loadConfig(screenViewId + "-view");
  }

  public loadConfig(
    screenId: any,
    collectionName: any = "screen"
  ): Observable<any> {
    //let config = sessionStorage.getItem(screenId)
    return new Observable((observer) => {
      // if (config) {
      //   observer.next(JSON.parse(config))
      // }

      this.getDataById(collectionName, screenId).subscribe((result: any) => {
        let config = result.data ? result.data[0].config : [];
        observer.next(JSON.parse(config));
      });
    });
  }

  //#endregion

  //#region  // ? Crud
  /**
   * This method Get Data By ID(_id) Dynamic Data from Data base using collectionName and ID
   * @collectionName Dynamic pass of Collection Name
   * @ID Dynamic pass of _id or any Primary key
   */
  public getDataById(collectionName: any, id: any) {
    return this.http.get(
      this.getWsBaseUrl() + "entities/" + collectionName + "/" + id
    );
  }

  /**
   * This method Send New Data
   * @collectionName Dynamic pass of Collection Name
   * @Data Any TYPE of Data
   */
  public save(collectionName: any, data: any, configDatabaseflag?: any) {
    return this.http.post(
      this.getWsBaseUrl() + "entities/" + `${collectionName}`,
      data
    );
  }

  /**
   * This method Upset Method IT check If Data is Present it Updata Or Else in Create A new data
   * This Can used For Both Save and Update
   * @collectionName Dynamic pass of Collection Name
   * @id is Refered as Primarykey
   * @Data Any TYPE of Data
   */
  //! need to change the data before the
  public update(collectionName: any, id: any, data: any) {
    return this.http.put(
      this.getWsBaseUrl() + "entities/" + `${collectionName}` + `/${id}`,
      data
    );
  }

  /**
   * This method USed To Get data Using Filter Condition
   * @filter
   * var filterCondition1 =
   *  [
   * {
   *   clause: "AND",
   *   conditions: [
   *    { column: , operator: "EQUALS", value:  },
   *  ]
   * }
   * ]
   * @clause Type OR ,AND,$nor,$in,$nin
   * @conditions It Should Be in Array of Object
   * @operator Type * "EQUALS","NOTEQUAL", "NOTCONTAINS","STARTSWITH","ENDSWITH","LESSTHAN","GREATERTHAN","LESSTHANOREQUAL","GREATERTHANOREQUAL","INRANGE","BLANK","NOTBLANK","EXISTS","IN"
   * @column Key name
   * @value Value For the Key to match
   */
  public getDataByFilter(collectionName: any, data: any) {
    console.log(data);

    //  CHnage Into  Below
    // return this.http.get(this.getWsBaseUrl() + "entities/" + collectionName);
    return this.http.post(
      this.getWsBaseUrl() + "entities/filter/" + collectionName,
      data
    );
  }

  //deleteDataByModel Chnage it parent detelet
  //PArent delete Child Delete
  public deleteDataByModel(collectionName: any, id: any) {
    return this.http.delete(
      this.getWsBaseUrl() + "entities/" + collectionName + "/_id/" + id
    );
  }

  /**
   * This method Delete Data By ID(_id) Dynamic Data from Data base using collectionName and ID
   * @collectionName Dynamic pass of Collection Name
   * @ID Dynamic pass of _id or any Primary key
   */
  public deleteDataById(collectionName: any, id: any) {
    // let role: any = this.getRole()
    // if (role   == "SA") {
    //   return this.http.delete(this.getWsConfigUrl()+"entities/"+`${collectionName}`+  '/' + id);
    // }
    return this.http.delete(
      this.getWsBaseUrl() + "entities/" + collectionName + "/" + id
    );
  }

  /**
   * This method Delete Image In S3
   * @collectionName Dynamic pass of Collection Name
   * @ID Dynamic pass of _id or any Primary key
   */
  public deleteImageS3(userfiles_id: any, stoagename: any) {
    // let role:any = this.getRole()
    // if (role   == "SA") {
    //   return this.http.delete(this.getWsConfigUrl()+"file/delete/"+`${userfiles_id}`+'/' + stoagename);
    // }
    return this.http.delete(
      this.getWsBaseUrl() + "file/delete/" + userfiles_id + "/" + stoagename
    );
  }

  //#endregion

  //#region  // ? DataSet
  public dataSetPreview(data: any) {
    return this.http.post(this.getWsBaseUrl() + "dataset/config", data);
  }
  public dataSetSave(methodName: any, data: any) {
    return this.http.post(
      this.getWsBaseUrl() + `dataset/config/${methodName}`,
      data
    );
  }
  public dataSetupdate(id: any, data: any) {
    return this.http.put(this.getWsBaseUrl() + `dataset/${id}`, data);
  }

  public dataset_Get_Data(dataSetName: string, filterData?: any) {
    return this.http.post(
      this.getWsBaseUrl() + `dataset/data/${dataSetName}`,
      filterData
    );
  }
  //#endregion

  //#region   // ? Auth
  public login(data: any) {
    return this.http.post(this.getWsBaseUrl() + "auth/login", data);
  }

  //change password
  public changePassword(data: any, collectionName: any) {
    return this.http.post(
      this.getWsBaseUrl() + "change-password/" + `${collectionName}`,
      data
    );
  }

  public forgotPswd(data?: any, id?: any) {
    return this.http.post(
      this.getWsBaseUrl() + "user/forget-password/" + `${id}`,
      data
    );
  }
  //#endregion
  //#region  // ?  DATA HANDELER THROUGH API

  async dataHandler(data: any, model: any) {
    // Validate data
    if (!data || !data.methodType) {
      this.dilogService.openSnackBar("Data Structure is Not Valid");
      return;
    }

    let apiObservable: Observable<any>;

    // Determine method type
    switch (data.methodType) {
      case "get":
        let compressData: any = _.cloneDeep(data);
        if (
          !_.isEmpty(_.get(compressData, "conditions")) &&
          _.hasIn(compressData, "conditions")
        ) {
          let condtions = _.get(compressData, "conditions");
          condtions.forEach((element: any) => {
            let matches = [...element["params"].matchAll(/\{\{([^}]+)\}\}/g)];
            let keyarr = matches.map((match) => match[1].trim());
            let objectKey = keyarr[0];
            if (element["valueType"] != "staic") {
              compressData[objectKey] = this.valueFinder(
                element,
                compressData,
                "value"
              );
            } else {
              compressData[objectKey] = element["value"];
            }
          });
        }

        const endpointExtra = this.processText(data["endPoint"], compressData);
        console.warn(endpointExtra);

        apiObservable = this.http.get(`${this.getWsBaseUrl()}${endpointExtra}`);
        break;
      case "post":
        if (!data.postendPoint) {
          this.dilogService.openSnackBar("Data Post End Point is Not Valid");
          return;
        }

        const filterData = this.filterQuery(data, model);
        console.log(filterData);
        const filter: any = { start: 0, end: 20, filter: filterData };
        console.log("filter", filter);

        switch (data.postendPoint) {
          case "filter":
            apiObservable = this.getDataByFilter(data.collectionName, filter);
            break;
          case "dataset":
            filter["filterParams"] = [];
            const filterParams = this.makeDataSetQuery(
              data["filterParams"],
              filter["filterParams"],
              model
            );
            console.log("filterParams", filterParams);

            apiObservable = this.dataset_Get_Data(data.collectionName, filter);
            break;
          default:
            this.dilogService.openSnackBar("Unsupported Post End Point");
            return;
        }
        break;
      default:
        this.dilogService.openSnackBar("Unsupported Method Type");
        return;
    }

    try {
      let resposnse = await firstValueFrom(apiObservable);
      return resposnse.data[0].response;
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  }
  makeDataSetQuery(filterConditions: any, conditions: any, model_data?: any) {
    if (filterConditions && filterConditions.length) {
      filterConditions.forEach((c: any) => {
        var data = c["value"];
        //check whether any {{}} expression is there or not?
        if (typeof data == "string" && data.indexOf("{{") >= 0) {
          //process {{}} express
          data = this.processText(data, model_data);
        } else if (c["type"] && c["type"] == "date") {
          // date type filter
          data = moment()
            .add(c["addDays"] || 0, "day")
            .format(c["format"] || "yyyy-MM-DDT00:00:00.000Z");
        } else if (c["type"] && c["getdata"] == "local") {
          data = sessionStorage.getItem(c.field);
        }
        // ? Value TYPE
        // "value": "props.optionsDataSource.collectionName",
        // "valuetype":"get"
        // ? Give Data Of ALL LOCAL STORAGE AND Session Storage
        if (c.valueType && c.valueType == "get") {
          // let compressData = _.cloneDeep(model_data)
          // const keys = Object.keys(sessionStorage);
          // // const sessionData:any = {};
          // keys.forEach(key => {
          //   compressData[key] = sessionStorage.getItem(key);
          // });
          // // console.log(sessionData);
          // const localkeys = Object.keys(sessionStorage);
          // // const localsessionData:any = {};
          // localkeys.forEach(key => {
          //   compressData[key] = sessionStorage.getItem(key);
          // });
          // // console.log(localsessionData);
          // // Object.assign(compressData,localsessionData)
          // data = _.get(compressData, c?.['paramsvalue']) || ''
          data = this.valueFinder(c, model_data, "paramsvalue");
        }

        conditions.push({
          parmasName: c["parmasName"],
          parmsDataType: c["parmsDataType"] || "string",
          paramsvalue: data,
        });
      });
    }
  }

  public filterQuery(config: any, model_data?: any) {
    // Return undefined immediately if config is falsy
    if (!config) return undefined;

    // Initialize the filters array to hold all filter objects
    const filters: any = [];

    // Check if config.filter is an array and iterate over it
    if (Array.isArray(config.filter)) {
      config.filter.forEach((indviFilter: any) => {
        const conditions: any = [];

        // Process each condition using makeFilterConditions
        this.makeFilterConditions(
          indviFilter["conditions"],
          conditions,
          model_data
        );

        // Only push to filters array if there are conditions
        if (conditions.length > 0) {
          filters.push({
            clause: indviFilter["clause"] || "AND", // Use "AND" as default clause if not specified
            conditions: conditions,
          });
        }
      });
    }

    // Return the assembled filters array
    return filters;
  }

  valueFinder(parameter: any, model_data: any, checkKey: any) {
    let compressData = _.cloneDeep(model_data);
    const keys = Object.keys(sessionStorage);
    // const sessionData:any = {};
    keys.forEach((key) => {
      compressData[key] = sessionStorage.getItem(key);
    });
    // console.log(sessionData);
    const localkeys = Object.keys(sessionStorage);
    // const localsessionData:any = {};
    localkeys.forEach((key) => {
      compressData[key] = sessionStorage.getItem(key);
    });
    // console.log(localsessionData);
    // Object.assign(compressData,localsessionData)
    return _.get(compressData, parameter?.[checkKey]) || "";
  }

  //save the data
  public post(collectionName: any, data: any) {
    return this.http.post(this.getWsBaseUrl() + `${collectionName}`, data);
  }

  //to list the datas from the parent table
  public getparentdata(data: any) {
    return this.http.get(this.getWsBaseUrl() + `${data}`);
  }
  //Image Upload
  public imageupload(folder: any, refId: any, data: any) {
    return this.http.post(
      this.getWsBaseUrl() + `file/${folder}/${refId}`,
      data
    );
  }

  public getparentdataById(path: any, id: any) {
    //  id = id.replace(/\//g,"%2F")
    return this.http.get(this.getWsBaseUrl() + path + "/" + id);
  }

  public download_excel(path: any, id: any) {
    return this.http.get(this.getWsBaseUrl() + `${path}` + `${id}`);
  }

  //Post the data
  public bulkpost(endPoint: string, data: any) {
    return this.http.post(this.getWsBaseUrl() + `${endPoint}`, data, {
      reportProgress: true,
      observe: "events",
    });
  }

  //#region   // ?Filter Biliding Help

  public getDataByPath(data: any, path: string) {
    if (!path) return data; // if path is undefined or empty return data
    if (path.startsWith("'")) return path.replace(/'/g, "");
    var paths = path.split(".");
    for (var p in paths) {
      if (!paths[p]) continue;
      data = data[paths[p]]; // new data is subdata of data
      if (!data) return data;
    }
    return data;
  }

  public processText(exp: any, data: any) {
    if (data !== null) {
      exp = exp.replace(
        /{{(\w+)}}/g, // this is the regex to replace %variable%
        (match: any, field: any) => {
          return this.getDataByPath(data, field) || "";
        }
      );
      return exp.trim();
    }
  }
  public getFilterQuery(config: any, model_data?: any) {
    if (!config) return undefined;
    var conditions: any = [];
    this.makeFilterConditions(config.defaultFilter, conditions, model_data);
    this.makeFilterConditions(config.fixedFilter, conditions, model_data);
    if (conditions.length > 0)
      return [
        {
          clause: config.filtercondition || "AND",
          conditions: conditions,
        },
      ];
    return undefined;
  }

  makeFilterConditions(
    filterConditions: any,
    conditions: any,
    model_data?: any
  ) {
    if (filterConditions && filterConditions.length) {
      filterConditions.forEach((c: any) => {
        var data = c["value"];
        //check whether any {{}} expression is there or not?
        if (typeof data == "string" && data.indexOf("{{") >= 0) {
          //process {{}} express
          data = this.processText(data, model_data);
        } else if (c["type"] && c["type"] == "date") {
          // date type filter
          // data = moment().add(c['addDays'] || 0, 'day').format(c['format'] || 'yyyy-MM-DDT00:00:00.000Z')
        } else if (c["type"] && c["getdata"] == "local") {
          data = sessionStorage.getItem(c.field);
          // date type filter
          // data = moment().add(c['addDays'] || 0, 'day').format(c['format'] || 'yyyy-MM-DDT00:00:00.000Z')
        } else if (c["type"] && c["getdata"] == "current_date") {
          // data=sessionStorage.getItem(c.field)
          // date type filter
          const momentObject = moment(new Date());
          const adjustedMoment = momentObject.add(5.5, "hours");
          const adjustedISOString = adjustedMoment.toISOString();

          // "2023-11-28T15:14:56.390Z"
          // 2023-11-28T15:17:00+05:30
          data = adjustedISOString;
        }
        conditions.push({
          column: c["column"],
          operator: c["operator"],
          type: c["type"] || "string",
          value: data,
        });
      });
    }
  }

  buildOptions(res: any, to: any) {
    var data: any[] = res.data ? res.data : res;
    if (to.labelPropTemplate) {
      data.map((e: any) => {
        e[to.labelProp] = this.processText(to.labelPropTemplate, e);
      });
    }
    data = _.sortBy(data, to.labelProp);
    if (to.optionsDataSource.firstOption) {
      data.unshift(to.optionsDataSource.firstOption);
    }
    to.options = data;
  }

  async makeFiltersConditions(Input_object: any): Promise<any> {
    return await new Promise((resolve, reject) => {
      let vals: any = {
        start: Input_object.start,
        end: Input_object.end,
        filter: [],
        sort: Input_object.sort,
      };

      let overallfilter: any[] = [];

      if (!_.isEmpty(Input_object.filter)) {
        let filter: any = Input_object.filter;

        for (let column in filter) {
          let data: any = filter[column];
          let filtervaluse: any = {
            clause: "",
            conditions: [],
          };
          filtervaluse.clause = data.operator || "AND";
          let dataconditions: any[] = [];

          if (
            data.conditions &&
            Array.isArray(data.conditions) &&
            data.conditions.length > 0
          ) {
            data.conditions.forEach((xyz: any) => {
              let operator: any = xyz.type.toUpperCase();
              let flag: boolean = false;

              if (xyz.type == "inRange") {
                flag = true;
              }

              if (xyz.filterType == "string") {
                if (!_.isEmpty(data.value)) {
                  if (xyz.values[0][2] == true) {
                    console.log("if");

                    column = xyz.values[0][1];
                    xyz.filter = xyz.values.map((vals: any) => {
                      return vals[0];
                    });
                  }
                } else {
                  xyz.filter = xyz?.values;
                }
              }
              if (xyz.filterType == "set") {
                xyz.filterType = "string";
                xyz.type = "IN";
                if (!_.isEmpty(data.value)) {
                  if (xyz?.values[0][2] == true) {
                    console.log("if");

                    column = xyz?.values[0][1];
                    xyz.filter = xyz.values.map((vals: any) => {
                      return vals[0];
                    });
                  }
                } else {
                  console.log("else");

                  xyz.filter = xyz?.values;
                }
              }
              console.log(xyz);

              if (xyz.filterType == "date") {
                console.log(xyz);
                if (flag) {
                  dataconditions.push({
                    column: column,
                    operator: operator,
                    type: xyz.dateFrom,
                    value: [
                      moment(xyz.dateFrom).format("yyyy-MM-DDT00:00:00.000Z"),
                      moment(xyz.dateTo).format("yyyy-MM-DDT00:00:00.000Z"),
                    ],
                  });
                } else {
                  dataconditions.push({
                    column: column,
                    operator: operator,
                    type: xyz.filterType,
                    value: moment(xyz.dateFrom).format(
                      "yyyy-MM-DDT00:00:00.000Z"
                    ),
                  });
                }
              } else {
                if (xyz.filterType == "string") {
                  if (!_.isEmpty(data.value)) {
                    if (xyz?.values[0][2] == true) {
                      console.log("if");

                      column = xyz?.values[0][1];
                      xyz.filter = xyz.values.map((vals: any) => {
                        return vals[0];
                      });
                    }
                  } else {
                    console.log("else");

                    xyz.filter = xyz?.values;
                  }
                }
                if (flag) {
                  dataconditions.push({
                    column: column,
                    operator: operator,
                    type: xyz.filterType,
                    value: [xyz.filter, xyz.filterTo],
                  });
                } else {
                  dataconditions.push({
                    column: column,
                    operator: operator,
                    type: xyz.filterType,
                    value: xyz.filter,
                  });
                }
              }
            });
          } else {
            if (data.filterType == "set") {
              data.filterType = "string";
              data.type = "IN";
              if (!_.isEmpty(data.value)) {
                if (data?.values[0][2] == true) {
                  column = data.values[0][1];
                  data.filter = data?.values.map((vals: any) => {
                    console.log(vals);
                    return vals[0];
                  });
                }
              } else {
                data.filter = data.values;
              }
              console.log(data);
            }

            let operator: any = data.type.toUpperCase();
            let flag: boolean = false;

            if (data.type == "inRange") {
              flag = true;
            }
            if (data.filterType == "string") {
              if (!_.isEmpty(data.value)) {
                if (data.values[0][2] == true) {
                  console.log("if");

                  column = data.values[0][1];
                  data.filter = data.values.map((vals: any) => {
                    return vals[0];
                  });
                }
              }
            }
            if (data.filterType == "date") {
              console.log(data);
              if (flag) {
                dataconditions.push({
                  column: column,
                  operator: operator,
                  type: data.filterType,

                  value: [
                    moment(data.dateFrom).format("yyyy-MM-DDT00:00:00.000Z"),
                    moment(data.dateTo).format("yyyy-MM-DDT00:00:00.000Z"),
                  ],
                });
              } else {
                dataconditions.push({
                  column: column,
                  operator: operator,
                  type: data.filterType,
                  value: moment(data.dateFrom).format(
                    "yyyy-MM-DDT00:00:00.000Z"
                  ),
                });
              }
            } else {
              if (flag) {
                dataconditions.push({
                  column: column,
                  operator: operator,
                  type: data.filterType,
                  value: [data.filter, data.filterTo],
                });
              } else {
                dataconditions.push({
                  column: column,
                  operator: operator,
                  type: data.filterType,
                  value: data.filter,
                });
              }
            }
          }

          filtervaluse.conditions = dataconditions;
          overallfilter.push(filtervaluse);
        }
        vals.filter = overallfilter;
        console.log(overallfilter);
      }
      resolve(vals);
    });
  }
  //#endregion
}
