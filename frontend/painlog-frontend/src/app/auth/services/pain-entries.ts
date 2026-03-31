import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { SupabaseService } from '../supabase';
import { from, Observable, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PainEntriesService {
  private apiUrl = 'https://painlog.onrender.com/api/pain-entries';

  constructor(
    private http: HttpClient,
    private supabase: SupabaseService
  ) {}

  getPainEntries(): Observable<any> {
    return from(this.supabase.getSession()).pipe(
      switchMap(({ data }) => {
        const token = data.session?.access_token;
        const headers = new HttpHeaders({
          Authorization: `Bearer ${token}`,
        });
        return this.http.get(this.apiUrl, { headers });
      })
    );
  }

  createPainEntry(entry: any): Observable<any> {
    return from(this.supabase.getSession()).pipe(
      switchMap(({ data }) => {
        const token = data.session?.access_token;
        const headers = new HttpHeaders({
          Authorization: `Bearer ${token}`,
        });
        return this.http.post(this.apiUrl, entry, { headers });
      })
    );
  }

  updatePainEntry(id: string, entry: any): Observable<any> {
    return from(this.supabase.getSession()).pipe(
      switchMap(({ data }) => {
        const token = data.session?.access_token;
        const headers = new HttpHeaders({
          Authorization: `Bearer ${token}`,
        });
        return this.http.put(`${this.apiUrl}/${id}`, entry, { headers });
      })
    );
  }

  deletePainEntry(id: string): Observable<any> {
    return from(this.supabase.getSession()).pipe(
      switchMap(({ data }) => {
        const token = data.session?.access_token;
        const headers = new HttpHeaders({
          Authorization: `Bearer ${token}`,
        });
        return this.http.delete(`${this.apiUrl}/${id}`, { headers });
      })
    );
  }
}