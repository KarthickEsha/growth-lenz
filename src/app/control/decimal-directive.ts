import {
  Directive,
  ElementRef,
  forwardRef,
  HostListener,
  Renderer2,
} from '@angular/core';
import { CustomDecimalInputType } from './custom-decimal-input';

@Directive({
  selector: '[onlyDecimal]',
})
export class OnlyDecimalDirective {

  // Allow decimal numbers and negative values
  // private regex: RegExp = new RegExp('^\\d{0,7}\\.?\\d{0,2}$');
  // Allow key codes for special events. Reflect :
  // Backspace, tab, end, home
  private specialKeys: Array<string> = ['Backspace', 'Tab', 'End', 'Home', '-', "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Delete"];

  constructor(private el: ElementRef, private decimalInput: CustomDecimalInputType) { }

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    debugger
    // if (this.specialKeys.indexOf(event.key) !== -1) {
    //     return;
    // }
    // let current: string = this.el.nativeElement.value;
    // let next: string = current.concat(event.key);
    // if (next && !String(next).match(this.regex)) {
    //     event.preventDefault();
    // }
    // Check conditin based on level

   
   

    if (this.decimalInput.field.parentKey && this.el.nativeElement.value != undefined && this.decimalInput.field.check_year) {
      let value = parseInt(this.el.nativeElement.value)
      let year: any = new Date(this.decimalInput.model[this.decimalInput.field.parentKey])
      year = year.getFullYear();
      let currentYear: any = new Date().getFullYear()
      if (!((year <= value) && (currentYear >= value))) {
        // this.decimalInput.validationError=this.decimalInput.field.validation.messages.pattern
        this.decimalInput.formControl.setErrors(this.decimalInput.field.validation.messages.pattern);
      }
    }
    let patternFromJson = this.decimalInput.pattern
    const regex = new RegExp(patternFromJson)

    if (this.specialKeys.indexOf(event.key) !== -1) {
      return;
    }

    let current: string = this.el.nativeElement.value;
    let next: string = current.concat(event.key);

    if (next && !String(next).match(regex)) {
      event.preventDefault();

      // Assign a numeric value to a separate variable if needed
      const numericValue = parseFloat(event.key);
      console.log(numericValue);

      // Now you can return the numericValue or perform any other logic with it
      return numericValue;
    }

    // if (this.decimalInput.field.numberValidate == true) {
    //   if (this.decimalInput.field.greaterthan) {
    //     if (this.decimalInput.field.greaterthan > event.key) {
    //       return event
    //       this.decimalInput.formControl.setErrors({ lessthan : true });
     
    //     }
    //   }
    // }

    // If no conditions are met, you can return the original event
    return event;
  }
}