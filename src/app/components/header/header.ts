import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

import { ThemeService } from '../../services/theme/theme.service';

@Component({
  selector: 'app-header',
  styleUrl: './header.scss',
  templateUrl: './header.html',
})
export class Header {
  private readonly router = inject(Router);
  private readonly themeService = inject(ThemeService);

  protected readonly theme = this.themeService.theme;

  protected navigateToTable(): void {
    this.router.navigate(['/']);
  }

  protected navigateToOrder(): void {
    this.router.navigate(['new-order']);
  }

  protected toggleTheme(): void {
    this.themeService.toggle();
  }
}
