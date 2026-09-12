import { FormArray, FormControl, FormGroup, Validators } from "@angular/forms";

export class Suit {
    id?: any;
    court: string = "";
    city: string = "";
    lawyer: string = "";
    counselDetails: string = "";
    plaintiffs: Party[] = [];
    defendants: Party[] = [];
    property: property[] = [];
    suitType: string = "";
    relief: string = "";
    affiantIndex: string = "1";
    date: any | undefined;

    json() {
        return JSON.stringify(this);
    }

    getPlaintiff1(): string | undefined {
        return this.plaintiffs.length > 0 ? this.plaintiffs[0].name : undefined;
    }

    getDefendant1(): string | undefined {
        return this.defendants.length > 0 ? this.defendants[0].name : undefined;
    }

    static createForm(
        plaintiffs: FormGroup[] = [],
        defendants: FormGroup[] = [],
        property: FormGroup[] = [],
        advocates: FormGroup[] = []
    ): FormGroup {
        return new FormGroup({
            user: new FormControl(""),
            lawyer: new FormControl(""),
            plaintiffs: new FormArray(plaintiffs, Validators.required),
            defendants: new FormArray(defendants, Validators.required),
            court: new FormControl("", Validators.required),
            city: new FormControl("", Validators.required),
            advocates: new FormArray(advocates),
            relief: new FormControl(""),
            affiantIndex: new FormControl("1"),
            property: new FormArray(property),
            suitType: new FormControl("", Validators.required),
            date: new FormControl(new Date(), Validators.required)
        });
    }
}

export class Party {
    name: string = "";
    relation: string = "";
    age?: string | number;
    gender?: string;
    occupation?: string;
    address: string = "";
    partyType?: string;
    guardianIndex?: number;
    formarray: FormArray<FormGroup<PartyFormControls>> | undefined;

    constructor(name: string = "", relation: string = "", address: string = "", age?: string | number, occupation?: string, relationType?: string, guardianIndex?: number) {
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
                age: new FormControl(age != null ? String(age) : null),
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
            name: new FormControl(party?.name ?? "", Validators.required),
            relation: new FormControl(party?.relation ?? ""),
            gender: new FormControl(party?.gender ?? ""),
            occupation: new FormControl(party?.occupation ?? null),
            address: new FormControl(party?.address ?? ""),
            age: new FormControl(party?.age != null ? String(party.age) : null),
            partyType: new FormControl(party?.partyType ?? null),
            guardianIndex: new FormControl(party?.guardianIndex ?? null),
        });
    }
}

export class property {
    type!: string;
    mkvalue!: string;
    extent!: string;
    syn: string | undefined;
    hn: string | undefined;
    plotNo: string | undefined;
    areaValue: number | undefined;
    areaUnit: string | undefined;
    guntas: number | undefined;
    flatNo: string | undefined;
    buildingName: string | undefined;
    street: string | undefined;
    locality: string | undefined;
    villageOrTown: string | undefined;
    mandal: string | undefined;
    district: string | undefined;
    state: string | undefined;
    pincode: string | undefined;
    northBoundary: string | undefined;
    southBoundary: string | undefined;
    eastBoundary: string | undefined;
    westBoundary: string | undefined;

    static createForm(prop?: Partial<property>): FormGroup {
        return new FormGroup<PropertyFormControls>({
            type: new FormControl(prop?.type ?? "", Validators.required),
            mkvalue: new FormControl((prop as any)?.mkvalue ?? (prop as any)?.value ?? ""),
            extent: new FormControl(prop?.extent ?? ""),
            syn: new FormControl(prop?.syn ?? ""),
            hn: new FormControl(prop?.hn ?? ""),
            plotNo: new FormControl(prop?.plotNo ?? ""),
            areaValue: new FormControl(prop?.areaValue ?? null),
            areaUnit: new FormControl(prop?.areaUnit ?? ""),
            guntas: new FormControl(prop?.guntas ?? null),
            flatNo: new FormControl(prop?.flatNo ?? ""),
            buildingName: new FormControl(prop?.buildingName ?? ""),
            street: new FormControl(prop?.street ?? ""),
            locality: new FormControl(prop?.locality ?? ""),
            villageOrTown: new FormControl(prop?.villageOrTown ?? ""),
            mandal: new FormControl(prop?.mandal ?? ""),
            district: new FormControl(prop?.district ?? ""),
            state: new FormControl(prop?.state ?? ""),
            pincode: new FormControl(prop?.pincode ?? ""),
            northBoundary: new FormControl(prop?.northBoundary ?? ""),
            southBoundary: new FormControl(prop?.southBoundary ?? ""),
            eastBoundary: new FormControl(prop?.eastBoundary ?? ""),
            westBoundary: new FormControl(prop?.westBoundary ?? ""),
        });
    }
}

export class SuitDto {
    id?: number;
    court: string = "";
    city: string = "";
    lawyer: string = "";
    plaintiffs: PartyDto[] = [];
    defendants: PartyDto[] = [];
    property: PropertyDto[] = [];
    date?: string;
    suitType: string = "";
    relief: string = "";
    affiantIndex: string = "1";
    advocates?: AdvocateDto[] = [];
    counselDetails?: string = "";
}

export class AdvocateDto {
    id?: number | string;
    name: string = "";
    barCouncilId?: string;
    email?: string;
    phoneNumber?: string;
    address?: string;
    role?: string;
    context?: string;
}

export class PartyDto {
    id?: number;
    name: string = "";
    relation: string = "";
    gender?: string;
    age?: number;
    occupation?: string;
    address: string = "";
    partyType?: string;
    guardianIndex?: number;
}

export class PropertyDto {
    id?: number;
    type: string = "";
    mkvalue: string = "";
    extent: string = "";
    syn?: string;
    hn?: string;
    plotNo?: string;
    areaValue?: number;
    areaUnit?: string;
    guntas?: number;
    flatNo?: string;
    buildingName?: string;
    street?: string;
    locality?: string;
    villageOrTown?: string;
    mandal?: string;
    district?: string;
    state?: string;
    pincode?: string;
    northBoundary?: string;
    southBoundary?: string;
    eastBoundary?: string;
    westBoundary?: string;
}

export class GenerateRequest {
    suitDto: SuitDto | null = null;
    documents: string[] = [];
}

export class InitializeDocumentRequest {
    documentType: string = "";
    suitDto: SuitDto | null = null;
    draftId?: string;
}

export class InitializeDocumentResponse {
    draftId?: string;
    template: DocumentTemplateDto | null = null;
    initialSectionContexts: { [key: string]: RenderContextDto[] } = {};
}

export class RenderContextDto {
    sectionKey: string = "";
    definitionKey: string = "";
    context: string = "";
    value: string = "";
    order: number = 0;
    sourceType: string = "";
    editable: boolean = false;
}

export class SectionDefinitionDto {
    sectionKey: string = "";
    title: string = "";
    sourceType: string = "";
    editable: boolean = false;
    taskKey?: string;
    sequence: number = 0;
    interactive?: boolean;
}

export class DocumentTemplateDto {
    templateKey: string = "";
    displayName: string = "";
    sections: SectionDefinitionDto[] = [];
}

export class SectionPreviewRequest {
    draftId?: string;
    documentType: string = "";
    sectionKey: string = "";
    suitDto: SuitDto | null = null;
    conversationHistory?: string;
}

export class SectionPreviewResponse {
    taskResult: TaskResultDto | null = null;
    renderContexts: RenderContextDto[] = [];
}

export class SectionUpdateRequest {
    draftId?: string;
    sectionKey: string = "";
    renderContexts: RenderContextDto[] = [];
}

export class AiStepRequest {
    draftId?: string;
    documentType: string = "";
    sectionKey: string = "";
    taskKey?: string;
    conversationHistory?: string;
    suitDto: SuitDto | null = null;
}

export class BuildDocumentRequest {
    draftId?: string;
    sectionKey?: string;
    renderContexts?: RenderContextDto[];
}

export class TaskResultDto {
    status: TaskResultStatus = TaskResultStatus.NEEDS_INFO;
    question?: string;
    renderContexts: RenderContextDto[] = [];
}

export enum TaskResultStatus {
    NEEDS_INFO = "NEEDS_INFO",
    COMPLETE = "COMPLETE"
}

export class ChatRequest {
    prompt: string = "";
}

export interface PropertyFormControls {
    type: FormControl<string | null>;
    mkvalue: FormControl<string | null>;
    extent: FormControl<string | null>;
    syn: FormControl<string | null>;
    hn: FormControl<string | null>;
    plotNo: FormControl<string | null>;
    areaValue: FormControl<number | null>;
    areaUnit: FormControl<string | null>;
    guntas: FormControl<number | null>;
    flatNo: FormControl<string | null>;
    buildingName: FormControl<string | null>;
    street: FormControl<string | null>;
    locality: FormControl<string | null>;
    villageOrTown: FormControl<string | null>;
    mandal: FormControl<string | null>;
    district: FormControl<string | null>;
    state: FormControl<string | null>;
    pincode: FormControl<string | null>;
    northBoundary: FormControl<string | null>;
    southBoundary: FormControl<string | null>;
    eastBoundary: FormControl<string | null>;
    westBoundary: FormControl<string | null>;
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
        lawyer: FormControl<string | null>;
        plaintiffs: FormArray<FormGroup<PartyFormControls>>;
        defendants: FormArray<FormGroup<PartyFormControls>>;
        court: FormControl<string | null>;
        city: FormControl<string | null>;
        advocates: FormArray<FormGroup<AdvocateFormControls>>;
        relief: FormControl<string | null>;
        affiantIndex: FormControl<string | null>;
        property: FormArray<FormGroup<PropertyFormControls>>;
        suitType: FormControl<string | null>;
        date: FormControl<Date | null>;
    };
    get(path: keyof SuitFormControls["controls"]): any;
}

export interface AdvocateFormControls {
    name: FormControl<string | null>;
    role: FormControl<string | null>;
}
