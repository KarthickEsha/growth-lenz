import { Component, OnInit } from '@angular/core';
import { FieldType } from '@ngx-formly/core';
import { FormControl } from '@angular/forms';
@Component({
    selector: 'chips-input',
    template: `
  <mat-chip-listbox aria-label="Fish selection" multiple>
  <mat-chip-option  [style.background-color]="item.value ? '#978d8d' : '#f1efef'" [formControl]="FormControl" [selected]="item.value" (click)="toggleSelection(item)"  *ngFor="let item of list" >{{item.name}}</mat-chip-option>
</mat-chip-listbox>
   `
})



export class ChipTypeComponent extends  FieldType<any> implements OnInit {

    opt: any;
    list: any
    parentKey:any

    public get FormControl() {
        return this.formControl as FormControl;
        
      }
    

    constructor(
    ) {
        super();
    }
    ngOnInit(): void {
        debugger
        this.opt = this.field.props || {};
        this.list = this.field?.props?.options
        this.parentKey = this.field.parentKey
   

        const apiChips = this.model.chips;

        // Set the initial value of the form control to the array of chips
        this.formControl.setValue(apiChips);
    
        // Optional: You can update the 'value' property of each chip in the 'list' based on the API data
        // This is helpful if the structure of 'list' needs to be aligned with the API data
        this.list.forEach((chip: any) => {
            const matchingApiChip = apiChips.find((apiChip: any) => apiChip.name === chip.name);
            if (matchingApiChip) {
                chip.value = matchingApiChip.value;
            }
        });
    }

    toggleSelection(item: any): void {
    
        const index = this.list.findIndex((i:any) => i === item);
        if (index !== -1) {
            // Toggle the 'value' property of the selected item
            this.list[index].value = !this.list[index].value;
            // Update the form control value
            this.formControl.setValue([...this.list]);
        }
    }
}



