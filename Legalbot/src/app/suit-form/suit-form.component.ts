import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
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
    { value: 'HOUSE', label: 'House / Villa / Residential Building' },
    { value: 'APARTMENT', label: 'Flat / Apartment / Condo' },
    { value: 'PLOT', label: 'Open Land / Plot / Site' },
    { value: 'LAND', label: 'Agricultural Land' },
    { value: 'COMMERCIAL', label: 'Commercial Premises / Office / Shop' },
    { value: 'OTHER', label: 'Other Immovable Property' }
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
      plotNo: [''],
      areaValue: [null as number | null],
      areaUnit: [''],
      guntas: [null as number | null],
      flatNo: [''],
      buildingName: [''],
      street: [''],
      locality: [''],
      villageOrTown: [''],
      mandal: [''],
      district: [''],
      state: [''],
      pincode: [''],
      northBoundary: [''],
      southBoundary: [''],
      eastBoundary: [''],
      westBoundary: ['']
    }, { validators: this.propertyValidator }) as FormGroup<PropertyFormControls>;
  }

  private propertyValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const value = control.value as any;
    const missing: string[] = [];
    const required = (field: string, label: string) => {
      if (!String(value?.[field] ?? '').trim()) missing.push(label);
    };

    required('type', 'property type');
    required('villageOrTown', 'village/town');
    required('mandal', 'mandal');
    required('district', 'district');

    if (value?.type === 'LAND' || value?.type === 'PLOT') {
      if (value.areaValue === null || value.areaValue === undefined || value.areaValue === '') missing.push('area');
      required('areaUnit', 'area unit');
      required('northBoundary', 'north boundary');
      required('southBoundary', 'south boundary');
      required('eastBoundary', 'east boundary');
      required('westBoundary', 'west boundary');
    }
    if (value?.type === 'HOUSE' || value?.type === 'COMMERCIAL') {
      required('hn', 'house/door number');
      required('street', 'street');
    }
    if (value?.type === 'APARTMENT') {
      required('flatNo', 'flat number');
      required('buildingName', 'building/apartment name');
      required('street', 'street');
    }
    if (value?.areaValue !== null && value?.areaValue !== undefined && value?.areaValue !== '') {
      required('areaUnit', 'area unit');
    }
    return missing.length ? { propertyRequirements: missing } : null;
  };

  isLandOrPlot(control: AbstractControl): boolean {
    return ['LAND', 'PLOT'].includes(control.get('type')?.value);
  }

  isHouse(control: AbstractControl): boolean {
    return control.get('type')?.value === 'HOUSE';
  }

  isApartment(control: AbstractControl): boolean {
    return control.get('type')?.value === 'APARTMENT';
  }

  isCommercial(control: AbstractControl): boolean {
    return control.get('type')?.value === 'COMMERCIAL';
  }

  isBuilding(control: AbstractControl): boolean {
    return ['HOUSE', 'APARTMENT', 'COMMERCIAL'].includes(control.get('type')?.value);
  }

  private normalizePropertyType(type: string | undefined): string {
    const normalized = (type || '').toUpperCase();
    if (normalized.includes('AGRICULTURAL') || normalized === 'LAND') return 'LAND';
    if (normalized.includes('PLOT') || normalized === 'PLOT') return 'PLOT';
    if (normalized.includes('FLAT') || normalized.includes('APARTMENT')) return 'APARTMENT';
    if (normalized.includes('HOUSE') || normalized.includes('VILLA')) return 'HOUSE';
    if (normalized.includes('COMMERCIAL')) return 'COMMERCIAL';
    return type || '';
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
        group.patchValue({ ...pr, type: this.normalizePropertyType(pr.type) });
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
        plotNo: p.plotNo ?? '',
        areaValue: p.areaValue != null ? Number(p.areaValue) : undefined,
        areaUnit: p.areaUnit ?? '',
        guntas: p.guntas != null ? Number(p.guntas) : undefined,
        flatNo: p.flatNo ?? '',
        buildingName: p.buildingName ?? '',
        street: p.street ?? '',
        locality: p.locality ?? '',
        villageOrTown: p.villageOrTown ?? '',
        mandal: p.mandal ?? '',
        district: p.district ?? '',
        state: p.state ?? '',
        pincode: p.pincode ?? '',
        northBoundary: p.northBoundary ?? '',
        southBoundary: p.southBoundary ?? '',
        eastBoundary: p.eastBoundary ?? '',
        westBoundary: p.westBoundary ?? ''
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
      } else if (this.propertyFormArray.invalid) {
        this.activeTab = 'property';
      }
    }
  }
}