import { Component, Input, OnInit } from '@angular/core';
import { Suit } from '../suit';
import { FetcherService } from '../services/fetcher.service';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SuitGen } from '../dox/suit-gen';

@Component({
  selector: 'app-verification',
  standalone: true,
  imports: [RouterLink,CommonModule,FormsModule],
  templateUrl: './verification.component.html',
  styleUrl: './verification.component.css'
})
export class VerificationComponent implements OnInit{
  @Input()
  id!: number;
  suit: Suit|undefined;
  items: any;
  constructor(private fetcher:FetcherService){
  }
  ngOnInit(): void {
    this.fetcher.fetchsuitbyid(this.id).forEach((val)=>{this.suit=val})
    this.items={notice:false,ver_aff:false,summons:false,add_aff:false,suit:false}
  }
  generate(a: any){
    const gen=new SuitGen(this.suit)
    if (this.items.notice==true){
      gen.notice()
      
    }
    gen.save(a)
  }

}
