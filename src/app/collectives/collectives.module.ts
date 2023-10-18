import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule,ReactiveFormsModule } from '@angular/forms';
import { CollectiveListComponent } from './views/collective-list/collective-list.component';
import { CollectiveEditComponent } from './views/collective-edit/collective-edit.component';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { DynamicDialogModule } from "primeng/dynamicdialog";
import { ConfirmDialogModule } from "primeng/confirmdialog";
import { ListboxModule } from 'primeng/listbox';
import { TableModule } from "primeng/table";
import { ToastModule } from "primeng/toast";
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from "primeng/tooltip";
import { InputTextModule } from "primeng/inputtext";
import { PaginatorModule } from "primeng/paginator";
import { TabViewModule } from 'primeng/tabview';
import { InputSwitchModule } from 'primeng/inputswitch';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { CheckboxModule } from 'primeng/checkbox';
import { CalendarModule } from 'primeng/calendar';
import { MultiSelectModule } from 'primeng/multiselect';

import { routes } from './collectives.routes';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [
    CollectiveListComponent,
    CollectiveEditComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    AutoCompleteModule,
    ListboxModule,
    TableModule,
    ToastModule,
    DynamicDialogModule,
    ButtonModule,
    TooltipModule,
    ConfirmDialogModule,
    PaginatorModule,
    InputTextModule,
    TooltipModule,
    ToastModule,
    TabViewModule,
    InputSwitchModule,
    ScrollPanelModule,
    CheckboxModule,
    CalendarModule,
    MultiSelectModule
  ]
})
export class CollectivesModule { }
