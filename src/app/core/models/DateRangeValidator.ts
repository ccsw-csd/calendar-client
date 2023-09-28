import { AbstractControl } from '@angular/forms';

export class DateRangeValidator {

  static dateRange(control: AbstractControl) {

    const startDate = control.get('startDate').value;
    const endDate = control.get('endDate').value;

    if(startDate === null || endDate === null) {
      return null;
    }
    const start = new Date(startDate);
    const end = new Date(endDate);
    if(end < start) {
      return { dateRange: true };
    }
    return null; 
  }
}
