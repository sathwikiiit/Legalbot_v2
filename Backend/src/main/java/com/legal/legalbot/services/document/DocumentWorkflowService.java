package com.legal.legalbot.services.document;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.legal.legalbot.dto.SuitDto;
import com.legal.legalbot.dto.document.AiStepRequest;
import com.legal.legalbot.dto.document.RenderContextDto;
import com.legal.legalbot.dto.document.TaskResultDto;
import com.legal.legalbot.model.Suit;
import com.legal.legalbot.services.ai.AIService;
import com.legal.legalbot.services.docgen.internal.DraftContext;
import com.legal.legalbot.services.docgen.internal.RenderContext;
import com.legal.legalbot.services.docgen.latest.DocComposer;
import com.legal.legalbot.services.docgen.latest.ProviderRegistry;

@Service
public class DocumentWorkflowService {

    private static final Logger logger = LoggerFactory.getLogger(DocumentWorkflowService.class);
    private final DocumentDraftService draftService;
    private final AIService aiService;
    private final ObjectMapper objectMapper;

    public DocumentWorkflowService(
            DocumentDraftService draftService,
            AIService aiService,
            ObjectMapper objectMapper
    ) {
        this.draftService = draftService;
        this.aiService = aiService;
        this.objectMapper = objectMapper;
    }

    public String initializeDraft(String documentType, SuitDto suitDto) {
        logger.info("Creating draft for documentType={} lawyer={}", documentType, suitDto == null ? "<none>" : suitDto.getLawyer());
        return draftService.createDraft(documentType, suitDto);
    }

    public List<RenderContextDto> getStaticSectionContexts(String sectionKey, SuitDto suitDto) {
        logger.info("Loading static section contexts for sectionKey={}", sectionKey);
        Suit suit = SuitDto.toEntity(suitDto);
        DraftContext context = new DraftContext(suit);
        ProviderRegistry providerRegistry = new ProviderRegistry();
        List<RenderContext> renderContexts = providerRegistry.executeProvider(sectionKey, context);
        return convertRenderContexts(sectionKey, renderContexts, "STATIC", true);
    }

    public TaskResultDto runAiSection(AiStepRequest request) {
        logger.info("Running AI section for draftId={} sectionKey={} taskKey={}", request.getDraftId(), request.getSectionKey(), request.getTaskKey());
        var result = aiService.executeStep(request.getTaskKey(), SuitDto.toEntity(request.getSuitDto()), Map.of(), request.getConversationHistory(), Map.of());
        logger.info("AI task result status={}", result.status());

        if (result.isComplete()) {
            List<RenderContextDto> contexts = convertAiResponseToRenderContexts(request.getSectionKey(), request.getTaskKey(), result.data());
            draftService.saveSectionContexts(request.getDraftId(), request.getSectionKey(), contexts);
            logger.info("Saved Gemma AI section contexts for draftId={} sectionKey={}", request.getDraftId(), request.getSectionKey());
            return new TaskResultDto(TaskResultDto.Status.COMPLETE, null, contexts);
        }
        logger.info("Gemma AI section requires more info: question={}", result.question());
        return new TaskResultDto(TaskResultDto.Status.NEEDS_INFO, result.question(), null);
    }

    public TaskResultDto runAiSectionKeyValue(AiStepRequest request) {
        logger.info("Running key-value AI section for draftId={} sectionKey={} taskKey={}", request.getDraftId(), request.getSectionKey(), request.getTaskKey());
        var result = aiService.executeStepKeyValue(request.getTaskKey(), SuitDto.toEntity(request.getSuitDto()), Map.of(), request.getConversationHistory(), Map.of());
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
        logger.info("Fetching draft section contexts for draftId={} sectionKey={}", draftId, sectionKey);
        return draftService.getDraft(draftId)
                .map(draft -> draft.getSectionContexts().get(sectionKey))
                .orElse(null);
    }

    public List<RenderContextDto> buildDocument(String draftId, String outputPath) throws Exception {
        logger.info("Building document for draftId={}", draftId);
        DocumentDraft draft = draftService.getDraft(draftId).orElseThrow(() -> new IllegalArgumentException("Draft not found: " + draftId));
        List<RenderContextDto> contexts = draft.getSectionContexts().values().stream()
            .flatMap(sectionContexts -> sectionContexts.stream())
                .collect(Collectors.toList());

        List<RenderContext> renderContexts = contexts.stream()
            .map(dto -> toDocumentRenderContext(dto))
                .collect(Collectors.toList());

        new DocComposer().composeDocumentFromContexts(renderContexts, outputPath);
        return contexts;
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
        if (data == null) {
            return contexts;
        }

        int idx = 0;
        if (data instanceof Map<?, ?> map) {
            for (Map.Entry<?, ?> entry : map.entrySet()) {
                String key = entry.getKey() == null ? "KEY" : entry.getKey().toString().toUpperCase();
                String rawVal = entry.getValue() == null ? "" : entry.getValue().toString().trim();

                // Skip internal control keys
                if ("STATUS".equalsIgnoreCase(key) || "QUESTION".equalsIgnoreCase(key)) {
                    continue;
                }

                List<String> cleanParas = extractCleanStrings(rawVal);
                for (String para : cleanParas) {
                    if (!para.isBlank()) {
                        contexts.add(new RenderContextDto(sectionKey, key, key, para, idx++, "AI_GEMMA", true));
                    }
                }
            }
        } else if (data instanceof com.legal.legalbot.dto.ai.FactsResponse facts) {
            for (String fact : facts.facts()) {
                if (fact != null && !fact.isBlank()) {
                    contexts.add(new RenderContextDto(sectionKey, "FACTS", "Fact", fact, idx++, "AI", true));
                }
            }
        } else if (data instanceof com.legal.legalbot.dto.ai.ReliefResponse reliefResponse) {
            for (String relief : reliefResponse.reliefs()) {
                if (relief != null && !relief.isBlank()) {
                    contexts.add(new RenderContextDto(sectionKey, "RELIEF", "Relief", relief, idx++, "AI", true));
                }
            }
        }

        // Fallback: If no contexts were parsed, unwrap raw data string into clean paragraphs
        if (contexts.isEmpty()) {
            List<String> cleanParas = extractCleanStrings(data.toString());
            for (String para : cleanParas) {
                if (!para.isBlank()) {
                    contexts.add(new RenderContextDto(sectionKey, "CLAUSE", "Clause", para, idx++, "AI_GEMMA", true));
                }
            }
        }

        return contexts;
    }

    private List<String> extractCleanStrings(String rawVal) {
        List<String> result = new ArrayList<>();
        if (rawVal == null || rawVal.isBlank()) {
            return result;
        }

        String trimmed = rawVal.trim();
        if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
            try {
                com.fasterxml.jackson.databind.JsonNode node = objectMapper.readTree(trimmed);
                if (node.isObject()) {
                    if (node.has("data")) {
                        node = node.get("data");
                    } else if (node.has("facts")) {
                        node = node.get("facts");
                    } else if (node.has("reliefs")) {
                        node = node.get("reliefs");
                    } else if (node.has("clause")) {
                        node = node.get("clause");
                    }
                }

                if (node != null && node.isArray()) {
                    for (com.fasterxml.jackson.databind.JsonNode item : node) {
                        String txt = item.isValueNode() ? item.asText() : item.toString();
                        if (txt != null && !txt.isBlank()) {
                            result.add(txt.trim());
                        }
                    }
                    if (!result.isEmpty()) {
                        return result;
                    }
                } else if (node != null && node.isValueNode()) {
                    result.add(node.asText().trim());
                    return result;
                }
            } catch (Exception e) {
                logger.debug("Failed to unwrap JSON string value, using raw string.", e);
            }
        }

        result.add(trimmed);
        return result;
    }

    private RenderContext toDocumentRenderContext(RenderContextDto dto) {
        return new RenderContext(dto.getDefinitionKey(), dto.getValue(), dto.getValue());
    }
}
