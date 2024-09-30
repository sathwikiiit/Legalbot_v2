import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FetcherService } from '../services/fetcher.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'header',
  standalone: true,
  imports: [CommonModule,RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {
  @Input() disabled: Boolean=false;
  suits!: any;
  constructor(protected fetcher:FetcherService){
  }
  ngOnInit(): void {
    this.suits = this.fetcher.fetchsuitsbyuser(this.fetcher.user);
  }
}
