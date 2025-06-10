import { Form, FormArray, FormControl, FormGroup, Validators } from "@angular/forms";

export class Suit {
    lawyer!: string;
    plaintiffs: Party[] = [];
    defendants: Party[] = [];
    court: string = '';
    city: string = '';
    counselDetails: string = '';
    property: property[] = [];
    suitType: string = '';
    date: any | undefined;
id: any|string;
    json() {
        return JSON.stringify(this)
    }
    getPlaintiff1(): String | undefined {
        return this.plaintiffs.length > 0 ? this.plaintiffs[0].name : undefined;
    }
    getDefendant1(): String | undefined {
        return this.defendants.length > 0 ? this.defendants[0].name : undefined;
    }
    static createForm(
        plaintiffs: FormGroup[] = [],
        defendants: FormGroup[] = [],
        property: FormGroup[] = []
    ): FormGroup {
        return new FormGroup({
            user: new FormControl(''),
            plaintiffs: new FormArray(plaintiffs, Validators.required),
            defendants: new FormArray(defendants, Validators.required),
            court: new FormControl('', Validators.required),
            city: new FormControl('', Validators.required),
            counselDetails: new FormControl(''),
            property: new FormArray(property, Validators.required),
            suitType: new FormControl('', Validators.required),
            date: new FormControl(new Date(), Validators.required)
        });
    }
}

export class Party {
    name: string = "";
    relation: string = "";
    age?: string;
    gender?: string;
    occupation?: string;
    address: string = "";
    partyType?: string;
    guardianIndex?: number;
    formarray: FormArray<FormGroup<PartyFormControls>> | undefined;
    constructor(name: string, relation: string, address: string, age?: string, occupation?: string, relationType?: string, guardianIndex?: number) {
        this.name = name;
        this.relation = relation;
        this.age = age;
        this.occupation = occupation;
        this.address = address;
        this.partyType = relationType;
        this.guardianIndex = guardianIndex;
        this.formarray = new FormArray([
            new FormGroup<PartyFormControls>({
                name: new FormControl(name),
                relation: new FormControl(relation),
                address: new FormControl(address),
                age: new FormControl(age ?? null),
                occupation: new FormControl(occupation ?? null),
                partyType: new FormControl(relationType ?? null),
                guardianIndex: new FormControl(guardianIndex ?? null),
                gender: new FormControl(null)
            })
        ]);
    }
    toString(): string {
        return `${this.name} ${this.relation}, Age: ${this.age} years, Occ: ${this.occupation}, R/o ${this.address}`;
    }
    static createForm(party?: Partial<Party>): FormGroup {
        return new FormGroup<PartyFormControls>({
            name: new FormControl(party?.name ?? '', Validators.required),
            relation: new FormControl(party?.relation ?? ''),
            gender: new FormControl(party?.gender ?? ''),
            occupation: new FormControl(party?.occupation ?? null),
            address: new FormControl(party?.address ?? ''),
            age: new FormControl(party?.age ?? null),
            partyType: new FormControl(party?.partyType ?? null),
            guardianIndex: new FormControl(party?.guardianIndex ?? null),
        });
    }
}

export class property {
    type!: string
    mkvalue!: string
    extent!: string
    syn: string | undefined
    hn: string | undefined
    plotNo: string | undefined
    static createForm(prop?: Partial<property>): FormGroup {
        return new FormGroup<PropertyFormControls>({
            type: new FormControl(prop?.type ?? '', Validators.required),
            value: new FormControl((prop as any)?.value ?? ''),
            extent: new FormControl(prop?.extent ?? ''),
            syn: new FormControl(prop?.syn ?? ''),
            hn: new FormControl(prop?.hn ?? ''),
            plotNo: new FormControl(prop?.plotNo ?? ''),
        });
    }
}

export class SuitDto {
    lawyer!: string;
    plaintiffs: PartyDto[] = [];
    defendants: PartyDto[] = [];
    court: string = '';
    city: string = '';
    counselDetails: string = '';
    property: PropertyDto[] = [];
    suitType: string = '';
    date: any | undefined;
    id: any | string;
    // No methods like getPlaintiff1 or getDefendant1
}

export class PartyDto {
    name: string = "";
    relation: string = "";
    age?: number;
    gender?: string;
    occupation?: string;
    address: string = "";
    partyType?: string;
    guardianIndex?: number;
}

export class PropertyDto {
    type!: string;
    mkvalue!: string;
    extent!: string;
    syn: string | undefined;
    hn: string | undefined;
    plotNo: string | undefined;
}

export interface PropertyFormControls {
    type: FormControl<string | null>;
    value: FormControl<string | null>;
    extent: FormControl<string | null>;
    syn: FormControl<string | null>;
    hn: FormControl<string | null>;
    plotNo: FormControl<string | null>;
}
export interface PartyFormControls {
    name: FormControl<string | null>;
    relation: FormControl<string | null>;
    gender: FormControl<string | null>;
    occupation: FormControl<string | null>;
    address: FormControl<string | null>;
    age: FormControl<string | null>;
    partyType: FormControl<string | null>;
    guardianIndex: FormControl<number | null>;
}
export interface SuitFormControls extends FormGroup {
    controls: {
        user: FormControl<string | null>;
        plaintiffs: FormArray<FormGroup<PartyFormControls>>;
        defendants: FormArray<FormGroup<PartyFormControls>>;
        court: FormControl<string | null>;
        city: FormControl<string | null>;
        counselDetails: FormControl<string | null>;
        property: FormArray<FormGroup<PropertyFormControls>>;
        suitType: FormControl<string | null>;
        date: FormControl<Date | null>;
    };
    get(path: keyof SuitFormControls["controls"]): any;
    // ...other FormGroup methods if needed...
}

