import { Component, Input, OnInit } from '@angular/core';
import { Suit, SuitDto } from '../suit';
import { FetcherService } from '../services/fetcher.service';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
    selector: 'app-verification',
    imports: [RouterLink, CommonModule, FormsModule],
    templateUrl: './verification.component.html',
    styleUrl: './verification.component.css'
})
export class VerificationComponent implements OnInit{
  @Input()
  id!: number;
  suit: SuitDto|undefined;
  items: any;
  constructor(private fetcher:FetcherService, private http: HttpClient){}
  ngOnInit(): void {
    this.fetcher.fetchsuitbyid(this.id).subscribe((val: SuitDto)=>{this.suit=val})
    this.items={notice:false,ver_aff:false,summons:false,add_aff:false,suit:false}
  }
  generate() {
    if (!this.suit) return;
    // Collect selected docs
    const required_docs: string[] = [];
    if (this.items.notice) required_docs.push('Notice');
    if (this.items.summons) required_docs.push('Summons');
    if (this.items.ver_aff) required_docs.push('Verification Affidavit');
    if (this.items.add_aff) required_docs.push('Address Affidavit');
    // POST to backend /generate and trigger download
    const payload = {
      suitDto: this.suit,
      documents: required_docs
    };
    this.http.post(
      '/generate',
      payload,
      { responseType: 'blob' }
    ).subscribe((blob: Blob) => {
      // Use browser download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Legalbot_Document.docx';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    });
  }
  getPlaintiffs() {
    return this.suit?.plaintiffs || [];
  }

  getDefendants() {
    return this.suit?.defendants || [];
  }

}
