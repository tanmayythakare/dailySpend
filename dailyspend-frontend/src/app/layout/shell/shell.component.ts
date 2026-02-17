import { Component, OnInit, HostListener } from '@angular/core';
import { RouterOutlet, Router, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { filter } from 'rxjs';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.scss']
})
export class ShellComponent implements OnInit {

  isCollapsed = false;
  isMobileOpen = false;
  pageTitle = 'Dashboard';

  private routeTitles: { [key: string]: string } = {
    '/dashboard': 'Dashboard',
    '/transactions': 'Transactions',
    '/transactions/new': 'New Transaction',
    '/people': 'People',
    '/reports': 'Reports',
    '/accounts': 'Accounts'
  };

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Update page title on route change
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.updatePageTitle(event.url);
        this.closeMobileSidebar(); // Close mobile sidebar on navigation
      });

    // Set initial title
    this.updatePageTitle(this.router.url);

    // Check screen size on init
    this.checkScreenSize();
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.checkScreenSize();
  }

  private checkScreenSize() {
    if (window.innerWidth <= 1024) {
      this.isCollapsed = false; // Don't collapse on mobile
      this.isMobileOpen = false; // Close mobile menu
    }
  }

  private updatePageTitle(url: string) {
    // Try exact match first
    if (this.routeTitles[url]) {
      this.pageTitle = this.routeTitles[url];
      return;
    }

    // Try to match base route
    const baseRoute = '/' + url.split('/')[1];
    if (this.routeTitles[baseRoute]) {
      this.pageTitle = this.routeTitles[baseRoute];
      return;
    }

    // Default
    this.pageTitle = 'DailySpend';
  }

  toggleSidebar() {
    if (window.innerWidth <= 1024) {
      // Mobile: toggle sidebar visibility
      this.isMobileOpen = !this.isMobileOpen;
    } else {
      // Desktop: toggle collapse
      this.isCollapsed = !this.isCollapsed;
    }
  }

  closeMobileSidebar() {
    this.isMobileOpen = false;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}