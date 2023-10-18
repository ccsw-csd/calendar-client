import { Component, OnInit, ViewChild, ViewChildren, QueryList } from '@angular/core';
import { Table } from 'primeng/table';
import { ConfirmationService } from 'primeng/api';
import { SnackbarService } from 'src/app/core/services/snackbar.service';
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Collective } from '../../models/Collective';
import { CollectiveService } from '../../services/collective.service';
import { Dropdown } from 'primeng/dropdown';
import { NavigatorService } from 'src/app/core/services/navigator.service';
import { ColumnConfigComponent } from 'src/app/core/views/column-config/column-config.component';
import { CollectiveEditComponent } from '../collective-edit/collective-edit.component';

@Component({
  selector: 'app-collective-list',
  templateUrl: './collective-list.component.html',
  styleUrls: ['./collective-list.component.scss'],
  providers: [DialogService, DynamicDialogRef, DynamicDialogConfig,ConfirmationService]
})
export class CollectiveListComponent implements OnInit {

  @ViewChild(Table) table: Table;
  @ViewChildren('filterDropdown') filterDropdowns!: QueryList<Dropdown>;

  columnNames: any[];
  selectedColumnNames : any[];
  changeCols : boolean = false;
  collectives: Collective[] = [
    {id: 1, name:'General', maxHourYear: 1784, hoursWeek: 8.25 , hoursF: 7, freeDays: 2, personalDays: 2 , holidays: 24, additionalDays: 2}
  ];

  tableWidth: string;
  defaultFilters: any = {};

  constructor(
    private collectiveService: CollectiveService,
    private dialogService: DialogService,
    private navigatorService: NavigatorService,
    private confirmationService: ConfirmationService,
    private snackbarService: SnackbarService,
  ) {}

  ngOnInit(): void {
    this.resizeTable();
    this.navigatorService.getNavivagorChangeEmitter().subscribe((menuVisible) => {
      if (menuVisible) this.tableWidth = 'calc(100vw - 255px)';
      else this.tableWidth = 'calc(100vw - 55px)';
    });
    this.getAllCollectives();

    this.columnNames = [
      { header: 'Nombre', composeField: 'name', field: 'name', filterType: 'input' },
      { header: 'Jornada Maxima Anual', composeField: 'maxHourYear', field: 'maxHourYear' },
      { header: 'Horas L-J', composeField: 'hoursWeek', field: 'hoursWeek'},
      { header: 'Horas V', composeField: 'hoursF', field: 'hoursF' },
      { header: 'Dias asuntos propios', composeField: 'personalDays', field: 'personalDays' },
      { header: 'Dias adicionales', composeField: 'additionalDays', field: 'additionalDays' },
      { header: 'Dias libre disposición', composeField: 'freeDays', field: 'freeDays' },
      { header: 'Dias vacaciones', composeField: 'holidays', field: 'holidays' },
      ];
    this.selectedColumnNames = this.loadSelected();

  }

  onColReorder(event): void {
    this.saveSelected(this.selectedColumnNames);
  }

  loadSelected(): any[] {
    let selectedColumnNames: any = localStorage.getItem('personListColumns');
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
    localStorage.setItem('personListColumns', JSON.stringify(selectedColumnNames.map(e => e.header)));
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

  getAllCollectives() {
    this.collectiveService.getAllCollectives().subscribe({
      next: (res: Collective[]) => {
        this.collectives = res;
        this.setFilters();
      }
    });
  }

  onFilter(event) {
    /*this.personsToExport = event.filteredValue;
    setTimeout(() => {
      this.totalPersons = event.filteredValue.length;
    }, 0);*/
  }

  setFilters(): void {
  }

  cleanFilters(): void {
    this.filterDropdowns.forEach((dropdown) => dropdown.clear(null));
    this.table.reset();
    this.setFilters();
    this.table.sortOrder = 1;
    this.table.sort({ field: 'lastname', order: this.table.sortOrder });
  }

  editCollective(collective?: Collective) {
    let header = collective ? 'Modificar Colectivo' : 'Nuevo Colectivo';
    const ref = this.dialogService.open(CollectiveEditComponent, {
      width: '50vw',
       data: {
        collective: collective,
      },
      closable: false,
      showHeader: true,
      header: header,
    });

    ref.onClose.subscribe((result: boolean) => {
      if (result) this.getAllCollectives();
    });
  }

  deleteCollective(id: number) {
    this.confirmationService.confirm({
      message: '¿Seguro/a que quieres borrar el colectivo?',
      rejectButtonStyleClass: 'p-button p-button-secondary p-button-outlined',
      accept: () => {
        this.confirmationService.close();
        this.collectiveService.delete(id).subscribe({
          next: () => {
            this.collectiveService.getAllCollectives().subscribe((result: any) => {
              this.collectives = result;
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