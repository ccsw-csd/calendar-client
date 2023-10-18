import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { ScheduleType } from '../model/schedule-type';
import { MetadataDay } from '../model/metadata-day';
import { DropdownEntry } from '../model/dropdown-entry';
import { CollectiveService } from 'src/app/collectives/services/collective.service';
import { SaveDay } from '../model/save-day';
import { WorkCalendarService } from '../services/work-calendar.service';
import { Calendar, Collective } from 'src/app/collectives/models/Collective';
import { SnackbarService } from 'src/app/core/services/snackbar.service';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { ConfirmationService } from 'primeng/api';
import { forkJoin } from 'rxjs/internal/observable/forkJoin';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
@Component({
  selector: 'app-edit-calendar',
  templateUrl: './edit-calendar.component.html',
  styleUrls: ['./edit-calendar.component.scss'],
  providers: [DynamicDialogRef, ConfirmationService],
})
export class EditCalendarComponent {
  @ViewChild('calendarsDiv') calendarsDiv: ElementRef;
  @ViewChild('dataDiv') dataDiv: ElementRef;

  isLoading: boolean = true;
  horasLaborales: number = 0;
  diasFestivos: number = 0;

  scheduleTypes: ScheduleType[];
  selectedType: ScheduleType;
  selectedYear: DropdownEntry;
  selectedYearAux: DropdownEntry;
  selectedCalendar: Map<String, MetadataDay>;

  modifiedDays: SaveDay[] = [];

  centers: DropdownEntry[];
  collectives: DropdownEntry[];
  years: DropdownEntry[] = [];

  existingCalendars: Calendar[] = [];

  selectedCenter: DropdownEntry;
  selectedCollective: DropdownEntry;

  calendars: Map<String, Map<String, MetadataDay>>;
  collectiveData: Collective;

  constructor(
    private collectiveService: CollectiveService,
    private workCalendarService: WorkCalendarService,
    private snackbarService: SnackbarService,
    private confirmationService: ConfirmationService,
    private ref: DynamicDialogRef
  ) {
    this.calendars = new Map();

    const actualYear = new Date().getFullYear() + 1;
    for (let i = actualYear; i >= 2023; i--) {
      this.years.push(
        new DropdownEntry({ code: i.toString(), name: i.toString() })
      );
    }

    this.selectedYearAux = {
      code: actualYear.toString(),
      name: actualYear.toString(),
    };

    this.scheduleTypes = [
      new ScheduleType({
        id: 1,
        name: 'Festivo',
        absence: true,
        color: '#aaaaff',
      }),
      new ScheduleType({
        id: 2,
        name: 'Jornada normal (8h 25min)',
        absence: false,
        color: 'transparent',
        hours: 8,
        minutes: 25,
      }),
      new ScheduleType({
        id: 3,
        name: 'Jornada intensiva (7h)',
        absence: false,
        color: '#ffaaaa',
        hours: 7,
        minutes: 0,
      }),
    ];

    this.selectedType = this.scheduleTypes[0];
    this.getCalendars();
  }

  getCalendars() {
    this.workCalendarService.getCalendars().subscribe({
      next: (res) => {
        this.existingCalendars = res;
        const centerAux = res.map((r) => ({
          name: r.centerName,
          code: r.centerId.toString(),
        }));
        this.centers = [
          ...new Map(centerAux.map((item) => [item['name'], item])).values(),
        ];
        this.selectedCenter = this.centers[0];
        this.collectives = res
          .filter((r) => r.centerId.toString() === this.selectedCenter.code)
          .map((rs) => ({ code: rs.groupId.toString(), name: rs.groupName }));
        this.selectedCollective = this.collectives[0];
        this.changeCollective();

        this.existingCalendars.forEach((element) => {
          let calendar = this.generateDefaultCalendar();
          let key = element.centerId + '_' + element.groupId;
          this.calendars.set(key, calendar);
        });

        this.selectedCalendar = this.generateDefaultCalendar();
        this.isLoading = false;
      },
    });
  }

  getDaysData() {
    const calendarId = this.existingCalendars.filter(
      (eC) =>
        eC.centerId.toString() === this.selectedCenter.code &&
        eC.groupId.toString() === this.selectedCollective.code
    )[0];
    this.workCalendarService
      .getDays(parseInt(this.selectedYear.code), calendarId.id)
      .subscribe({
        next: (res) => {
          this.generateCurrentCalendar(res);
        },
      });
  }

  generateCurrentCalendar(days: SaveDay[]) {
    let calendar = this.getSelectedCalendar();

    this.selectedCalendar.forEach((value: MetadataDay, key: string) => {
      let day: MetadataDay = calendar.get(key);
      value.originalType = day.originalType;
      value.type = day.type;

      const isFriday =
        new Date(value.year, value.month, value.day).getDay() === 5;
      if (
        this.collectiveData.hoursF !== this.collectiveData.hoursWeek &&
        isFriday
      ) {
        value.type = this.scheduleTypes[2];
        value.originalType = this.scheduleTypes[2];
        day.type = this.scheduleTypes[2];
        day.originalType = this.scheduleTypes[2];
      }
    });

    if (this.collectiveData.intensiveFrom && this.collectiveData.intensiveTo) {
      const dateFrom = new Date(this.collectiveData.intensiveFrom);
      const dateTo = new Date(this.collectiveData.intensiveTo);
      dateFrom.setFullYear(parseInt(this.selectedYear.code));
      dateTo.setFullYear(parseInt(this.selectedYear.code));
      for (let d = dateFrom; d <= dateTo; d.setDate(d.getDate() + 1)) {
        if (d.getDay() !== 0 && d.getDay() !== 6) {
          const key = `${d.getMonth()}_${d.getDate()}`;
          this.selectedCalendar.get(key).type = this.scheduleTypes[2];
          this.selectedCalendar.get(key).originalType = this.scheduleTypes[2];
          calendar.get(key).type = this.scheduleTypes[2];
          calendar.get(key).originalType = this.scheduleTypes[2];
        }
      }
    }

    days.forEach((day) => {
      const dayDate = new Date(day.date);
      if (dayDate.getDay() !== 0 && dayDate.getDay() !== 6) {
        const key = `${dayDate.getMonth()}_${dayDate.getDate()}`;

        if (calendar.get(key).type.id === calendar.get(key).originalType.id) {
          this.selectedCalendar.get(key).type = this.scheduleTypes.find(
            (sT) => sT.id === day.categoryId
          );
          this.selectedCalendar.get(key).originalType = this.scheduleTypes.find(
            (sT) => sT.id === day.categoryId
          );
          calendar.get(key).type = this.scheduleTypes.find(
            (sT) => sT.id === day.categoryId
          );
          calendar.get(key).originalType = this.scheduleTypes.find(
            (sT) => sT.id === day.categoryId
          );
        }
      }
    });

    this.calculateTotals();
  }

  generateDefaultCalendar(): Map<String, MetadataDay> {
    let metadataDay = new Map<String, MetadataDay>();
    let normalDay = this.scheduleTypes[1];
    let weekend = new ScheduleType({
      name: 'Fin de semana',
      absence: true,
      color: '#ededed',
      id: 9,
    });

    for (let month = 0; month < 12; month++) {
      for (let day = 1; day <= 31; day++) {
        let date = new Date(parseInt(this.selectedYearAux.code), month, day);
        if (date.getMonth() == month) {
          let isWeekend = date.getDay() == 0 || date.getDay() == 6;

          let type = normalDay;
          if (isWeekend) type = weekend;

          let metadata = new MetadataDay({
            day: day,
            month: month,
            year: parseInt(this.selectedYearAux.code),
            originalType: type,
            type: type,
          });

          let key = month + '_' + day;
          metadataDay.set(key, metadata);
        }
      }
    }

    return metadataDay;
  }

  changeCenter(): void {
    this.collectives = this.existingCalendars
      .filter((r) => r.centerId.toString() === this.selectedCenter.code)
      .map((rs) => ({ code: rs.groupId.toString(), name: rs.groupName }));
    if (this.collectives.find((c) => c.code === this.selectedCollective.code)) {
      this.getDaysData();
    } else {
      this.selectedCollective = this.collectives[0];
      this.changeCollective();
    }
  }

  changeCollective(): void {
    const calendarId = this.existingCalendars.filter(
      (eC) =>
        eC.centerId.toString() === this.selectedCenter.code &&
        eC.groupId.toString() === this.selectedCollective.code
    )[0];
    const sources = [
      this.collectiveService.getCollective(
        parseInt(this.selectedCollective.code)
      ),
      this.workCalendarService.getDays(
        parseInt(this.selectedYear.code),
        calendarId.id
      ),
    ];

    forkJoin(sources).subscribe({
      next: (res: any[]) => {
        this.collectiveData = res[0];
        const hours = Math.trunc(this.collectiveData.hoursWeek);
        const minutes =
          (this.collectiveData.hoursWeek -
            Math.trunc(this.collectiveData.hoursWeek)) *
          60;
        const hoursIntensive = Math.trunc(this.collectiveData.hoursIntensive);
        const minutesIntensive =
          (this.collectiveData.hoursIntensive -
            Math.trunc(this.collectiveData.hoursIntensive)) *
          60;
        this.scheduleTypes[1].name = `Jornada normal (${hours}h ${minutes}m)`;
        this.scheduleTypes[1].hours = hours;
        this.scheduleTypes[1].minutes = minutes;
        this.scheduleTypes[2].name = `Jornada intensiva (${hoursIntensive}h ${minutesIntensive}m)`;
        this.scheduleTypes[2].hours = hoursIntensive;
        this.scheduleTypes[2].minutes = minutesIntensive;
        this.generateCurrentCalendar(res[1]);
      },
    });
  }

  getSelectedCalendar(): Map<String, MetadataDay> {
    let key = this.selectedCenter.code + '_' + this.selectedCollective.code;
    return this.calendars.get(key);
  }

  changeYear(): void {
    this.confirmationService.confirm({
      message: 'Si cambia el año se perderan todos los cambios ¿Continuar?.',
      rejectButtonStyleClass: 'p-button p-button-secondary p-button-outlined',
      accept: () => {
        this.selectedYearAux = this.selectedYear;
        this.confirmationService.close();
        this.resetCalendar();
        this.changeCollective();
      },
      reject: () => {
        this.selectedYear = this.selectedYearAux;
        this.confirmationService.close();
      },
    });
  }

  selectType(type: ScheduleType): void {
    this.selectedType = type;
  }

  selectDate(date: any): void {
    if (date.type == this.selectedType) date.type = date.originalType;
    else date.type = this.selectedType;

    this.changeDateInCalendarChild(date);
    this.calculateTotals();
  }

  changeDateInCalendarChild(date: any) {
    let calendar = this.getSelectedCalendar();
    let dateKey = date.month + '_' + date.day;
    let selectedDate = calendar.get(dateKey);

    selectedDate.type = date.type;

    /*if(date.type.id === this.scheduleTypes[0].id) {
      for (const [key, value] of this.calendars.entries()) {
        if(key.split('_')[0] === this.selectedCenter.code) {
          let dateKey = date.month + '_' + date.day;
          let selectedDate = value.get(dateKey);
          selectedDate.type = date.type;
        }
      }
    }*/
  }

  calculateTotals(): void {
    this.horasLaborales = 0;
    this.diasFestivos = 0;

    for (let day of this.selectedCalendar.values()) {
      if (day.type.absence) {
        if (day.type == this.scheduleTypes[0]) this.diasFestivos++;
      } else {
        this.horasLaborales += day.type.hours;
        this.horasLaborales += day.type.minutes / 60.0;
      }
    }

    const holidays = this.collectiveData.hoursIntensive
      ? (this.collectiveData.holidays / 2) * this.collectiveData.hoursWeek +
        (this.collectiveData.holidays / 2) * this.collectiveData.hoursIntensive
      : this.collectiveData.holidays * this.collectiveData.hoursWeek;

    this.horasLaborales -= holidays;
    this.horasLaborales -=
      this.collectiveData.additionalDays * this.collectiveData.hoursWeek;
    this.horasLaborales -=
      this.collectiveData.freeDays * this.collectiveData.hoursWeek;
    this.horasLaborales -=
      this.collectiveData.personalDays * this.collectiveData.hoursWeek;
  }

  saveDays(): void {
    this.isLoading = true;

    for (const [key, value] of this.calendars.entries()) {
      for (const [key_day, metaDay] of value.entries()) {
        if (metaDay.originalType.id !== metaDay.type.id) {
          const center = key.split('_')[0];
          const group = key.split('_')[1];

          this.modifiedDays.push({
            date: `${metaDay.year}-${metaDay.month + 1}-${metaDay.day}`,
            categoryId: metaDay.type.id,
            calendarId: this.existingCalendars.find(
              (cc) =>
                cc.centerId === parseInt(center) &&
                cc.groupId === parseInt(group)
            ).id,
          });
          const calendar = this.getSelectedCalendar();
          calendar.get(key_day).originalType = calendar.get(key_day).type;
        }
      }
    }

    this.workCalendarService.saveDays(this.modifiedDays).subscribe({
      next: () => {
        this.snackbarService.showMessage(
          'El calendario se ha guardado correctamente'
        );
        this.modifiedDays = [];
        this.ref.close(true);
      },
      error: (errorResponse) => {
        this.isLoading = false;
        this.snackbarService.error(errorResponse['message']);
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }

  resetCalendar(): void {
    this.calendars.clear();
    this.selectedCalendar = null;
    this.existingCalendars.forEach((element) => {
      let calendar = this.generateDefaultCalendar();
      let key = element.centerId + '_' + element.groupId;
      this.calendars.set(key, calendar);
    });
    this.selectedCalendar = this.generateDefaultCalendar();
  }

  openPDF(): void {
    this.isLoading = true;
    html2canvas(this.calendarsDiv.nativeElement, {
      scrollX: 0,
      scrollY: -window.scrollY,
    }).then((canvas) => {
      let fileWidth = 200;
      let fileHeight = (canvas.height * fileWidth) / canvas.width;

      let fontHeader = 20;
      let fontbody = 10;
      let fontsmall = 7;
      let spacing = 1;

      if(fileHeight > 245 ) {
        fileHeight = 245;
        fontHeader = 10;
        fontbody = 7;
        fontsmall = 6;
        spacing=0.8;
      }

      const FILEURI = canvas.toDataURL('image/png');
      let PDF = new jsPDF('p', 'mm', 'a4');

      PDF.addImage('/assets/images/capgemini.png', 'PNG', 5, 10, 42, 10);
      PDF.setFontSize(fontHeader);
      PDF.text(
        `Calendario ${this.selectedYear.code} para ${this.selectedCenter.name} (Colectivo ${this.selectedCollective.name})`,
        5,
        30*spacing
      );

      PDF.setFontSize(fontsmall);
      PDF.text(
        [
          `Dias Festivos: ${this.diasFestivos} | Dias Vacaciones: ${this.collectiveData.holidays} | Dias Libre disposicion: ${this.collectiveData.freeDays} | Dias Asuntos propios: ${this.collectiveData.personalDays}`,
        ],
        5,
        37*spacing
      );

      PDF.setFontSize(fontbody);
      PDF.setFillColor(170, 170, 255);
      PDF.circle(7, 45*spacing, 2, 'FD');
      PDF.text('Festivos', 10, 45*spacing, { baseline: 'middle' });

      PDF.setFillColor(255, 170, 170);
      PDF.circle(35, 45*spacing, 2, 'FD');
      PDF.text('Jornada Intensiva 7h', 38, 45*spacing, { baseline: 'middle' });

      PDF.setFillColor(255, 255, 255);
      PDF.circle(80, 45*spacing, 2, 'FD');
      PDF.text('Jornada normal 8h', 83, 45*spacing, { baseline: 'middle' });

      PDF.addImage(FILEURI, 'PNG', 5, 52*spacing, fileWidth, fileHeight);

      PDF.save(
        `${this.selectedYear.code}_${this.selectedCenter.name}_${this.selectedCollective.name}.pdf`
      );
      this.isLoading = false;
    });
  }
}
