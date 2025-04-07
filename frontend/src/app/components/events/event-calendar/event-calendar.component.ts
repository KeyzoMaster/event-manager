// event-calendar.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {FullCalendarModule} from '@fullcalendar/angular';
import { CalendarOptions, EventClickArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { EventService } from '../../../services/event.service';
import { AuthService } from '../../../services/auth.service';
import { AppEvent } from '../../../models/event.model';

@Component({
  selector: 'app-event-calendar',
  standalone: true,
  imports: [FullCalendarModule],
  templateUrl: './event-calendar.component.html',
  styleUrls: ['./event-calendar.component.css']
})
export class EventCalendarComponent implements OnInit {
  isLoading = true;
  errorMessage = '';
  events: AppEvent[] = [];
  isAdmin = false;
  
  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    weekends: true,
    editable: false,
    selectable: false,
    selectMirror: true,
    dayMaxEvents: true,
    events: [],
    eventClick: this.handleEventClick.bind(this),
    height: 'auto'
  };

  constructor(
    private eventService: EventService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();
    this.loadEvents();
  }

  loadEvents(): void {
    this.eventService.getEvents().subscribe({
      next: (events) => {
        this.events = events;
        this.updateCalendarEvents();
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load events';
        this.isLoading = false;
        console.error('Error loading events:', error);
      }
    });
  }

  updateCalendarEvents(): void {
    // Transform events to FullCalendar format
    const calendarEvents = this.events.map(event => ({
      id: event.id.toString(),
      title: event.title,
      start: `${event.start_date}`,
      end: `${event.end_date}`,
      color: this.getCategoryColor(event.category)
    }));
    
    this.calendarOptions.events = calendarEvents;
  }

  getCategoryColor(category: string): string {
    // Map categories to colors for visual distinction
    const categoryColors: {[key: string]: string} = {
      'Workshop': '#4285F4',
      'Conference': '#EA4335',
      'Meeting': '#FBBC05',
      'Social': '#34A853',
      'Other': '#8F44AD'
    };
    
    return categoryColors[category] || '#4285F4';
  }

  handleEventClick(clickInfo: EventClickArg): void {
    // Navigate to event details
    this.router.navigate(['/events', clickInfo.event.id]);
  }

  refreshCalendar(): void {
    this.loadEvents();
  }
}
