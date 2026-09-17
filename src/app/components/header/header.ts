import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  styleUrl: './header.scss',
  templateUrl: './header.html',
})
export class Header {
  private router = inject(Router);

  protected navigateToTable(): void {
    this.router.navigate(['/']);
  }

  protected navigateToOrder(): void {
    this.router.navigate(['new-order']);
  }
}
