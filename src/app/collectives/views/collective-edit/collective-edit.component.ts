import { Component, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Calendar, Collective } from '../../models/Collective';
import { CollectiveService } from '../../services/collective.service';
import {
  FormGroup,
  Validators,
  FormBuilder,
  AbstractControl,
  FormControl,
} from '@angular/forms';
import { SnackbarService } from 'src/app/core/services/snackbar.service';
import { CenterService } from 'src/app/centers/services/center.service';
import { Center } from 'src/app/centers/models/Center';
import { forkJoin } from 'rxjs/internal/observable/forkJoin';
import { of } from 'rxjs/internal/observable/of';

@Component({
  selector: 'app-collective-edit',
  templateUrl: './collective-edit.component.html',
  styleUrls: ['./collective-edit.component.scss'],
})
export class CollectiveEditComponent implements OnInit {
  collectiveElement: Collective;
  item: any;
  groupCollective: any[] = [];
  collectiveSelected;
  collectiveForm: FormGroup;
  requiredField: any = Validators.required;
  loading: boolean;
  centers: Center[] = [];
  numRegex = /^-?\d*[.,]?\d{0,2}$/;

  constructor(
    private ref: DynamicDialogRef,
    private config: DynamicDialogConfig,
    private collectiveService: CollectiveService,
    private formBuilder: FormBuilder,
    private snackbarService: SnackbarService,
    private centerService: CenterService
  ) {
    this.collectiveForm = this.formBuilder.group({
      id: [''],
      checkIntensive: [''],
      name: ['', Validators.required],
      maxHourYear: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
      hoursWeek: ['', [Validators.required, Validators.pattern(this.numRegex)]],
      hoursF: ['', [Validators.required, Validators.pattern(this.numRegex)]],
      personalDays: ['0', [Validators.pattern('^[0-9]+$')]],
      freeDays: ['0', [Validators.pattern('^[0-9]+$')]],
      additionalDays: ['0', [Validators.pattern('^[0-9]+$')]],
      holidays: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
      hoursIntensive: [
        '',
        [Validators.pattern('^[0-9]+$'), this.intensiveValidators],
      ],
      intensiveFrom: ['', [this.intensiveValidators]],
      intensiveTo: ['', [this.intensiveValidators]],
      centersSelected: [''],
    });

    this.collectiveForm.get('checkIntensive').valueChanges.subscribe(() => {
      this.collectiveForm.get('hoursIntensive').updateValueAndValidity();
      this.collectiveForm.get('intensiveFrom').updateValueAndValidity();
      this.collectiveForm.get('intensiveTo').updateValueAndValidity();
    });
  }

  ngOnInit(): void {
    this.loading = false;
    this.collectiveElement = Object.assign({}, this.config.data.collective);
    this.getAllCenters();
    if (Object.keys(this.collectiveElement).length !== 0) {
      this.setValuesFormGroup();
    }
  }

  setValuesFormGroup() {
    this.collectiveForm.patchValue({
      id: this.collectiveElement.id,
      name: this.collectiveElement.name,
      maxHourYear: this.collectiveElement.maxHourYear,
      hoursWeek: this.collectiveElement.hoursWeek,
      hoursF: this.collectiveElement.hoursF,
      freeDays: this.collectiveElement.freeDays,
      personalDays: this.collectiveElement.personalDays,
      holidays: this.collectiveElement.holidays,
      additionalDays: this.collectiveElement.additionalDays,
      hoursIntensive: this.collectiveElement.hoursIntensive,
      intensiveFrom: this.collectiveElement.intensiveFrom
        ? new Date(this.collectiveElement.intensiveFrom)
        : '',
      intensiveTo: this.collectiveElement.intensiveTo
        ? new Date(this.collectiveElement.intensiveTo)
        : '',
      checkIntensive: this.collectiveElement.hoursIntensive ? true : false,
    });
  }

  saveItem(collective: Collective) {
    this.loading = true;
    this.collectiveService.save(collective).subscribe({
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

  showDialog(element?: any) {
    this.item = element;
  }

  searchCollective($event) {}

  updateFormValidators() {
    const requiredFields = ['name', 'max', 'hours', 'hoursF', 'holyDays'];
    requiredFields.forEach((fieldName) => {
      const control = this.collectiveForm.get(fieldName);
      control.setValidators(Validators.required);
      control.updateValueAndValidity();
    });
  }

  resetFormDefaultValidators() {
    Object.keys(this.collectiveForm.controls).forEach((key) => {
      let control = this.collectiveForm.get(key);
      control.clearValidators();
      control.updateValueAndValidity();
    });

    const requiredFields = ['name', 'max', 'hours', 'hoursF', 'holyDays'];
    requiredFields.forEach((fieldName) => {
      const control = this.collectiveForm.get(fieldName);
      control.setValidators(Validators.required);
      control.updateValueAndValidity();
    });
  }

  getErrorClass(field: string): string {
    return this.collectiveForm.controls[field].status == 'INVALID' &&
      this.collectiveForm.controls[field].touched
      ? 'field-error'
      : '';
  }

  intensiveValidators(formControl: AbstractControl) {
    if (!formControl.parent) {
      return null;
    }

    if (formControl.parent.get('checkIntensive').value) {
      return Validators.required(formControl);
    }
    return null;
  }

  getAllCenters() {
    const sources = [
      this.centerService.getAllCenters(),
      Object.keys(this.collectiveElement).length !== 0
        ? this.collectiveService.getCentersByCollective(
            this.collectiveElement.id
          )
        : of(null),
    ];
    forkJoin(sources).subscribe({
      next: (res: any[]) => {
        this.centers = res[0].sort((a, b) => {
          const nameA = a.name.toUpperCase();
          const nameB = b.name.toUpperCase();
          if (nameA < nameB) {
            return -1;
          }
          if (nameA > nameB) {
            return 1;
          }
          return 0;
        });
        
        if (res[1]) {
          this.collectiveForm
            .get('centersSelected')
            .setValue(
              this.centers.filter((cn) =>
                res[1].map((rs) => rs.centerId).includes(cn.id)
              )
            );
          this.collectiveForm.get('centersSelected').updateValueAndValidity();
        }
      },
    });
  }
}
