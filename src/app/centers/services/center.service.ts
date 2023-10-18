import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from "rxjs";
import { environment } from 'src/environments/environment';
import { Center } from '../models/Center';

@Injectable({
  providedIn: 'root'
})
export class CenterService {

  constructor(private http:HttpClient) { }

  getAllCenters():Observable<Center[]>{
    return this.http.get<Center[]>(environment.server+"/center/");
  }

  getCenter(id: number): Observable<Center>{
    return this.http.get<Center>(environment.server + "/center/"+ id);
  }

  searchCenter(filterName: string): Observable<Center[]> {
    return this.http.get<Center[]>(environment.server + "/center/find/"+filterName);
  }

  save(center: Center):Observable<Center>{
    if(center.id) {
      return this.http.put<Center>(environment.server + "/center/", center);
    } else {
      return this.http.post<Center>(environment.server + "/center/", center);
    }
    
  }

  delete(id: number):Observable<Center>{
    return this.http.delete<Center>(environment.server + `/center/${id}`);
  }
}
