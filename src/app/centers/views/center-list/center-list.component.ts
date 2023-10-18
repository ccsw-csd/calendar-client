import { Component, OnInit, ViewChild, ViewChildren, QueryList } from '@angular/core';
import { Table } from 'primeng/table';
import { ConfirmationService } from 'primeng/api';
import { SnackbarService } from 'src/app/core/services/snackbar.service';
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Dropdown } from 'primeng/dropdown';

import { CenterService } from 'src/app/centers/services/center.service';
import { Center } from '../../models/Center';
import { CenterEditComponent } from 'src/app/centers/views/center-edit/center-edit.component';
import { ColumnConfigComponent } from 'src/app/core/views/column-config/column-config.component';

@Component({
  selector: 'app-center-list',
  templateUrl: './center-list.component.html',
  styleUrls: ['./center-list.component.scss'],
  providers: [DialogService, DynamicDialogRef, DynamicDialogConfig,ConfirmationService]
})
export class CenterListComponent implements OnInit {
  @ViewChild(Table) table: Table;
  @ViewChildren('filterDropdown') filterDropdowns!: QueryList<Dropdown>;

  isSynchronized: Boolean = false;
  columnNames: any[];
  selectedColumnNames : any[];
  changeCols : boolean = false;
  centers: Center[] = [];
  filteredCenters: Center[] = [];
  tableWidth: string;
  defaultFilters: any = {};


  constructor(
    private centerService: CenterService,
    private dialogService: DialogService,
    private confirmationService: ConfirmationService,
    private snackbarService: SnackbarService,
  ) {}

  ngOnInit(): void {
    this.resizeTable();
    this.getAllCenters();

    this.columnNames = [
      { header: 'Nombre', composeField: 'name', field: 'name', filterType: 'input' },
    ];
    this.selectedColumnNames = this.loadSelected();

  }

  onColReorder(event): void {
    this.saveSelected(this.selectedColumnNames);
  }

  loadSelected(): any[] {
    let selectedColumnNames: any = localStorage.getItem('centerListColumns');
    if (selectedColumnNames == null) return this.columnNames;

    selectedColumnNames = JSON.parse(selectedColumnNames);

    let columns : any[] = [];
    selectedColumnNames.forEach(item => {
      let filterColumn = this.columnNames.filter(column => column.header == item);
      columns = columns.concat(filterColumn);
    });

    return columns;
  }

  saveSelected(selectedColumnNames: any[]) {    
    localStorage.setItem('centerListColumns', JSON.stringify(selectedColumnNames.map(e => e.header)));
  }

  isColumnVisible(field: string): boolean {
    return this.selectedColumnNames.some(column => column.field === field);
  }

  showConfig(){
    const ref = this.dialogService.open(ColumnConfigComponent, {
      width: '75vh',
      data: {
        columns: this.columnNames,
        selected: this.selectedColumnNames
      },
      closable: true,
      showHeader: true,
      autoZIndex: true,
      header: "Configuracion de la tabla"
    });

    ref.onClose.subscribe((result: any) => {
      if(result) {
        this.selectedColumnNames = result;
        this.saveSelected(result);
      }
    });
  }

  resizeTable() {
    if (document.getElementById('p-slideMenu')) {
      this.tableWidth = 'calc(100vw - 255px)';
    } else {
      this.tableWidth = 'calc(100vw - 55px)';
    }
  }

  getAllCenters() {
    this.centerService.getAllCenters().subscribe({
      next: (res: Center[]) => {
        this.centers = res;
        this.setFilters();
      }
    });
  }

  onFilter(event) {
    
  }

  setFilters(): void {
    this.defaultFilters.department.value='CCSw'
    this.defaultFilters.active.value=['1'];
  }

  cleanFilters(): void {
    this.filterDropdowns.forEach((dropdown) => dropdown.clear(null));
    this.table.reset();
    this.setFilters();
    this.table.sortOrder = 1;
    this.table.sort({ field: 'lastname', order: this.table.sortOrder });
  }

  editCenter(center?: Center) {
    let header = center ? 'Modificar Centro' : 'Nuevo Centro';
    const ref = this.dialogService.open(CenterEditComponent, {
      width: '50vw',
      data: {
        center: center
      },
      closable: false,
      showHeader: true,
      header: header,
    });

    ref.onClose.subscribe((result: boolean) => {
      if (result) this.getAllCenters();
    });
  }

  deleteCenter(id: number) {
    this.confirmationService.confirm({
      message: '¿Seguro/a que quieres borrar el centro?',
      rejectButtonStyleClass: 'p-button p-button-secondary p-button-outlined',
      accept: () => {
        this.confirmationService.close();
        this.centerService.delete(id).subscribe({
          next: () => {
            this.centerService.getAllCenters().subscribe((result: any) => {
              this.centers = result;
              this.snackbarService.showMessage(
                'El registro se ha borrado con éxito'
              );
            });
          },
          error: (errorResponse) => {
            this.snackbarService.error(errorResponse['message']);
          }
        });
      },
      reject: () => {
        this.confirmationService.close();
      }
    });
  }
}
