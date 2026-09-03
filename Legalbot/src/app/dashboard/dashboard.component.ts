import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FetcherService } from '../services/fetcher.service';
import { SuitDto } from '../suit';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  suits: SuitDto[] = [];
  searchTerm: string = '';
  lawyerFilter: string = '';
  loading: boolean = false;

  constructor(private fetcher: FetcherService, private router: Router) {}

  ngOnInit(): void {
    this.loadSuits();
  }

  loadSuits() {
    this.loading = true;
    this.fetcher.fetchsuits().subscribe({
      next: (data) => {
        this.suits = data || [];
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching suits', err);
        this.loading = false;
      }
    });
  }

  get filteredSuits(): SuitDto[] {
    return this.suits.filter(s => {
      const term = this.searchTerm.toLowerCase();
      const lawyer = this.lawyerFilter.toLowerCase();

      const matchesSearch = !term ||
        (s.court && s.court.toLowerCase().includes(term)) ||
        (s.city && s.city.toLowerCase().includes(term)) ||
        (s.suitType && s.suitType.toLowerCase().includes(term)) ||
        (s.plaintiffs && s.plaintiffs.some(p => p.name && p.name.toLowerCase().includes(term))) ||
        (s.defendants && s.defendants.some(d => d.name && d.name.toLowerCase().includes(term)));

      const matchesLawyer = !lawyer ||
        (s.lawyer && s.lawyer.toLowerCase().includes(lawyer));

      return matchesSearch && matchesLawyer;
    });
  }

  getPlaintiffName(suit: SuitDto): string {
    if (suit.plaintiffs && suit.plaintiffs.length > 0) {
      const p = suit.plaintiffs.find(item => !item.partyType || item.partyType.toUpperCase() === 'PLAINTIFF');
      if (p && p.name) return p.name;
      if (suit.plaintiffs[0].name) return suit.plaintiffs[0].name;
    }
    return 'Plaintiff';
  }

  getDefendantName(suit: SuitDto): string {
    if (suit.defendants && suit.defendants.length > 0) {
      const d = suit.defendants.find(item => item.partyType && item.partyType.toUpperCase() === 'DEFENDANT');
      if (d && d.name) return d.name;
      if (suit.defendants[0].name) return suit.defendants[0].name;
    }
    return 'Defendant';
  }

  getSuitBadgeClass(suitType?: string): string {
    switch (suitType) {
      case 'PLAINT_RECOVERY': return 'badge-emerald';
      case 'PLAINT_INJUNCTION': return 'badge-blue';
      case 'PLAINT_SPECIFIC_PERFORMANCE': return 'badge-purple';
      default: return 'badge-gold';
    }
  }

  startDraftStudio(suit: SuitDto) {
    this.router.navigate(['/document-draft'], { queryParams: { suitId: suit.id } });
  }

  deleteSuit(suit: SuitDto, event: Event) {
    event.stopPropagation();
    if (confirm(`Are you sure you want to delete suit: ${this.getPlaintiffName(suit)} vs ${this.getDefendantName(suit)}?`)) {
      this.fetcher.deleteSuit(suit).subscribe({
        next: () => {
          this.loadSuits();
        },
        error: (err) => console.error('Error deleting suit', err)
      });
    }
  }
}
