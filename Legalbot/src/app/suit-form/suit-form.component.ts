import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FetcherService } from '../services/fetcher.service';
import { DocumentTemplateDto, PropertyFormControls, Suit, SuitFormControls, SuitDto } from '../suit';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-suit-form',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule, RouterLink],
  templateUrl: './suit-form.component.html',
  styleUrl: './suit-form.component.css'
})
export class SuitFormComponent implements OnInit {
  @Input() id!: number | undefined;
  activeTab: 'basic' | 'plaintiffs' | 'defendants' | 'property' = 'basic';
  suitDto: SuitDto = new SuitDto();
  templates: DocumentTemplateDto[] = [];
  formdata: SuitFormControls;
  submitted: boolean = false;

  propertyTypes = [
    'House / Villa / Residential Building',
    'Flat / Apartment / Condo',
    'Open Land / Plot / Site',
    'Agricultural Land',
    'Commercial Premises / Office / Shop',
    'Industrial Shed / Factory Premises',
    'Other Immovable Property'
  ];

  constructor(
    private fetcher: FetcherService,
    private router: Router,
    private fb: FormBuilder,
    private route: ActivatedRoute
  ) {
    this.formdata = Suit.createForm(
      [this.createPartyGroup('PLAINTIFF')],
      [this.createPartyGroup('DEFENDANT')],
      [], // Property is optional, default to 0 initial property items
      [this.createAdvocateGroup()]
    ) as unknown as SuitFormControls;

    this.formdata.get('user')?.setValue(this.fetcher.user || 'Advocate');
    this.formdata.get('lawyer')?.setValue(this.fetcher.user || 'Advocate');
    this.formdata.get('date')?.setValue(new Date());
  }

  ngOnInit(): void {
    this.fetcher.getTemplates().subscribe({
      next: (templates) => this.templates = templates || [],
      error: (error) => console.error('Failed to load suit types', error)
    });

    const routeId = this.route.snapshot.paramMap.get('id');
    const targetId = this.id || (routeId ? Number(routeId) : null);
    if (targetId) {
      this.fetcher.fetchsuitbyid(targetId).subscribe((suit: SuitDto) => {
        if (suit) {
          this.suitDto = suit;
          this.populateForm(suit);
        }
      });
    }
  }

  createAdvocateGroup(): FormGroup {
    return this.fb.group({
      name: [this.fetcher.user || 'Advocate', Validators.required],
      role: ['Counsel']
    });
  }

  createPropertyFormGroup(): FormGroup<PropertyFormControls> {
    return this.fb.group({
      type: [''], // Optional
      mkvalue: [''],
      extent: [''],
      syn: [''],
      hn: [''],
      plotNo: ['']
    });
  }

  createPartyGroup(partyType: string = 'PLAINTIFF'): FormGroup {
    return this.fb.group({
      name: ['', Validators.required],
      entityType: ['INDIVIDUAL'], // 'INDIVIDUAL' or 'ORGANIZATION'
      address: [''],
      age: [''],
      gender: ['Male'],
      occupation: [''],
      relation: [''],
      partyType: [partyType],
      guardianIndex: [null]
    });
  }

  get propertyFormArray(): FormArray<FormGroup<PropertyFormControls>> {
    return this.formdata.get("property") as FormArray<FormGroup<PropertyFormControls>>;
  }

  get plaintiffs(): FormArray {
    return this.formdata.get("plaintiffs") as FormArray;
  }

  get defendants(): FormArray {
    return this.formdata.get("defendants") as FormArray;
  }

  addProperty() {
    this.propertyFormArray.push(this.createPropertyFormGroup());
  }

  removeProperty(index: number) {
    this.propertyFormArray.removeAt(index);
  }

  addPlaintiff() {
    this.plaintiffs.push(this.createPartyGroup('PLAINTIFF'));
  }

  removePlaintiff(index: number) {
    if (this.plaintiffs.length > 1) {
      this.plaintiffs.removeAt(index);
    }
  }

  addDefendant() {
    this.defendants.push(this.createPartyGroup('DEFENDANT'));
  }

  removeDefendant(index: number) {
    if (this.defendants.length > 1) {
      this.defendants.removeAt(index);
    }
  }

  // --- Step Navigation & Validation Helpers ---

  isBasicTabValid(): boolean {
    const court = this.formdata.get('court');
    const city = this.formdata.get('city');
    const suitType = this.formdata.get('suitType');
    return !!(court?.valid && city?.valid && suitType?.valid);
  }

  isPlaintiffsTabValid(): boolean {
    return this.plaintiffs.length > 0 && this.plaintiffs.valid;
  }

  isDefendantsTabValid(): boolean {
    return this.defendants.length > 0 && this.defendants.valid;
  }

  nextTab() {
    if (this.activeTab === 'basic') {
      if (!this.isBasicTabValid()) {
        this.formdata.get('court')?.markAsTouched();
        this.formdata.get('city')?.markAsTouched();
        this.formdata.get('suitType')?.markAsTouched();
        return;
      }
      this.activeTab = 'plaintiffs';
    } else if (this.activeTab === 'plaintiffs') {
      if (!this.isPlaintiffsTabValid()) {
        this.plaintiffs.markAllAsTouched();
        return;
      }
      this.activeTab = 'defendants';
    } else if (this.activeTab === 'defendants') {
      if (!this.isDefendantsTabValid()) {
        this.defendants.markAllAsTouched();
        return;
      }
      this.activeTab = 'property';
    }
  }

  prevTab() {
    if (this.activeTab === 'property') {
      this.activeTab = 'defendants';
    } else if (this.activeTab === 'defendants') {
      this.activeTab = 'plaintiffs';
    } else if (this.activeTab === 'plaintiffs') {
      this.activeTab = 'basic';
    }
  }

  goToTab(tab: 'basic' | 'plaintiffs' | 'defendants' | 'property') {
    this.activeTab = tab;
  }

  private populateForm(suit: SuitDto) {
    this.formdata.patchValue({
      court: suit.court || '',
      city: suit.city || '',
      lawyer: suit.lawyer || this.fetcher.user || '',
      suitType: suit.suitType || '',
      relief: suit.relief || '',
      affiantIndex: suit.affiantIndex || '1'
    });

    if (suit.plaintiffs && suit.plaintiffs.length > 0) {
      this.plaintiffs.clear();
      const pfs = suit.plaintiffs.filter(p => !p.partyType || p.partyType.toUpperCase() === 'PLAINTIFF');
      if (pfs.length > 0) {
        pfs.forEach(p => {
          const group = this.createPartyGroup('PLAINTIFF');
          group.patchValue(p);
          this.plaintiffs.push(group);
        });
      } else {
        this.plaintiffs.push(this.createPartyGroup('PLAINTIFF'));
      }
    }

    if (suit.defendants && suit.defendants.length > 0) {
      this.defendants.clear();
      const dfs = suit.defendants.filter(d => d.partyType && d.partyType.toUpperCase() === 'DEFENDANT');
      if (dfs.length > 0) {
        dfs.forEach(d => {
          const group = this.createPartyGroup('DEFENDANT');
          group.patchValue(d);
          this.defendants.push(group);
        });
      } else {
        this.defendants.push(this.createPartyGroup('DEFENDANT'));
      }
    }

    if (suit.property && suit.property.length > 0) {
      this.propertyFormArray.clear();
      suit.property.forEach(pr => {
        const group = this.createPropertyFormGroup();
        group.patchValue(pr);
        this.propertyFormArray.push(group);
      });
    }
  }

  private buildSuitDtoFromForm(): SuitDto {
    const rawValue = this.formdata.getRawValue() as any;
    const lawyerName = rawValue.lawyer || this.fetcher.user || 'Advocate';

    return {
      id: this.suitDto?.id,
      court: rawValue.court ?? '',
      city: rawValue.city ?? '',
      lawyer: lawyerName,
      plaintiffs: (rawValue.plaintiffs ?? []).map((p: any) => ({
        name: p.name ?? '',
        relation: p.relation ?? '',
        gender: p.gender ?? '',
        age: p.age ? Number(p.age) : undefined,
        occupation: p.occupation ?? '',
        address: p.address ?? '',
        partyType: p.partyType ?? 'PLAINTIFF',
        guardianIndex: p.guardianIndex ?? 0
      })),
      defendants: (rawValue.defendants ?? []).map((d: any) => ({
        name: d.name ?? '',
        relation: d.relation ?? '',
        gender: d.gender ?? '',
        age: d.age ? Number(d.age) : undefined,
        occupation: d.occupation ?? '',
        address: d.address ?? '',
        partyType: d.partyType ?? 'DEFENDANT',
        guardianIndex: d.guardianIndex ?? 0
      })),
      property: (rawValue.property ?? []).map((p: any) => ({
        type: p.type ?? '',
        mkvalue: p.mkvalue ?? '',
        extent: p.extent ?? '',
        syn: p.syn ?? '',
        hn: p.hn ?? '',
        plotNo: p.plotNo ?? ''
      })),
      date: new Date().toISOString(),
      suitType: rawValue.suitType ?? '',
      relief: rawValue.relief ?? '',
      affiantIndex: rawValue.affiantIndex ?? '1'
    };
  }

  submited() {
    this.submitted = true;
    if (this.formdata.valid) {
      const dto = this.buildSuitDtoFromForm();
      this.fetcher.saveSuit(dto).subscribe({
        next: () => {
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          console.error('Save suit failed', err);
          alert('Submission failed. Please verify required fields.');
        }
      });
    } else {
      this.formdata.markAllAsTouched();
      // Jump to first invalid tab
      if (!this.isBasicTabValid()) {
        this.activeTab = 'basic';
      } else if (!this.isPlaintiffsTabValid()) {
        this.activeTab = 'plaintiffs';
      } else if (!this.isDefendantsTabValid()) {
        this.activeTab = 'defendants';
      }
    }
  }
}