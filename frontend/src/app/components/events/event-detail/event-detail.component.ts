// event-detail.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EventService } from '../../../services/event.service';
import { AuthService } from '../../../services/auth.service';
import { AppEvent } from '../../../models/event.model';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-event-detail',
  templateUrl: './event-detail.component.html',
  styleUrls: ['./event-detail.component.css']
})

export class EventDetailComponent implements OnInit {
  event: AppEvent | null = null;
  isLoading = true;
  errorMessage = '';
  isRegistered = false;
  isAdmin = false;

  constructor(
    private route: ActivatedRoute,
    private eventService: EventService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.getUser().subscribe(user => {this.isAdmin = user.role === 'admin'})
    const eventId = this.route.snapshot.paramMap.get('id');
    console.log('Initialization of event details');
    if (eventId) {
      this.loadEvent(eventId);
      this.checkRegistrationStatus(eventId);
    } else {
      this.errorMessage = 'Event ID not provided';
      this.isLoading = false;
    }
  }

  loadEvent(id: string): void {
    this.eventService.getEvent(id).subscribe({
      next: (event) => {
        this.event = event;
        this.isLoading = false;
      },
      error: (error: any) => {
        this.errorMessage = 'Failed to load event details';
        this.isLoading = false;
        console.error('Error loading event:', error);
      }
    });
  }

  checkRegistrationStatus(eventId: string): void {
    this.eventService.checkRegistration(eventId).subscribe({
      next: (status) => {
        console.log(status.is_registered);
        this.isRegistered = status.is_registered;
      },
      error: (error) => {
        console.error('Error checking registration status:', error);
      }
    });
  }

  registerForEvent(): void {
    if (!this.event) return;
    
    this.eventService.registerForEvent(this.event.id.toString()).subscribe({
      next: () => {
        this.isRegistered = true;
      },
      error: (error) => {
        console.error('Error registering for event:', error);
      }
    });
  }

  cancelRegistration(): void {
    if (!this.event) return;
    
    this.eventService.cancelRegistration(this.event.id.toString()).subscribe({
      next: () => {
        this.isRegistered = false;
      },
      error: (error) => {
        console.error('Error canceling registration:', error);
      }
    });
  }

  editEvent(): void {
    if(this.event) this.router.navigate([`/events/${this.event!.id}/edit`]);
  }

  deleteEvent(): void {
    if (!this.event) return;
    
    if (confirm('Are you sure you want to delete this event?')) {
      this.eventService.deleteEvent(this.event.id.toString()).subscribe({
        next: () => {
          this.router.navigate(['/events']);
        },
        error: (error) => {
          console.error('Error deleting event:', error);
        }
      });
    }
  }
}
