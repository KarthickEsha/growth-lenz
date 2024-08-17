import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SharedService {
  private storedRowData: any[] = [];
  private _isConnected = new BehaviorSubject<boolean>(false);
  isConnected$ = this._isConnected.asObservable();
  private ticketData =new BehaviorSubject<any>(null)
  ticketData$ = this.ticketData.asObservable();



  setRowData(rowData: any[]) {
    this.storedRowData = rowData;
  }

  percent_discountData:any[]=[]
  setDiscount(data:any){
this.percent_discountData=data
  }

  getDiscount(){
    return this.percent_discountData
      }

  getRowData(): any[] {
    return this.storedRowData;
  }

  setConnectedStatus(status: boolean) {
    this._isConnected.next(status);
  }

  getTicketMessage(data:any){
    this.ticketData.next(data)
  }

  
  // Get Row Data from 
  engineer_level_data:any[]=[]
  SetEngineerlevelData(data:any){
  this.engineer_level_data=data
  }

  GetEngineerlevelData(){
  return  this.engineer_level_data
    }


    dedicated_data:any[]=[]
    SetDedicatedData(data:any){
    this.dedicated_data=data
    }

    GetDedicateddata(){
      return this.dedicated_data
    }
    dispatchData:any[]=[]
    setDispatchData(data:any){
      this.dispatchData =data
    }

    getDispatchData(){
      return this.dispatchData
    }

    // Remote Service Country data send to Currency code in (Project)
    private dataList = new BehaviorSubject<string[]>([]);
    currentDataList = this.dataList.asObservable();
    updateDataList(newDataList: string[]) {
      this.dataList.next(newDataList);
    }
}