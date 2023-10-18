import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule,ReactiveFormsModule } from '@angular/forms';
import { CenterListComponent } from './views/center-list/center-list.component';
import { CenterEditComponent } from './views/center-edit/center-edit.component';

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

import { routes } from './centers.routes';
import { RouterModule } from '@angular/router';


@NgModule({
  declarations: [
    CenterListComponent,
    CenterEditComponent
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
  ]
})
export class CentersModule { }
