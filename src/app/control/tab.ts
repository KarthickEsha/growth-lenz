// import { Component, OnInit } from '@angular/core';
// import { FieldType, FormlyFieldConfig } from '@ngx-formly/core';

// @Component({
//   selector: 'tab',
//   template: `
//     <mat-tab-group >
//       <div *ngFor="let tab of field.fieldGroup; let i = index; let last = last" style="background-color:blue">
//       <mat-tab [label]="tab.props!.label || 'Tab'" *ngIf="!tab.hide"   [disabled]="i !== 0 ">
//         <formly-field [field]="tab"></formly-field>
//       </mat-tab>
//       </div>
//     </mat-tab-group>
//   `,
// })
// export class Tab extends FieldType implements OnInit{
//   ngOnInit(): void {
//     debugger
//   this.field.props || {};  
//   }
//   isValid(field: FormlyFieldConfig): any {
//     if (field.key) {
//       return field.formControl?.valid;
//     }
//     return field.fieldGroup ? field.fieldGroup.every((f) => this.isValid(f)) : true;
//   }
// }




import { Component, OnInit } from '@angular/core';
import { MatTabChangeEvent, MatTabGroup } from '@angular/material/tabs';
import { Router } from '@angular/router';
import { FieldType, FormlyFieldConfig } from '@ngx-formly/core';

@Component({
  selector: 'tab',
  template: `
    <mat-tab-group [selectedIndex]="getSelectedIndex()" (selectedTabChange)="onTabChange($event)">
      <div *ngFor="let tab of field.fieldGroup; let i = index; let last = last" style="background-color:blue">
      <mat-tab [label]="tab.props!.label || 'Tab'" *ngIf="!tab.hide" >

          <formly-field [field]="tab"></formly-field>
          <button mat-raised-button style="width:150px;float:right" class="cancelbtn" *ngIf="!last && this.field.show_button" (click)="onSaveAndContinue()" >SAVE & CONTINUE</button>

        </mat-tab>
      </div>
    </mat-tab-group>
  `,
})

// <mat-tab-group [selectedIndex]="getSelectedIndex()" (selectedTabChange)="onTabChange($event)">
// <div *ngFor="let tab of field.fieldGroup; let i = index; let last = last" style="background-color:blue">
// <mat-tab [label]="tab.props!.label || 'Tab'" *ngIf="!tab.hide" [disabled]="!field.fieldGroup || !isValid(field.fieldGroup[i - 1])">

//     <formly-field [field]="tab"></formly-field>
//     <button (click)="onSaveAndContinue()" >save & continue</button>

//   </mat-tab>
// </div>
// </mat-tab-group>     

export class Tab extends FieldType<any> implements OnInit {
  public currentTabIndex = 0
  last = false;

  constructor(private router: Router,
    private tabGroup: MatTabGroup
  ) { super() }

  ngOnInit(): void {
    this.field.props || {};
  }

  isValid(field: FormlyFieldConfig): any {
    if (!field) {
      return true;
    }

    if (field.key) {
      return field.formControl?.valid;
    }

    return field.fieldGroup ? field.fieldGroup.every((f) => this.isValid(f)) : true;
  }


  getSelectedIndex(): number {
    return this.currentTabIndex
  }

  onTabChange(event: MatTabChangeEvent) {
    this.currentTabIndex = event.index
    if (this.field && this.field.fieldGroup) {
      this.last = this.currentTabIndex === this.field.fieldGroup.length - 1;

      // Store the 'last' variable in sessionStorage
      sessionStorage.setItem('isLastTab', this.last.toString());
    } 
  }

  onSaveAndContinue() {
    const currentIndex = this.currentTabIndex;

    if (currentIndex !== null && currentIndex !== undefined) {
      const nextIndex = currentIndex + 1;
      this.currentTabIndex = nextIndex;
    }
  }

}
