import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FetcherService } from '../services/fetcher.service';
import {
  DocumentTemplateDto,
  InitializeDocumentRequest,
  InitializeDocumentResponse,
  SectionDefinitionDto,
  SectionPreviewRequest,
  SectionPreviewResponse,
  AiStepRequest,
  BuildDocumentRequest,
  SectionUpdateRequest,
  RenderContextDto,
  TaskResultDto,
  SuitDto
} from '../suit';

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  isQuestion?: boolean;
  timestamp: string;
}

@Component({
  selector: 'app-document-draft',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './document-draft.component.html',
  styleUrl: './document-draft.component.css'
})
export class DocumentDraftComponent implements OnInit {
  templates: DocumentTemplateDto[] = [];
  selectedTemplateKey: string = 'PLAINT_RECOVERY';
  suits: SuitDto[] = [];
  selectedSuitId: number | null = null;
  currentSuit: SuitDto | null = null;

  draftId: string | null = null;
  template: DocumentTemplateDto | null = null;
  draftContexts: Record<string, RenderContextDto[]> = {};

  activeSectionKey: string = '';
  activeMode: 'chat' | 'edit' = 'chat';

  // AI Chat state per section
  chatHistories: Record<string, ChatMessage[]> = {};
  userPrompt: string = '';
  isLoadingAi: boolean = false;
  isBuildingDoc: boolean = false;
  isInitializing: boolean = false;

  generalChatPrompt: string = '';
  generalChatResponse: string = '';

  constructor(
    private fetcher: FetcherService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadTemplates();
    this.loadSuits();

    this.route.queryParams.subscribe(params => {
      if (params['suitId']) {
        this.selectedSuitId = Number(params['suitId']);
        this.fetcher.fetchsuitbyid(this.selectedSuitId).subscribe(s => {
          this.currentSuit = s;
          this.selectedTemplateKey = s.suitType || 'PLAINT_RECOVERY';
          // Auto initialize draft once suit is loaded
          this.initializeDraft();
        });
      }
    });
  }

  loadTemplates() {
    this.fetcher.getTemplates().subscribe({
      next: (res) => {
        this.templates = res || [];
        if (this.templates.length > 0 && !this.selectedTemplateKey) {
          this.selectedTemplateKey = this.templates[0].templateKey;
        }
        // If not already initialized, auto initialize first template
        if (!this.draftId) {
          this.initializeDraft();
        }
      },
      error: (err) => console.error('Failed to load templates', err)
    });
  }

  loadSuits() {
    this.fetcher.fetchsuits().subscribe({
      next: (res) => {
        this.suits = res || [];
        if (this.selectedSuitId && !this.currentSuit) {
          this.currentSuit = this.suits.find(s => s.id === this.selectedSuitId) || null;
          this.selectedTemplateKey = this.currentSuit?.suitType || 'PLAINT_RECOVERY';
        }
      }
    });
  }

  onSuitSelect() {
    if (this.selectedSuitId) {
      this.currentSuit = this.suits.find(s => s.id === Number(this.selectedSuitId)) || null;
      this.selectedTemplateKey = this.currentSuit?.suitType || 'PLAINT_RECOVERY';
    } else {
      this.currentSuit = null;
    }
    // Re-initialize draft with new suit context
    this.initializeDraft();
  }

  initializeDraft() {
    if (!this.selectedTemplateKey) return;
    this.isInitializing = true;

    const req = new InitializeDocumentRequest();
    req.documentType = this.selectedTemplateKey;
    req.suitDto = this.currentSuit;

    this.fetcher.initializeDocument(req).subscribe({
      next: (res: InitializeDocumentResponse) => {
        this.draftId = res.draftId || `draft_${Date.now()}`;
        this.template = res.template;
        this.draftContexts = res.initialSectionContexts || {};
        this.isInitializing = false;

        if (this.template && this.template.sections && this.template.sections.length > 0) {
          this.activeSectionKey = this.template.sections[0].sectionKey;
          this.initSectionChat(this.template.sections[0]);
          // Fetch preview for all sections so the full document renders section-by-section
          this.loadAllSectionPreviews();
        }
      },
      error: (err) => {
        console.error('Error initializing document draft', err);
        this.isInitializing = false;
      }
    });
  }

  loadAllSectionPreviews() {
    if (!this.draftId || !this.template?.sections) return;

    this.template.sections.forEach(sec => {
      const secKey = sec.sectionKey;
      // Skip if section already has rendering context
      if (!this.draftContexts[secKey] || this.draftContexts[secKey].length === 0) {
        const req = new SectionPreviewRequest();
        req.draftId = this.draftId!;
        req.documentType = this.selectedTemplateKey;
        req.sectionKey = secKey;
        req.suitDto = this.currentSuit;

        this.fetcher.previewSection(req).subscribe({
          next: (res: SectionPreviewResponse) => {
            if (res.renderContexts && res.renderContexts.length > 0) {
              this.draftContexts[secKey] = res.renderContexts;
            }
          },
          error: (err) => console.error(`Error fetching preview for section ${secKey}`, err)
        });
      }
    });
  }

  get sections(): SectionDefinitionDto[] {
    return this.template?.sections || [];
  }

  get activeSection(): SectionDefinitionDto | null {
    return this.sections.find(s => s.sectionKey === this.activeSectionKey) || (this.sections.length > 0 ? this.sections[0] : null);
  }

  get activeIndex(): number {
    return this.sections.findIndex(s => s.sectionKey === this.activeSectionKey);
  }

  get activeContexts(): RenderContextDto[] {
    if (!this.activeSectionKey) return [];
    return this.draftContexts[this.activeSectionKey] || [];
  }

  get activeSectionContent(): string {
    const contexts = this.activeContexts;
    if (contexts.length === 0) return '';
    return contexts.map(c => c.value || c.context || '').filter(Boolean).join('\n\n');
  }

  selectSection(secKey: string) {
    this.activeSectionKey = secKey;
    const sec = this.sections.find(s => s.sectionKey === secKey);
    if (sec) {
      this.initSectionChat(sec);
      // Automatically preview section if empty
      if (!this.draftContexts[secKey] || this.draftContexts[secKey].length === 0) {
        this.previewCurrentSection();
      }
    }
  }

  initSectionChat(sec: SectionDefinitionDto) {
    const secKey = sec.sectionKey;
    if (!this.chatHistories[secKey] || this.chatHistories[secKey].length === 0) {
      const isAi = sec.sourceType === 'AI' || sec.sourceType === 'AI_GENERATED' || sec.interactive;
      const initialText = isAi
        ? `Counsel, I am ready to draft the "${sec.title}" section using AI. Please type any specific facts, monetary amounts, or terms you want included.`
        : `This section "${sec.title}" is populated based on predefined rules and suit metadata. You can edit the parameters directly in the Editor tab.`;

      this.chatHistories[secKey] = [
        {
          id: `init_${Date.now()}`,
          sender: 'ai',
          text: initialText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ];
    }
  }

  get activeChatHistory(): ChatMessage[] {
    return this.chatHistories[this.activeSectionKey] || [];
  }

  previewCurrentSection() {
    if (!this.draftId || !this.activeSectionKey) return;
    const req = new SectionPreviewRequest();
    req.draftId = this.draftId;
    req.documentType = this.selectedTemplateKey;
    req.sectionKey = this.activeSectionKey;
    req.suitDto = this.currentSuit;

    this.fetcher.previewSection(req).subscribe({
      next: (res: SectionPreviewResponse) => {
        if (res.renderContexts && res.renderContexts.length > 0) {
          this.draftContexts = {
            ...this.draftContexts,
            [this.activeSectionKey]: res.renderContexts
          };
        }
      }
    });
  }

  sendAiStep() {
    if (!this.userPrompt.trim() || !this.draftId || !this.activeSection) return;

    const secKey = this.activeSectionKey;
    const promptText = this.userPrompt.trim();
    this.userPrompt = '';

    // Add user message to history
    this.chatHistories[secKey].push({
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: promptText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });

    this.isLoadingAi = true;

    // Build conversation history from past user messages
    const historyText = this.chatHistories[secKey]
      .filter(m => m.sender === 'user')
      .map(m => m.text)
      .join('\n');

    const req = new AiStepRequest();
    req.draftId = this.draftId;
    req.documentType = this.selectedTemplateKey;
    req.sectionKey = secKey;
    req.taskKey = this.activeSection.taskKey || secKey;
    req.conversationHistory = historyText;
    req.suitDto = this.currentSuit;

    this.fetcher.aiStep(req).subscribe({
      next: (res: TaskResultDto) => {
        this.isLoadingAi = false;
        if (res.renderContexts && res.renderContexts.length > 0) {
          this.draftContexts = {
            ...this.draftContexts,
            [secKey]: res.renderContexts
          };
        }

        if (res.status === 'NEEDS_INFO' && res.question) {
          this.chatHistories[secKey].push({
            id: `ai_${Date.now()}`,
            sender: 'ai',
            text: res.question,
            isQuestion: true,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          });
        } else {
          let generatedClauseText = '';
          if (res.renderContexts && res.renderContexts.length > 0) {
            generatedClauseText = res.renderContexts
              .map(c => c.value || c.context)
              .filter(txt => txt && txt.trim().length > 0)
              .join('\n\n');
          }

          const responseMsg = generatedClauseText
            ? `Clause generated successfully:\n\n${generatedClauseText}`
            : `Clause generated successfully! Preview updated on the legal document paper view.`;

          this.chatHistories[secKey].push({
            id: `ai_${Date.now()}`,
            sender: 'ai',
            text: responseMsg,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          });
        }
      },
      error: (err) => {
        console.error('AI step failed', err);
        this.isLoadingAi = false;
        this.chatHistories[secKey].push({
          id: `err_${Date.now()}`,
          sender: 'ai',
          text: `Apologies counsel, an error occurred while generating the clause. Please try again.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
      }
    });
  }

  updateSectionContexts() {
    if (!this.draftId || !this.activeSectionKey) return;

    const req = new SectionUpdateRequest();
    req.draftId = this.draftId;
    req.sectionKey = this.activeSectionKey;
    req.renderContexts = this.activeContexts;

    this.fetcher.updateSectionContexts(req).subscribe({
      next: (res) => {
        this.draftContexts[this.activeSectionKey] = res;
        alert('Section contexts saved successfully!');
      },
      error: (err) => console.error('Failed to update section contexts', err)
    });
  }

  nextSection() {
    if (this.activeIndex < this.sections.length - 1) {
      this.selectSection(this.sections[this.activeIndex + 1].sectionKey);
    }
  }

  prevSection() {
    if (this.activeIndex > 0) {
      this.selectSection(this.sections[this.activeIndex - 1].sectionKey);
    }
  }

  buildDocument() {
    if (!this.draftId) return;
    this.isBuildingDoc = true;

    const req = new BuildDocumentRequest();
    req.draftId = this.draftId;
    req.sectionKey = this.activeSectionKey;
    req.renderContexts = this.activeContexts;

    this.fetcher.buildDocument(req).subscribe({
      next: (blob) => {
        this.isBuildingDoc = false;
        const url = window.URL.createObjectURL(blob as Blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Legalbot_Draft_${this.draftId}.docx`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('Failed to build document', err);
        this.isBuildingDoc = false;
        alert('Failed to generate DOCX document.');
      }
    });
  }

  sendGeneralChat() {
    if (!this.generalChatPrompt.trim()) return;
    const prompt = this.generalChatPrompt;
    this.generalChatPrompt = '';

    this.fetcher.chat({ prompt }).subscribe({
      next: (res) => {
        this.generalChatResponse = res || 'No response from AI.';
      },
      error: (err) => {
        console.error('General chat error', err);
        this.generalChatResponse = 'Error contacting AI backend.';
      }
    });
  }
}
