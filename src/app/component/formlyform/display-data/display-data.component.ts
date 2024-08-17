 import { CdkDrag, CdkDragDrop } from '@angular/cdk/drag-drop';
import { OverlayRef, Overlay } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { Component, EventEmitter, Input, Output, TemplateRef, ViewChild, ViewContainerRef } from '@angular/core';
import { isArray } from 'lodash';
import { Subscription, fromEvent, filter, take, Subject } from 'rxjs';

@Component({
  selector: 'app-display-data',
  templateUrl: './display-data.component.html',
  styleUrls: ['./display-data.component.css']
})
export class DisplayDataComponent {
  @Input('onDragDrop') public onDragDrop$!: Subject<CdkDragDrop<Array<any>>>;  
  @Output ('action') action  = new EventEmitter<any>();
  @Input('data') data:any=[]
 @Input('showDelete') showDelete: boolean = true;
 @Input('parentclass') parentclass:any
 @Input('parentGroup') parentGroup:any
 @ViewChild('contextMenupop') contextMenu!: TemplateRef<any>;
sub!: Subscription;

 overlayRef!: OverlayRef | null

 constructor(public overlay: Overlay,public viewContainerRef: ViewContainerRef) {  }

 toggleButtonVisibility(value:any,id:any,type:any):void {
  if(value) {
  (document.getElementById(id+type) as HTMLSpanElement ).style.visibility='visible' ;
  }else{
    (document.getElementById(id+type) as HTMLSpanElement ).style.visibility='hidden' ;
  }
}
 
isallowedtoEnter = (drag: any, drop: any) => {
  console.log(drag,drop);
  return isArray(drop?.data)
};
  chcekArray(data:any){
    return Array.isArray(data)
  }

  handleAction(data:any,type:any) {
    data['action']=type;
    this.action.emit(data)
    this.close()
  } 
  onDragOver(event: any) {
    event?.toElement.classList.add("cdk-drop-list-dragging")
    event.preventDefault();      
    
  }
  ondragEnter(event: any,falg?:any){
      event?.toElement.classList.add("cdk-drop-list-dragging")
      event.preventDefault();      
  }
  onDragleave(event: any) {
    event?.toElement.classList.remove("cdk-drop-list-dragging")
    event.preventDefault();      
  }

  onDragStart(event: DragEvent, draggedObject: any) {
    event?.dataTransfer?.setData("dragdata", JSON.stringify(draggedObject));
  }

  open({ x, y }: MouseEvent, data:any) {
    this.close();
    const positionStrategy = this.overlay.position()
      .flexibleConnectedTo({ x, y })
      .withPositions([
        {
          originX: 'end',
          originY: 'bottom',
          overlayX: 'end',
          overlayY: 'top',
        }
      ]);

    this.overlayRef = this.overlay.create({
      positionStrategy,
      scrollStrategy: this.overlay.scrollStrategies.close()
    });

    this.overlayRef.attach(new TemplatePortal(this.contextMenu, this.viewContainerRef, {
      // ? PAth to menu to ngtemplate
      $implicit: data
    }));
    this.sub = fromEvent<MouseEvent>(document, 'click')
      .pipe(
        filter(event => {
          const clickTarget = event.target as HTMLElement;
          return !!this.overlayRef && !this.overlayRef.overlayElement.contains(clickTarget);
        }),
        take(1)
      ).subscribe(() => this.close())

  } 

  close() {
    this.sub && this.sub.unsubscribe();
    if (this.overlayRef) {
      this.overlayRef.dispose();
      this.overlayRef = null;
    }
  }
}
