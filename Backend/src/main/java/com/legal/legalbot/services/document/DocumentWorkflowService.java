package com.legal.legalbot.services.document;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.legal.legalbot.dto.SuitDto;
import com.legal.legalbot.dto.document.AiStepRequest;
import com.legal.legalbot.dto.document.RenderContextDto;
import com.legal.legalbot.dto.document.SectionDefinitionDto;
import com.legal.legalbot.dto.document.TaskResultDto;
import com.legal.legalbot.model.Suit;
import com.legal.legalbot.services.ai.AIRegistry;
import com.legal.legalbot.services.ai.AIService;
import com.legal.legalbot.services.ai.RagReferenceService;
import com.legal.legalbot.services.docgen.internal.DraftContext;
import com.legal.legalbot.services.docgen.internal.RenderContext;
import com.legal.legalbot.services.docgen.latest.DocComposer;
import com.legal.legalbot.services.docgen.latest.ProviderRegistry;

@Service
public class DocumentWorkflowService {

    private final DocumentTemplateService templateService;
    private final DocumentDraftService draftService;
    private final AIService aiService;
    private final AIRegistry aiRegistry;
    private final RagReferenceService ragReferenceService;

    public DocumentWorkflowService(
            DocumentTemplateService templateService,
            DocumentDraftService draftService,
            AIService aiService,
            AIRegistry aiRegistry,
            RagReferenceService ragReferenceService
    ) {
        this.templateService = templateService;
        this.draftService = draftService;
        this.aiService = aiService;
        this.aiRegistry = aiRegistry;
        this.ragReferenceService = ragReferenceService;
    }

    public String initializeDraft(String documentType, SuitDto suitDto) {
        return draftService.createDraft(documentType, suitDto);
    }

    public List<RenderContextDto> getStaticSectionContexts(String sectionKey, SuitDto suitDto) {
        Suit suit = SuitDto.toEntity(suitDto);
        DraftContext context = new DraftContext(suit);
        ProviderRegistry providerRegistry = new ProviderRegistry();
        List<RenderContext> renderContexts = providerRegistry.executeProvider(sectionKey, context);
        return convertRenderContexts(sectionKey, renderContexts, "STATIC", true);
    }

    public TaskResultDto runAiSection(AiStepRequest request) {
        String prompt = buildPromptForTask(request.getTaskKey(), request.getConversationHistory(), request.getSuitDto());
        var result = aiService.executeStep(request.getTaskKey(), prompt);

        if (result.isComplete()) {
            List<RenderContextDto> contexts = convertAiResponseToRenderContexts(request.getSectionKey(), request.getTaskKey(), result.data());
            draftService.saveSectionContexts(request.getDraftId(), request.getSectionKey(), contexts);
            return new TaskResultDto(TaskResultDto.Status.COMPLETE, null, contexts);
        }
        return new TaskResultDto(TaskResultDto.Status.NEEDS_INFO, result.question(), null);
    }

    public List<RenderContextDto> saveSectionContexts(String draftId, String sectionKey, List<RenderContextDto> contexts) {
        draftService.saveSectionContexts(draftId, sectionKey, contexts);
        return contexts;
    }

    public List<RenderContextDto> getDraftSectionContexts(String draftId, String sectionKey) {
        return draftService.getDraft(draftId)
                .map(draft -> draft.getSectionContexts().get(sectionKey))
                .orElse(null);
    }

    public List<RenderContextDto> buildDocument(String draftId, String outputPath) throws Exception {
        DocumentDraft draft = draftService.getDraft(draftId).orElseThrow(() -> new IllegalArgumentException("Draft not found: " + draftId));
        List<RenderContextDto> contexts = draft.getSectionContexts().values().stream()
                .flatMap(List::stream)
                .collect(Collectors.toList());

        List<RenderContext> renderContexts = contexts.stream()
                .map(this::toInternalRenderContext)
                .collect(Collectors.toList());

        new DocComposer().composeDocumentFromContexts(renderContexts, outputPath);
        return contexts;
    }

    private String buildPromptForTask(String taskKey, String conversationHistory, SuitDto suitDto) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("Task: ").append(taskKey).append("\n");
        prompt.append("Description: ").append(aiRegistry.get(taskKey).prompt().getDescription()).append("\n");
        prompt.append("Please use the following style and format reference examples:\n");
        prompt.append(ragReferenceService.getReferenceText()).append("\n\n");
        prompt.append("Suit Data:\n").append(suitDto == null ? "{}" : suitDto.toString()).append("\n");
        if (conversationHistory != null && !conversationHistory.isBlank()) {
            prompt.append("Conversation History:\n").append(conversationHistory).append("\n");
        }
        return prompt.toString();
    }

    private List<RenderContextDto> convertRenderContexts(String sectionKey, List<RenderContext> contexts, String sourceType, boolean editable) {
        List<RenderContextDto> dtos = new ArrayList<>();
        int order = 0;
        for (RenderContext rc : contexts) {
            dtos.add(new RenderContextDto(sectionKey, rc.getDefinitionKey(), rc.getContext(), rc.getValue(), order++, sourceType, editable));
        }
        return dtos;
    }

    private List<RenderContextDto> convertAiResponseToRenderContexts(String sectionKey, String taskKey, Object data) {
        List<RenderContextDto> contexts = new ArrayList<>();
        if (data instanceof com.legal.legalbot.dto.ai.FactsResponse facts) {
            int idx = 0;
            contexts.add(new RenderContextDto(sectionKey, "FACTS_INTRO", "Facts", "Facts", idx++, "AI", true));
            for (String fact : facts.facts()) {
                contexts.add(new RenderContextDto(sectionKey, "FACTS", fact, fact, idx++, "AI", true));
            }
        } else if (data instanceof com.legal.legalbot.dto.ai.ReliefResponse reliefResponse) {
            int idx = 0;
            for (String relief : reliefResponse.reliefs()) {
                contexts.add(new RenderContextDto(sectionKey, "RELIEF", relief, relief, idx++, "AI", true));
            }
        }
        return contexts;
    }

    private RenderContext toInternalRenderContext(RenderContextDto dto) {
        return new RenderContext(dto.getDefinitionKey(), dto.getValue(), dto.getValue());
    }
}
