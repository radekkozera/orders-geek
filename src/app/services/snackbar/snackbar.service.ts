import { Injectable, signal } from '@angular/core';

const DEFAULT_DURATION_MS = 4000;

@Injectable({ providedIn: 'root' })
export class SnackbarService {
  private readonly _message = signal<string | undefined>(undefined);
  private timeoutId: ReturnType<typeof setTimeout> | undefined;

  public readonly message = this._message.asReadonly();

  public show(message: string, durationMs = DEFAULT_DURATION_MS): void {
    clearTimeout(this.timeoutId);
    this._message.set(message);
    this.timeoutId = setTimeout(() => this.dismiss(), durationMs);
  }

  public dismiss(): void {
    clearTimeout(this.timeoutId);
    this._message.set(undefined);
  }
}
