import { Component, OnInit } from '@angular/core';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
@Component({
  selector: 'app-personal-config',
  templateUrl: './column-config.component.html',
  styleUrls: ['./column-config.component.scss']
})
export class ColumnConfigComponent implements OnInit {

  constructor(
    private ref: DynamicDialogRef,
    private config: DynamicDialogConfig
  ) { }

  columns: any[] = [];
  selectedColumns: any[];

  ngOnInit(): void {
    this.columns = this.getAviables(this.config.data.columns.slice(), this.config.data.selected.slice());
    this.selectedColumns = this.config.data.selected.slice();
  }

  closeWindow() {
    this.ref.close();
  }

  save() {
    this.ref.close(this.getSelected(this.config.data.columns.slice(), this.selectedColumns));
  }

  getAviables(cols, sel) {
    return cols.filter(e => sel.indexOf(e) == -1);
  }

  getSelected(cols, sel) {
    return cols.filter(e => sel.indexOf(e) != -1);
  }

}
