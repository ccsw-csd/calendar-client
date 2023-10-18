import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from "rxjs";
import { environment } from 'src/environments/environment';
import { Calendar, Collective } from '../models/Collective';

@Injectable({
  providedIn: 'root'
})
export class CollectiveService {

  constructor(private http:HttpClient) { }

  getAllCollectives():Observable<Collective[]>{
    return this.http.get<Collective[]>(environment.server+"/group/");
  }

  getCollective(id: number): Observable<Collective>{
    return this.http.get<Collective>(environment.server + "/group/"+ id + "/");
  }

  searchCollective(filterName: string): Observable<Collective[]> {
    return this.http.get<Collective[]>(environment.server + "/group/find/"+filterName);
  }

  save(collective: Collective):Observable<Collective>{
    const saveC = {
      ...collective,
      centersSelected: collective.centersSelected.map(cn => cn.id)
    };
    return this.http.put<Collective>(environment.server + "/group/", saveC);
  }

  delete(id: number):Observable<Collective>{
    return this.http.delete<Collective>(environment.server + `/group/${id}`);
  }

  getCentersByCollective(id: number): Observable<Calendar[]>{
    return this.http.get<Calendar[]>(`${environment.server}/calendar/${id}/`);
  }
}
