import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FetcherService } from '../services/fetcher.service';
import { Suit } from '../suit';

@Component({
    selector: 'app-dashboard',
    imports: [RouterLink, CommonModule],
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit{
  sym: string='\u{2B9E}';
  disabled:boolean=true;
  suits!: Suit[];
  constructor(private fetcher:FetcherService){
    this.fetcher.change$.subscribe({
      next: (val)=>{
          this.fetcher.fetchsuits().forEach((val)=>{this.suits=val;});
        }
    })

  }
  ngOnInit(): void {
    this.fetcher.changed()
  }
  clicked(){
    this.sym = this.sym=='\u{2B9E}'? '\u{2B9D}':'\u{2B9E}';
    this.disabled=!this.disabled
  }
}
