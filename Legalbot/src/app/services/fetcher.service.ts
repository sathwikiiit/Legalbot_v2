import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import {
  AiStepRequest,
  BuildDocumentRequest,
  ChatRequest,
  DocumentTemplateDto,
  GenerateRequest,
  InitializeDocumentRequest,
  InitializeDocumentResponse,
  SectionPreviewRequest,
  SectionPreviewResponse,
  SectionUpdateRequest,
  SuitDto,
  TaskResultDto,
  RenderContextDto
} from '../suit';

@Injectable({
  providedIn: 'root'
})
export class FetcherService {
  api_url: string;
  user: string = 'Advocate';
  private change = new BehaviorSubject<boolean>(false);
  change$ = this.change.asObservable();

  constructor(private client: HttpClient) {
    let baseUrl = (window as any)['API_URL'] || 'http://localhost:9090';
    if (!baseUrl.endsWith('/')) {
      baseUrl += '/';
    }
    this.api_url = baseUrl;
  }

  public setuser(user: string) {
    this.user = user;
  }

  public postsuit(suit: any): Observable<any> {
    return this.client.post(this.api_url + "insert", suit);
  }

  auth(): Observable<boolean> {
    return this.client.get<boolean>(this.api_url + "auth");
  }

  public fetchsuits(): Observable<SuitDto[]> {
    return this.client.get<SuitDto[]>(this.api_url + "suits");
  }
  
  public fetchsuitsbyuser(advocateName: string): Observable<SuitDto[]> {
    return this.client.get<SuitDto[]>(this.api_url + "user?lawyer=" + encodeURIComponent(advocateName));
  }
  
  public fetchsuitbyid(id: number): Observable<SuitDto> {
    return this.client.get<SuitDto>(this.api_url + "suitById?id=" + id);
  }

  public fetchsuitbyplaintiff(plaintiff: string): Observable<SuitDto> {
    return this.client.get<SuitDto>(this.api_url + "suitByPlaintiff?plaintiff=" + encodeURIComponent(plaintiff));
  }

  public createSuit(suit: SuitDto): Observable<boolean> {
    return this.client.post<boolean>(this.api_url + 'insert', suit);
  }

  public saveSuit(suit: SuitDto): Observable<boolean> {
    return this.client.post<boolean>(this.api_url + 'save', suit, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
  }

  public generateDocument(request: GenerateRequest): Observable<Blob> {
    return this.client.post(this.api_url + 'generate', request, {
      responseType: 'blob'
    });
  }

  public deleteSuit(suit: SuitDto): Observable<boolean> {
    return this.client.post<boolean>(this.api_url + 'delete', suit);
  }

  public initializeDocument(request: InitializeDocumentRequest): Observable<InitializeDocumentResponse> {
    return this.client.post<InitializeDocumentResponse>(this.api_url + 'api/documents/initialize', request);
  }

  public previewSection(request: SectionPreviewRequest): Observable<SectionPreviewResponse> {
    return this.client.post<SectionPreviewResponse>(this.api_url + 'api/documents/sections/preview', request);
  }

  public updateSectionContexts(request: SectionUpdateRequest): Observable<RenderContextDto[]> {
    return this.client.put<RenderContextDto[]>(this.api_url + 'api/documents/sections/update', request);
  }

  public aiStep(request: AiStepRequest): Observable<TaskResultDto> {
    return this.client.post<TaskResultDto>(this.api_url + 'api/documents/ai/step', request);
  }

  public aiStepKeyValue(request: AiStepRequest): Observable<TaskResultDto> {
    return this.client.post<TaskResultDto>(this.api_url + 'api/documents/ai/step/keyvalue', request);
  }

  public buildDocument(request: BuildDocumentRequest): Observable<Blob> {
    return this.client.post(this.api_url + 'api/documents/build', request, {
      responseType: 'blob'
    });
  }

  public getTemplates(): Observable<DocumentTemplateDto[]> {
    return this.client.get<DocumentTemplateDto[]>(this.api_url + 'api/documents/templates');
  }

  public getTemplate(templateKey: string): Observable<DocumentTemplateDto> {
    return this.client.get<DocumentTemplateDto>(this.api_url + 'api/documents/templates/' + encodeURIComponent(templateKey));
  }

  public getDraft(draftId: string): Observable<Record<string, RenderContextDto[]>> {
    return this.client.get<Record<string, RenderContextDto[]>>(this.api_url + 'api/documents/drafts/' + encodeURIComponent(draftId));
  }

  public chat(request: ChatRequest): Observable<string> {
    return this.client.post(this.api_url + 'api/ai/chat', request, { responseType: 'text' });
  }
  
  getchange() {
    return this.change.getValue();
  }
  
  changed() {
    this.change.next(!this.change.getValue());
  }

  submitSuit(suit: SuitDto): Observable<boolean> {
    return this.saveSuit(suit);
  }
}
