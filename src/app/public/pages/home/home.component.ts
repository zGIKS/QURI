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
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LanguageSwitcherComponent } from '../../../shared/components/language-switcher.component';
import { CartService } from '../../../shared/services/cart.service';
import { MatBadgeModule } from '@angular/material/badge';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

interface NavigationLink {
  name: string;
  nameKey: string;
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
    MatBadgeModule,
    MatSnackBarModule,
    MatTooltipModule,
    RouterModule,
    TranslateModule,
    LanguageSwitcherComponent
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  currentPageTitle = 'Dashboard';

  navigationLinks: NavigationLink[] = [];

  private readonly routeTitleMap = new Map<string, string>([
    ['', 'navigation.dashboard'],
    ['dashboard', 'navigation.dashboard'],
    ['catalog', 'navigation.catalog'],
    ['design-lab', 'navigation.designLab'],
    ['cart', 'navigation.cart']
  ]);

  constructor(
    private authService: AuthenticationService,
    private router: Router,
    private translateService: TranslateService,
    public cartService: CartService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    // Always build navigationLinks fresh
    this.navigationLinks = [
      {
        name: 'Dashboard',
        nameKey: 'navigation.dashboard',
        route: 'dashboard',
        icon: 'dashboard'
      },
      {
        name: 'Catalog',
        nameKey: 'navigation.catalog',
        route: 'catalog',
        icon: 'storefront'
      },
      {
        name: 'Design Lab',
        nameKey: 'navigation.designLab',
        route: 'design-lab',
        icon: 'palette'
      },
      {
        name: 'Cart',
        nameKey: 'navigation.cart',
        route: 'cart',
        icon: 'shopping_cart'
      }
    ];
    const roles = JSON.parse(localStorage.getItem('roles') || '[]');
    if (roles.includes('ROLE_MANUFACTURER')) {
      this.navigationLinks.push({
        name: 'Fulfillments',
        nameKey: 'navigation.fulfillments',
        route: 'fulfillments',
        icon: 'local_shipping'
      });
    }

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

    const titleKey = this.routeTitleMap.get(route) || 'navigation.dashboard';

    // Use synchronous translation to avoid subscription issues
    const translatedTitle = this.translateService.instant(titleKey);
    this.currentPageTitle = translatedTitle || titleKey;
  }

  getCurrentPageTitle(): string {
    return this.currentPageTitle;
  }

  onNavigate(link: NavigationLink) {
    this.router.navigate(['/home', link.route]);
  }

  navigateToSection(section: string) {
    // Always navigate to /home/${section} to stay within the authenticated area
    this.router.navigate(['/home', section]);
  }

  signOut() {
    this.authService.signOut();
    this.router.navigate(['/sign-in']);
  }  viewCart() {
    // Navigate to cart page
    this.router.navigate(['/home/cart']);
  }
}
