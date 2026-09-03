import { Component, Input, OnInit } from '@angular/core';
import { SuitDto, GenerateRequest } from '../suit';
import { FetcherService } from '../services/fetcher.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-verification',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule],
  templateUrl: './verification.component.html',
  styleUrl: './verification.component.css'
})
export class VerificationComponent implements OnInit {
  @Input() id!: number;
  suit: SuitDto | undefined;
  items = {
    notice: true,
    ver_aff: true,
    summons: false,
    add_aff: false
  };
  isGenerating: boolean = false;

  constructor(
    private fetcher: FetcherService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Read route param id if @Input id is not provided
    const routeId = this.route.snapshot.paramMap.get('id');
    const targetId = this.id || (routeId ? Number(routeId) : null);

    if (targetId) {
      this.fetcher.fetchsuitbyid(targetId).subscribe({
        next: (val: SuitDto) => {
          this.suit = val;
        },
        error: (err) => console.error('Error fetching suit details', err)
      });
    }
  }

  generate() {
    if (!this.suit) return;
    this.isGenerating = true;

    const required_docs: string[] = [];
    if (this.items.notice) required_docs.push('Notice');
    if (this.items.summons) required_docs.push('Summons');
    if (this.items.ver_aff) required_docs.push('Verification Affidavit');
    if (this.items.add_aff) required_docs.push('Address Affidavit');

    const payload: GenerateRequest = {
      suitDto: this.suit,
      documents: required_docs
    };

    this.fetcher.generateDocument(payload).subscribe({
      next: (blob: Blob) => {
        this.isGenerating = false;
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Legalbot_Suit_${this.suit?.id || 'Doc'}.docx`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('Error generating document', err);
        this.isGenerating = false;
        alert('Document generation failed.');
      }
    });
  }

  openStudio() {
    if (this.suit?.id) {
      this.router.navigate(['/document-draft'], { queryParams: { suitId: this.suit.id } });
    } else {
      this.router.navigate(['/document-draft']);
    }
  }
}
