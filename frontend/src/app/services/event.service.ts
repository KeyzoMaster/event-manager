import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { appSettings } from '../app.settings';
import { AppEvent, EventsCount } from '../models/event.model';
import { Registration } from '../models/registration.model';

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
    return this.http.get<AppEvent[]>(`${this.apiUrl}/upcoming`);
  }

  // Get a single event by ID
  getEvent(id: string): Observable<AppEvent> {
    return this.http.get<AppEvent>(`${this.apiUrl}/events/${id}`);
  }

  // Create a new event (admin only)
  createEvent(event: AppEvent): Observable<AppEvent> {
    return this.http.post<AppEvent>(`${this.apiUrl}/events`, event);
  }

  // Update an existing event (admin only)
  updateEvent(id: string, event: Partial<AppEvent>): Observable<Partial<AppEvent>> {
    return this.http.patch<Partial<AppEvent>>(`${this.apiUrl}/events/${id}`, event);
  }

  // Delete an event (admin only)
  deleteEvent(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/events/${id}`);
  }

  // Register for an event
  registerForEvent(eventId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/events/${eventId}/register`, {});
  }

  getUserRegisteredEvents(): Observable<Registration[]> {
    return this.http.get<Registration[]>(`${this.apiUrl}/registrations`);
  }

  getEventsCount(): Observable<EventsCount> {
    return this.http.get<EventsCount>(`${this.apiUrl}/counts`);
  }

  checkRegistration(eventId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/events/${eventId}/register`);
  }

  cancelRegistration(eventId: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/events/${eventId}/register`);
  }

  getCategories(): Observable<any>{
    return this.http.get<any>(`${this.apiUrl}/categories`);
  }

  getLocations(): Observable<any>{
    return this.http.get<any>(`${this.apiUrl}/locations`);
  }
}
