import { Routes } from "@angular/router";
import { LoginComponent } from "./components/auth/login/login.component";
import { RegisterComponent } from "./components/auth/register/register.component";
import { DashboardComponent } from "./components/dashboard/dashboard.component";
import { EventCalendarComponent } from "./components/events/event-calendar/event-calendar.component";
import { EventDetailComponent } from "./components/events/event-detail/event-detail.component";
import { EventFormComponent } from "./components/events/event-form/event-form.component";
import { EventListComponent } from "./components/events/event-list/event-list.component";
import { adminGuard } from "./guards/admin.guard";
import { authGuard } from "./guards/auth.guard";


export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'events', component: EventListComponent, canActivate: [authGuard] },
  { path: 'events/calendar', component: EventCalendarComponent, canActivate: [authGuard] },
  { path: 'events/new', component: EventFormComponent, canActivate: [adminGuard] },
  { path: 'events/:id', component: EventDetailComponent, canActivate: [authGuard] },
  { path: 'events/:id/edit', component: EventFormComponent, canActivate: [adminGuard] },
];
