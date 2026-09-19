import { Component, inject } from '@angular/core';

import { SnackbarService } from '../../services/snackbar/snackbar.service';

@Component({
  selector: 'app-snackbar',
  styleUrl: './snackbar.scss',
  templateUrl: './snackbar.html',
})
export class Snackbar {
  private readonly snackbar = inject(SnackbarService);

  protected readonly message = this.snackbar.message;

  protected dismiss(): void {
    this.snackbar.dismiss();
  }
}
