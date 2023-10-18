import { Component, OnInit } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Center } from 'src/app/centers/models/Center';
import { CenterService } from 'src/app/centers/services/center.service';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { SnackbarService } from 'src/app/core/services/snackbar.service';

@Component({
  selector: 'app-center-edit',
  templateUrl: './center-edit.component.html',
  styleUrls: ['./center-edit.component.scss'],
})
export class CenterEditComponent implements OnInit {
  centerForm: FormGroup;
  requiredField: any = Validators.required;
  loading: boolean;

  private centerElement: Center;

  constructor(
    private ref: DynamicDialogRef,
    private config: DynamicDialogConfig,
    private centerService: CenterService,
    private formBuilder: FormBuilder,
    private snackbarService: SnackbarService
  ) {
    this.centerForm = this.formBuilder.group({
      id: [''],
      name: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.loading = false;
    this.centerElement = Object.assign({}, this.config.data.center);
    this.setValuesFormGroup();
  }

  saveItem(center: Center) {
    this.loading = true;
    this.centerService.save(center).subscribe({
      next: () => {
        this.snackbarService.showMessage(
          'El registro se ha guardado con éxito'
        );
        this.ref.close(true);
      },
      error: (errorResponse) => {
        this.loading = false;
        this.snackbarService.error(errorResponse['message']);
      },
      complete: () => {
        this.loading = false;
      },
    });
  }

  closeWindow() {
    this.ref.close(false);
  }

  getErrorClass(field: string): string {
    if (this.centerForm.controls[field].status == 'INVALID')
      return 'field-error';
    return '';
  }

  private setValuesFormGroup() {
    this.centerForm.patchValue({
      id: this.centerElement.id,
      name: this.centerElement.name,
    });
  }
}
