
## Application Overview

This is a Spring Boot backend application for a legal document generation / AI-assisted drafting workflow.

### Core stack
- Java 17
- Spring Boot 3.3.2
- Spring Data JPA
- Spring Web
- Spring AI with `spring-ai-starter-model-google-genai`
- MySQL connector + H2 runtime
- Apache POI for DOCX generation

---

## Main application layers

### 1. Entry point
- `com.legal.legalbot.LegalbotApplication`
  - Standard Spring Boot main class.

### 2. Controllers
- `com.legal.legalbot.controller.AIController`
  - Exposes `/api/ai/chat`
  - Accepts `ChatRequest`
  - Calls `AIService.chat(...)` for free-form chat usage

- `com.legal.legalbot.controller.DocumentController`
  - Exposes document workflow APIs under `/api/documents`
  - Endpoints:
    - `GET /templates`
    - `GET /templates/{templateKey}`
    - `POST /initialize`
    - `POST /sections/preview`
    - `PUT /sections/update`
    - `POST /ai/step`
    - `POST /build`
    - `GET /drafts/{draftId}`
  - Orchestrates document draft initialization, section preview, AI-driven section generation, context saving, and DOCX generation.

### 3. Services
- `com.legal.legalbot.services.SuitService`
  - CRUD access for suits
  - Converts between `SuitDto` and `Suit`
  - Generates legacy docs via `DocGen`

- `com.legal.legalbot.services.document.DocumentTemplateService`
  - Provides document templates / section configuration
  - Current default template:
    - `CAUSE_TITLE` → STATIC
    - `FACTS` → AI
    - `RELIEF` → AI

- `com.legal.legalbot.services.document.DocumentDraftService`
  - Manages draft section contexts by draftId
  - Stores intermediate render contexts for document drafts

- `com.legal.legalbot.services.document.DocumentWorkflowService`
  - Central workflow for document authoring
  - Initializes drafts
  - Loads static section contexts
  - Runs AI-driven sections
  - Saves section contexts
  - Builds final document via `DocComposer`

### 4. AI subsystem
- `com.legal.legalbot.services.ai.AIService`
  - Main AI executor
  - Uses `ChatModel` from Spring AI
  - Parses model output using `BeanOutputConverter`
  - Now supports full `PromptContext`:
    - `businessObject`
    - `previousOutputs`
    - `conversationHistory`
    - `metadata`
  - Exposes:
    - `executeStep(String taskKey, String conversationHistory)`
    - overloads that accept full context data
    - `execute(...)`
    - `chat(...)`

- `com.legal.legalbot.services.ai.AIRegistry`
  - Registry of AI tasks keyed by task string
  - Registers `AITask` definitions such as `FACTS` and `RELIEF`
  - Each task contains:
    - `Instruction`
    - response type
    - interactive flag
    - business object type
    - previous output type
    - conversation history flag

- `com.legal.legalbot.services.ai.AITask`
  - Holds task metadata
  - Extended to include business object and flow-related type metadata

- `com.legal.legalbot.services.ai.Instruction`
  - Holds prompt name, description, and optional template text

- `com.legal.legalbot.services.ai.PromptContext`
  - Strongly typed context for building AI prompts
  - Fields:
    - `AITask<?> task`
    - `Object businessObject`
    - `Map<String,Object> previousOutputs`
    - `String conversationHistory`
    - `Map<String,String> metadata`

- `com.legal.legalbot.services.ai.PromptRegistry`
  - Single source of prompt construction
  - Maintains map of builders:
    - `Map<String, Function<PromptContext,String>>`
  - Each builder creates a complete prompt:
    - global system prompt
    - task instruction
    - business object JSON
    - conversation history
    - response format guidance

- `com.legal.legalbot.services.ai.RagReferenceService`
  - Provides reference text / style examples for prompts
  - Used when building prompts for AI tasks

- `com.legal.legalbot.services.ai.TaskResult`
  - Wraps AI result status:
    - `NEEDS_INFO`
    - `COMPLETE`

---

## Document generation internals

### Templates and sections
- Template definitions live in `DocumentTemplateService`
- Sections have:
  - `sectionKey`
  - `title`
  - `sourceType` (`STATIC` or `AI`)
  - `taskKey` for AI sections

### Render contexts
- `RenderContextDto`
  - carries section values to/from frontend
- `RenderContext`
  - internal representation used by doc composer

### Document composer
- `DocComposer`
  - Converts render contexts into a DOCX document
- `DocumentInitializer`
  - Creates Word document structure and margins

### Legacy generation
- `com.legal.legalbot.services.docgen.legacy.DocGen`
  - Older document generation path
  - Used by `SuitService.generateDoc(...)`

---

## Data model

### Entities
- `com.legal.legalbot.model.Suit`
- `com.legal.legalbot.model.Party`
- `com.legal.legalbot.model.Property`
- `com.legal.legalbot.model.Advocate`

### DTOs
- `SuitDto`, `PartyDto`, `PropertyDto`
- AI DTOs:
  - `FactsResponse`
  - `ReliefResponse`
  - `VerificationResponse`
  - `ChatRequest`
- Document workflow DTOs:
  - `InitializeDocumentRequest`
  - `InitializeDocumentResponse`
  - `BuildDocumentRequest`
  - `SectionPreviewRequest`
  - `SectionPreviewResponse`
  - `SectionUpdateRequest`
  - `RenderContextDto`
  - `TaskResultDto`
  - `DocumentTemplateDto`
  - `SectionDefinitionDto`

---

## Current workflow

### 1. Initialize a draft
- frontend calls `POST /api/documents/initialize`
- `DocumentController` calls `DocumentWorkflowService.initializeDraft(...)`
- draft created and template section contexts loaded

### 2. Preview a section
- frontend calls `POST /api/documents/sections/preview`
- `DocumentController` checks if section source is `AI`
- if AI:
  - constructs `AiStepRequest`
  - calls `workflowService.runAiSection(...)`
- `runAiSection` currently:
  - builds a prompt string via old `buildPromptForTask(...)`
  - calls `aiService.executeStep(...)`
  - converts response into `RenderContextDto`
  - saves section contexts

### 3. Update section contexts
- frontend calls `PUT /api/documents/sections/update`
- contexts saved into draft store

### 4. Build final DOCX
- frontend calls `POST /api/documents/build`
- `DocumentWorkflowService.buildDocument(...)` composes a DOCX from all saved contexts

---

## What changed recently

You now have:
- `AIService` using full `PromptContext`
- `PromptRegistry` as the single prompt builder registry
- `AITask` enriched with business object / previous output / conversation history metadata
- documentation added in prompt-context-workflow.md

This means the AI prompt generation is now designed to be centralized and extensible:
- `AIService` no longer manually concatenates prompts
- `PromptRegistry` owns prompt text construction
- builders receive all workflow context via `PromptContext`

---

## How to understand the app at a glance

- `LegalbotApplication` boots Spring
- `AIController` is the generic AI chat endpoint
- `DocumentController` is the document authoring API
- `DocumentWorkflowService` glues templates, drafts, AI, and DOCX generation
- `AIService` executes AI tasks and parses structured responses
- `PromptRegistry` builds prompts from `PromptContext`
- `AIRegistry` defines available AI tasks and their schema

If you want, I can now produce a short architecture diagram or a single-page `README.md` describing this exact flow.