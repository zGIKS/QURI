import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDividerModule } from '@angular/material/divider';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { AuthenticationService } from '../../../iam/services/authentication.service';
import { Subject, takeUntil } from 'rxjs';
import { filter } from 'rxjs/operators';

interface NavigationLink {
  name: string;
  route: string;
  icon: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatGridListModule,
    MatSidenavModule,
    MatListModule,
    MatToolbarModule,
    MatDividerModule,
    RouterModule
  ],
  template: `
    <div class="home-layout">
      <!-- Sidebar -->
      <mat-sidenav-container class="sidenav-container">
        <mat-sidenav #drawer class="sidenav" fixedInViewport="true" mode="side" opened="true">
          <div class="sidebar-header">
            <mat-icon class="brand-icon">science</mat-icon>
            <h2 class="brand-name">QURI</h2>
          </div>

          <mat-divider></mat-divider>

          <mat-nav-list class="nav-list">
            <mat-list-item
              *ngFor="let link of navigationLinks"
              [routerLink]="['/home', link.route]"
              routerLinkActive="active"
              class="nav-item"
              (click)="onNavigate(link)">
              <mat-icon matListItemIcon>{{ link.icon }}</mat-icon>
              <span matListItemTitle>{{ link.name }}</span>
            </mat-list-item>
          </mat-nav-list>

          <mat-divider></mat-divider>

          <!-- Sign Out Button -->
          <div class="sidebar-footer">
            <button mat-stroked-button color="warn" (click)="signOut()" class="sign-out-btn">
              <mat-icon>logout</mat-icon>
              Sign Out
            </button>
          </div>
        </mat-sidenav>

        <!-- Main Content -->
        <mat-sidenav-content class="main-content">
          <mat-toolbar class="toolbar">
            <span>{{ getCurrentPageTitle() }}</span>
            <span class="toolbar-spacer"></span>
            <button mat-icon-button>
              <mat-icon>notifications</mat-icon>
            </button>
            <button mat-icon-button>
              <mat-icon>account_circle</mat-icon>
            </button>
          </mat-toolbar>

          <div class="content-container">
            <router-outlet></router-outlet>
          </div>
        </mat-sidenav-content>
      </mat-sidenav-container>
    </div>
  `,
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  currentPageTitle = 'Dashboard';

  navigationLinks: NavigationLink[] = [
    {
      name: 'Dashboard',
      route: '',
      icon: 'dashboard'
    },
    {
      name: 'Catalog',
      route: 'catalog',
      icon: 'storefront'
    },
    {
      name: 'Design Lab',
      route: 'design-lab',
      icon: 'palette'
    }
  ];

  private readonly routeTitleMap = new Map<string, string>([
    ['', 'Dashboard'],
    ['dashboard', 'Dashboard'],
    ['catalog', 'Product Catalog'],
    ['design-lab', 'Design Lab']
  ]);

  constructor(
    private authService: AuthenticationService,
    private router: Router
  ) {}

  ngOnInit() {
    // Listen to router events to update page title
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe((event: NavigationEnd) => {
        this.updatePageTitle(event.urlAfterRedirects);
      });

    // Set initial title
    this.updatePageTitle(this.router.url);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updatePageTitle(url: string) {
    // Extract the route after /home/
    const routeMatch = url.match(/\/home\/?(.*)/);
    const route = routeMatch ? routeMatch[1] : '';

    this.currentPageTitle = this.routeTitleMap.get(route) || 'Dashboard';
  }

  getCurrentPageTitle(): string {
    return this.currentPageTitle;
  }

  onNavigate(link: NavigationLink) {
    this.router.navigate(['/home', link.route]);
  }

  navigateToSection(section: string) {
    this.router.navigate([`/${section}`]);
  }

  signOut() {
    this.authService.signOut();
    this.router.navigate(['/sign-in']);
  }
}
