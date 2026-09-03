package com.legal.legalbot.services.ai;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;
import org.springframework.ai.chat.prompt.Prompt;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.function.Function;

/**
 * Builds complete prompts for AITasks. Each registered builder receives a PromptContext
 * and must return a fully composed prompt string (or a Spring AI Prompt wrapper).
 */
@Component
public class PromptRegistry {

    private static final String GLOBAL_SYSTEM_PROMPT = "You are a Java Legal Assistant API. Follow the task-specific output contract exactly. Respond only in the requested structured format and include no extra explanation.";

    private final ObjectMapper mapper;
    private final RagReferenceService ragReferenceService;
    private final Map<String, Function<PromptContext, String>> builders = new ConcurrentHashMap<>();

    public PromptRegistry(ObjectMapper mapper, RagReferenceService ragReferenceService) {
        this.mapper = mapper;
        this.ragReferenceService = ragReferenceService;
        registerDefaults();
    }

    private void registerDefaults() {
        // FACTS builder
        builders.put("FACTS", context -> {
            Instruction instr = context.task().prompt();
            StringBuilder sb = new StringBuilder();
            sb.append(GLOBAL_SYSTEM_PROMPT).append("\n\n");
            sb.append("Task: ").append(instr.getName()).append("\n");
            if (instr.getDescription() != null) sb.append("Description: ").append(instr.getDescription()).append("\n");
            if (instr.getTemplate() != null) sb.append("Template: ").append(instr.getTemplate()).append("\n");

            appendContext(sb, context);
            appendOutputContract(sb, context, "facts");
            return sb.toString();
        });

        // RELIEF builder
        builders.put("RELIEF", context -> {
            Instruction instr = context.task().prompt();
            StringBuilder sb = new StringBuilder();
            sb.append(GLOBAL_SYSTEM_PROMPT).append("\n\n");
            sb.append("Task: ").append(instr.getName()).append("\n");
            if (instr.getDescription() != null) sb.append("Description: ").append(instr.getDescription()).append("\n");

            appendContext(sb, context);
            appendOutputContract(sb, context, "reliefs");
            return sb.toString();
        });
    }

    private void appendContext(StringBuilder sb, PromptContext context) {
        sb.append("\nBusiness Object (Suit JSON):\n");
        try {
            sb.append(mapper.writerWithDefaultPrettyPrinter().writeValueAsString(context.businessObject()));
        } catch (JsonProcessingException e) {
            sb.append("<unable to serialize suit>");
        }

        String references = ragReferenceService.getReferenceText();
        if (!references.isBlank()) {
            sb.append("\n\nStyle and format references:\n").append(references);
        }

        if (!context.previousOutputs().isEmpty()) {
            sb.append("\n\nPrevious outputs (JSON):\n");
            try {
                sb.append(mapper.writerWithDefaultPrettyPrinter().writeValueAsString(context.previousOutputs()));
            } catch (JsonProcessingException e) {
                sb.append("<unable to serialize previous outputs>");
            }
        }

        if (context.conversationHistory() != null && !context.conversationHistory().isBlank()) {
            sb.append("\n\nConversation History:\n").append(context.conversationHistory()).append("\n");
        }
    }

    private void appendOutputContract(StringBuilder sb, PromptContext context, String dataKey) {
        if ("KEY_VALUE".equalsIgnoreCase(context.metadata().get("responseMode"))) {
            sb.append("\nOutput contract:\n");
            sb.append("- Return only key:value pairs inside one triple-backtick block.\n");
            sb.append("- Include status: COMPLETE or status: NEEDS_INFO.\n");
            sb.append("- Put generated items under the key ").append(dataKey).append(".\n");
            return;
        }

        sb.append("\nOutput contract:\n");
        sb.append("- Return one JSON object matching: {\"status\": \"COMPLETE\", \"data\": {\"")
                .append(dataKey).append("\": [...]}}.\n");
        sb.append("- If information is missing, return {\"status\": \"NEEDS_INFO\", \"question\": \"...\"}.\n");
        sb.append("- Return only valid JSON without explanations.\n");
    }

    public void registerBuilder(String taskKey, Function<PromptContext, String> builder) {
        builders.put(taskKey, builder);
    }

    public String buildPromptText(String taskKey, PromptContext context) {
        Function<PromptContext, String> builder = builders.get(taskKey);
        if (builder == null) {
            throw new IllegalArgumentException("No prompt builder registered for task: " + taskKey);
        }
        return builder.apply(context);
    }

    public Prompt buildPrompt(String taskKey, PromptContext context) {
        return new Prompt(buildPromptText(taskKey, context));
    }
}
