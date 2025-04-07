import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { appSettings } from '../app.settings';
import { AppEvent } from '../models/event.model';

@Injectable({
  providedIn: 'root'
})
export class EventService {

  private apiUrl = appSettings.apiUrl;

  constructor(private http: HttpClient) { }

  // Get all events with optional filters
  getEvents(filters?: { date?: string, location?: string, category?: string }): Observable<any> {
    let params = new HttpParams();
    
    if (filters) {
      if (filters.date) params = params.append('date', filters.date);
      if (filters.location) params = params.append('location', filters.location);
      if (filters.category) params = params.append('category', filters.category);
    }
    
    return this.http.get<any>(`${this.apiUrl}/events`, { params });
  }

  getUpcomingEvents(): Observable<AppEvent[]> {
    const url = `${this.apiUrl}/upcoming`; // Or however you define this endpoint in Laravel
    return this.http.get<any>(url);
  }

  // Get a single event by ID
  getEvent(id: string): Observable<AppEvent> {
    return this.http.get<AppEvent>(`${this.apiUrl}/events/${id}`);
  }

  // Create a new event (admin only)
  createEvent(event: Partial<AppEvent>): Observable<AppEvent> {
    return this.http.post<AppEvent>(`${this.apiUrl}/events`, event);
  }

  // Update an existing event (admin only)
  updateEvent(id: string, event: Partial<AppEvent>): Observable<AppEvent> {
    return this.http.put<AppEvent>(`${this.apiUrl}/${id}`, event);
  }

  // Delete an event (admin only)
  deleteEvent(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // Register for an event
  registerForEvent(eventId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${eventId}/register`, {});
  }

  getUserRegisteredEvents(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/registrations`);
  }

  getTotalEventsCount(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/count`);
  }

  checkRegistration(eventId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${eventId}/check-registration`);
  }

  cancelRegistration(eventId: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${eventId}/registration`);
  }

  getCategories(): Observable<any>{
    return this.http.get<any>(`${this.apiUrl}/categories`);
  }

  getLocations(): Observable<any>{
    return this.http.get<any>(`${this.apiUrl}/locations`);
  }
}
