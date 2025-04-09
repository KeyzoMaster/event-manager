import { Component, OnInit } from '@angular/core';
import { EventService } from '../../services/event.service';
import { AuthService } from '../../services/auth.service';
import { AppEvent } from '../../models/event.model';
import { DatePipe, NgClass } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AppUser } from '../../models/user.model';
import {EventsCount} from '../../models/event.model';
import { Registration } from '../../models/registration.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [NgClass, RouterLink, DatePipe],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  upcomingEvents: AppEvent[] = [];
  registeredEvents: Registration[] = [];
  isAdmin = false;
  isLoading = true;
  user : AppUser | null = null;
  events_counts : EventsCount | null = null;
  errorMessage = '';

  constructor(
    private eventService: EventService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Check if user is logged in
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    this.loadUser();
    this.loadDashboardData();
    this.eventService.getEventsCount().subscribe(
      events_counts => {this.events_counts = events_counts;}
    );
  }

  // New method to extract user name from token
  loadUser(): void {
    const token = this.authService.getToken();
    if (token) {
      this.authService.getUser().subscribe(user => {
        this.user = user; 
        this.isAdmin = user.role === 'admin'; 
      })
    }
  }

  loadDashboardData(): void {
    // Use forkJoin to execute multiple requests simultaneously
    this.isLoading = true;
    
    // Get upcoming events (next 7 days)
    this.eventService.getUpcomingEvents().subscribe({
      next: (events) => {
        this.upcomingEvents = events;
        this.isLoading = false;
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage = 'Failed to load upcoming events';
        this.isLoading = false;
        console.error('Error loading upcoming events:', error);
        
        // Handle 401 errors (unauthorized)
        if (error.status === 401) {
          this.authService.logout();
          this.router.navigate(['/login']);
        }
      }
    });
    
    // Get user's registered events
    this.eventService.getUserRegisteredEvents().subscribe({
      next: (events) => {
        this.registeredEvents = events;
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error loading registered events:', error);
        
        // Handle 401 errors (unauthorized)
        if (error.status === 401) {
          this.authService.logout();
          this.router.navigate(['/login']);
        }
      }
    });
    
    // Get total events count (admin only)
    if (this.user) {
      this.eventService.getEventsCount().subscribe({
        next: (counts) => {
          this.events_counts = counts;
        },
        error: (error: HttpErrorResponse) => {
          console.error('Error loading total events count:', error);
          
          // Handle 401 errors (unauthorized)
          if (error.status === 401) {
            this.authService.logout();
            this.router.navigate(['/login']);
          }
        }
      });
    }
  }

  cancelRegistration(eventId: string): void {
    this.eventService.cancelRegistration(eventId).subscribe({
      next: () => {
        // Remove from registeredEvents list
        this.registeredEvents = this.registeredEvents.filter(registration => {
          return registration.event.id.toString() !== eventId;
        });
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error canceling registration:', error);
        
        // Handle 401 errors (unauthorized)
        if (error.status === 401) {
          this.authService.logout();
          this.router.navigate(['/login']);
        }
      }
    });
  }

  refreshDashboard(): void {
    this.loadDashboardData();
  }

  getEventStatusClass(event: AppEvent): string {
    const eventDate = new Date(event.start_date);
    const today = new Date();
    
    // Set time to midnight for date comparison
    today.setHours(0, 0, 0, 0);
    
    if (eventDate < today) {
      return 'text-secondary'; // Past event
    }
    
    // Check if event is happening today
    if (eventDate.getDate() === today.getDate() && 
        eventDate.getMonth() === today.getMonth() && 
        eventDate.getFullYear() === today.getFullYear()) {
      return 'text-danger'; // Today's event
    }
    
    // Event is in the next 3 days
    const threeDaysLater = new Date(today);
    threeDaysLater.setDate(today.getDate() + 3);
    
    if (eventDate <= threeDaysLater) {
      return 'text-warning'; // Upcoming soon
    }
    
    return 'text-primary'; // Future event
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}