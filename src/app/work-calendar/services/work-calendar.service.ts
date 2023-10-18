import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/internal/Observable';
import { Calendar } from 'src/app/collectives/models/Collective';
import { environment } from 'src/environments/environment';
import { SaveDay } from '../model/save-day';

@Injectable({
  providedIn: 'root'
})
export class WorkCalendarService {

  constructor(private http:HttpClient) { }

  getCalendars(): Observable<Calendar[]>{
    return this.http.get<Calendar[]>(`${environment.server}/calendar/`);
  }

  saveDays(days: SaveDay[]): Observable<SaveDay> {
    const data = { data: days };
    return this.http.post<SaveDay>(environment.server + "/days/", data);
  }

  getDays(year: number, calendarId: number): Observable<SaveDay[]> {
    return this.http.get<SaveDay []>(`${environment.server}/days?year=${year}&calendarId=${calendarId}`);
  }
}
