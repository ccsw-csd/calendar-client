import { Component, OnInit } from '@angular/core';
import { ScheduleType } from '../model/schedule-type';
import { MetadataDay } from '../model/metadata-day';
import { DropdownEntry } from '../model/dropdown-entry';

@Component({
  selector: 'app-edit-calendar',
  templateUrl: './edit-calendar.component.html',
  styleUrls: ['./edit-calendar.component.scss']
})
export class EditCalendarComponent implements OnInit {

  isLoading: boolean = true;  
  actualYear: number = 0;
  horasLaborales: number = 0;
  diasFestivos: number = 0;

  scheduleTypes: ScheduleType[];
  selectedType: ScheduleType;

  selectedCalendar: Map<String, MetadataDay>;


  centers: DropdownEntry[];
  collectives: DropdownEntry[];

  selectedCenter: DropdownEntry;
  selectedCollective: DropdownEntry;


  calendars: Map<String, Map<String, MetadataDay>>;



  constructor() { 
    
    this.calendars = new Map();

    this.centers = [
      new DropdownEntry({code:'AST', name: 'Asturias'}),
      new DropdownEntry({code:'BCN', name: 'Barcelona'}),
      new DropdownEntry({code:'MAD', name: 'Madrid'}),
      new DropdownEntry({code:'MUR', name: 'Murcia'}),
      new DropdownEntry({code:'VLC', name: 'Valencia'}),
    ];

    this.collectives = [
      new DropdownEntry({code:'GEN', name: 'Genérico'}),
      new DropdownEntry({code:'CAP', name: 'Ca' + 'pg' + 'em' + 'min' + 'i'}),
      new DropdownEntry({code:'SOG', name: 'So' + 'ge' + 'ti'}),
      new DropdownEntry({code:'ALT', name: 'Al' + 'tr' + 'an'}),
    ];


    let actualDate = new Date();
    this.actualYear = actualDate.getFullYear();

    this.scheduleTypes = [
      new ScheduleType({
        name: "Festivo",
        absence: true,
        color: '#aaaaff'
      }),
      new ScheduleType({
        name: "Jornada normal (8h 25min)",
        absence: false,
        color: 'transparent',
        hours: 8,
        minutes: 25
      }),
      new ScheduleType({
        name: "Jornada intensiva (7h)",
        absence: false,
        color: '#ffaaaa',
        hours: 7,
        minutes: 0
      })
    ];

    this.selectedType = this.scheduleTypes[0];

    this.selectedCenter = this.centers[0];
    this.selectedCollective = this.collectives[0];
  }

  generateDefaultCalendar() : Map<String, MetadataDay> {
    
    let metadataDay = new Map<String, MetadataDay>();

    let normalDay = this.scheduleTypes[1];
    let intensiveDay = this.scheduleTypes[2];

    let weekend = new ScheduleType({
      name: "Fin de semana",
      absence: true,
      color: '#ededed'
    });


    for (let month = 0; month < 12; month++) {
      for (let day = 1; day <= 31; day++) {

        let date = new Date(this.actualYear, month, day);

        //Sigue siendo dentro del mismo mes
        if (date.getMonth() == month) {
          let isWeekend = date.getDay() == 0 || date.getDay() == 6;

          let type = normalDay;
          if (isWeekend) type = weekend;
          else if (date.getDay() == 5) type = intensiveDay;
          else if (date.getMonth() == 6 || date.getMonth() == 7) type = intensiveDay;
          
          let metadata = new MetadataDay({
            day: day,
            month: month,
            year: this.actualYear,
            originalType: type,
            type: type
          });
          
          let key = month+"_"+day;
          metadataDay.set(key, metadata);
        }

      }
    }

    return metadataDay;


  }


  ngOnInit(): void {


    for (let center of this.centers) {

      for (let collective of this.collectives) {

        let calendar = this.generateDefaultCalendar();

        let key = center.code + "_" + collective.code;
        this.calendars.set(key, calendar);
      }
    }


    this.selectedCalendar = this.generateDefaultCalendar();

    this.calculateTotals();
    this.isLoading = false;
  }
  
  changeCenterOrCollective() : void {
    this.changeCalendar();
  }


  getSelectedCalendar() : Map<String, MetadataDay> {
    let key = this.selectedCenter.code + "_" + this.selectedCollective.code;
    return this.calendars.get(key);
  }

  changeCalendar() : void {

    let calendar = this.getSelectedCalendar();

    this.selectedCalendar.forEach((value: MetadataDay, key: string) => {

      let day : MetadataDay = calendar.get(key);

      value.originalType = day.originalType;
      value.type = day.type;
    });

    this.calculateTotals();
  }


  selectType(type: ScheduleType) : void {
    this.selectedType = type;
  }

  selectDate(date: any) : void {
    if (date.type == this.selectedType) 
      date.type = date.originalType;    
    else 
      date.type = this.selectedType; 

    this.changeDateInCalendarChild(date);
    this.calculateTotals();
  }

  changeDateInCalendarChild(date: any) {
    
    let calendar = this.getSelectedCalendar();
    let dateKey = date.month + "_" + date.day;
    let selectedDate = calendar.get(dateKey);

    selectedDate.type = date.type;

    if (this.selectedCollective.code == 'GEN') {

      for (let collective of this.collectives) {

        let calendarKey = this.selectedCenter.code + "_" + collective.code;
        let calendar = this.calendars.get(calendarKey);

        let selectedDate = calendar.get(dateKey);
        selectedDate.type = date.type;    
      }
    }
  }

  calculateTotals() : void {

    this.horasLaborales = 0;
    this.diasFestivos = 0;

    for (let day of this.selectedCalendar.values()) {

      if (day.type.absence) {

        if (day.type == this.scheduleTypes[0])
          this.diasFestivos++;
      }
      else {
        this.horasLaborales += day.type.hours;
        this.horasLaborales += day.type.minutes / 60.0;

      }
    }

  }


}
