import { DOCUMENT } from '@angular/common';
import { Injectable, effect, inject, signal } from '@angular/core';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);

  private readonly _theme = signal<Theme>(this.initialTheme());

  public readonly theme = this._theme.asReadonly();

  constructor() {
    effect(() => {
      const theme = this._theme();
      this.document.documentElement.dataset['theme'] = theme;
      localStorage.setItem(STORAGE_KEY, theme);
    });
  }

  public toggle(): void {
    this._theme.update((theme) => (theme === 'dark' ? 'light' : 'dark'));
  }

  private initialTheme(): Theme {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }
    const prefersDark = this.document.defaultView?.matchMedia?.('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
  }
}
