import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { environment } from 'src/environments/environment';


@Injectable({
  providedIn: 'root'
})
export class VideoService {

  constructor(private http: HttpClient) { }
  private micControl = new Subject<boolean>();
  micControlObservable = this.micControl.asObservable();
  private videoControl = new Subject<boolean>();
  videoControlObservable = this.videoControl.asObservable();
  private roomControl = new Subject<void>();
  private gridControl = new Subject<void>();
  private chatControl = new Subject<void>();
  private screenControl= new Subject<boolean>();
  

  controlMic(value: boolean) {
    this.micControl.next(value);
  }
  controlVideo(value: boolean) {
    this.videoControl.next(value);
  }
  
  setcontrolRoom() {
    this.roomControl.next();
  }
  setgridView (){
    this.gridControl.next();
  }
  getgridView(){
   return this.gridControl.asObservable();
  }
  setOpenchat(){
   this.chatControl.next();
  }
  getOpenchat(){
    return this.chatControl.asObservable();
  }
  getcontrolRoomEvent(){
    return this.roomControl.asObservable();
  }
  setshareScreen(value:boolean){
    this.screenControl.next(value);
  }
  getshareScreenEvent(){
    return this.screenControl.asObservable();    
  }


}
