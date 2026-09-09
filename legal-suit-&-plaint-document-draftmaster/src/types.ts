export interface PartyDto {
  id: number;
  name: string;
  relation: string;
  gender: string;
  age: number;
  occupation: string;
  address: string;
  partyType: 'PLAINTIFF' | 'DEFENDANT' | 'WITNESS';
  guardianIndex?: number;
}

export interface PropertyDto {
  id: number;
  type: string;
  mkvalue: string;
  extent: string;
  syn: string;
  hn: string;
  plotNo: string;
}

export interface SuitDto {
  id: number;
  court: string;
  city: string;
  lawyer: string;
  plaintiffs: PartyDto[];
  defendants: PartyDto[];
  property: PropertyDto[];
  date: string;
  suitType: string;
  relief: string;
  facts?: string[];
  reliefs?: string[];
  affiantIndex: string;
}

export interface RenderContextDto {
  sectionKey: string;
  definitionKey: string;
  context: string;
  value: string;
  order: number;
  sourceType: 'RULE_BASED' | 'AI_ASSISTED' | 'MANUAL_ENTRY' | string;
  editable: boolean;
}

export interface SectionDefinitionDto {
  sectionKey: string;
  title: string;
  sourceType: 'RULE_BASED' | 'AI_GENERATED' | 'HYBRID' | string;
  editable: boolean;
  taskKey: string;
  sequence: number;
  interactive?: boolean;
}

export interface DocumentTemplateDto {
  templateKey: string;
  displayName: string;
  sections: SectionDefinitionDto[];
}

export interface TaskResultDto {
  status: 'NEEDS_INFO' | 'COMPLETE';
  question?: string;
  renderContexts: RenderContextDto[];
}

export interface SectionUpdateRequest {
  draftId: string;
  sectionKey: string;
  renderContexts: RenderContextDto[];
}

export interface GenerateRequest {
  suitDto: SuitDto;
  documents: string[];
}

export interface SectionPreviewRequest {
  draftId: string;
  documentType: string;
  sectionKey: string;
  suitDto: SuitDto;
  conversationHistory?: string;
}

export interface SectionPreviewResponse {
  taskResult: TaskResultDto;
  renderContexts: RenderContextDto[];
}

export interface InitializeDocumentRequest {
  documentType: string;
  suitDto: SuitDto;
  draftId?: string;
}

export interface InitializeDocumentResponse {
  draftId: string;
  template: DocumentTemplateDto;
  initialSectionContexts: Record<string, RenderContextDto[]>;
}

export interface BuildDocumentRequest {
  draftId: string;
  sectionKey?: string;
  renderContexts?: RenderContextDto[];
}

export interface AiStepRequest {
  draftId: string;
  documentType: string;
  sectionKey: string;
  taskKey: string;
  conversationHistory?: string;
  suitDto: SuitDto;
}

export interface ChatRequest {
  prompt: string;
}
