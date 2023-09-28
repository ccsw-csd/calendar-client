import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EditCalendarComponent } from './edit-calendar/edit-calendar.component';
import { CalendarModule } from 'primeng/calendar';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { ComponentCalendarComponent } from './edit-calendar/component-calendar/component-calendar.component';

@NgModule({
  declarations: [
    EditCalendarComponent,
    ComponentCalendarComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ProgressSpinnerModule,
    ButtonModule,
    DropdownModule,
    CalendarModule,
  ]
})
export class WorkCalendarModule { }
