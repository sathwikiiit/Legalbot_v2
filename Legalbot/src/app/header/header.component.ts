import { Component } from '@angular/core';
import { FetcherService } from '../services/fetcher.service';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  constructor(protected fetcher: FetcherService) {}
}
