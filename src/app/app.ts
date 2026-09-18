import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './components/header/header';
import { QuotesService } from './services/quotes/quotes.service';
import { StateService } from './services/state/state.service';

@Component({
  imports: [RouterOutlet, Header],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App implements OnInit {
  private readonly state = inject(StateService);
  private readonly quotes = inject(QuotesService);

  ngOnInit() {
    this.state.load();
    this.quotes.connect();
  }
}
