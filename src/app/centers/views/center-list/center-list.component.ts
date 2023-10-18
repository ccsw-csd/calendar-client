import {
  Component,
  OnInit,
  ViewChild
} from '@angular/core';
import { Table } from 'primeng/table';
import { ConfirmationService } from 'primeng/api';
import {
  DialogService,
  DynamicDialogConfig,
  DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { SnackbarService } from 'src/app/core/services/snackbar.service';
import { CenterService } from 'src/app/centers/services/center.service';
import { CenterEditComponent } from 'src/app/centers/views/center-edit/center-edit.component';
import { Center } from '../../models/Center';

@Component({
  selector: 'app-center-list',
  templateUrl: './center-list.component.html',
  styleUrls: ['./center-list.component.scss'],
  providers: [
    DialogService,
    DynamicDialogRef,
    DynamicDialogConfig,
    ConfirmationService,
  ],
})
export class CenterListComponent implements OnInit {
  @ViewChild(Table) table: Table;

  columnNames: any[];
  selectedColumnNames: any[];
  centers: Center[] = [];
  tableWidth: string;
  defaultFilters: any = {};
  loading = false;

  constructor(
    private centerService: CenterService,
    private dialogService: DialogService,
    private confirmationService: ConfirmationService,
    private snackbarService: SnackbarService
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.resizeTable();
    this.getAllCenters();

    this.columnNames = [
      {
        header: 'Nombre',
        composeField: 'name',
        field: 'name',
        filterType: 'input',
      },
    ];
    this.selectedColumnNames = this.loadSelected();
  }

  onColReorder(): void {
    this.saveSelected(this.selectedColumnNames);
  }

  cleanFilters(): void {
    this.table.reset();
    this.setFilters();
    this.table.sortOrder = 1;
    this.table.sort({ field: 'lastname', order: this.table.sortOrder });
  }

  editCenter(center?: Center) {
    const header = center ? 'Modificar Centro' : 'Nuevo Centro';
    const ref = this.dialogService.open(CenterEditComponent, {
      width: '50vw',
      data: {
        center: center,
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
                'El centro se ha borrado con éxito'
              );
            });
          },
          error: (errorResponse) => {
            this.snackbarService.error(errorResponse['message']);
          },
        });
      },
      reject: () => {
        this.confirmationService.close();
      },
    });
  }

  private saveSelected(selectedColumnNames: any[]) {
    localStorage.setItem(
      'centerListColumns',
      JSON.stringify(selectedColumnNames.map((e) => e.header))
    );
  }

  private resizeTable() {
    if (document.getElementById('p-slideMenu')) {
      this.tableWidth = 'calc(100vw - 255px)';
    } else {
      this.tableWidth = 'calc(100vw - 55px)';
    }
  }

  private getAllCenters() {
    this.centerService.getAllCenters().subscribe({
      next: (res: Center[]) => {
        this.centers = res;
        this.loading = false;
        this.setFilters();
      },
    });
  }

  private setFilters(): void {
    this.defaultFilters.department.value = 'CCSw';
    this.defaultFilters.active.value = ['1'];
  }

  private loadSelected(): any[] {
    let selectedColumnNames: any = localStorage.getItem('centerListColumns');
    if (selectedColumnNames == null) return this.columnNames;

    selectedColumnNames = JSON.parse(selectedColumnNames);

    let columns: any[] = [];
    selectedColumnNames.forEach((item) => {
      let filterColumn = this.columnNames.filter(
        (column) => column.header == item
      );
      columns = columns.concat(filterColumn);
    });

    return columns;
  }
}
