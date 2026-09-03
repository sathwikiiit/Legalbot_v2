package com.legal.legalbot.services.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.converter.BeanOutputConverter;
import org.springframework.stereotype.Service;

import com.legal.legalbot.model.Suit;

@Service
public class AIService {

    private static final Logger logger = LoggerFactory.getLogger(AIService.class);
    private final AIRegistry registry;
    private final PromptRegistry promptRegistry;
    private final ChatModel chatModel;
    private final ObjectMapper objectMapper;

    public AIService(AIRegistry registry, PromptRegistry promptRegistry, ChatModel chatModel) {
        this.registry = registry;
        this.promptRegistry = promptRegistry;
        this.chatModel = chatModel;
        this.objectMapper = new ObjectMapper();
    }

    /**
     * Executes one turn of an AI-driven task step using JSON structured output.
     */
    public <T> TaskResult<T> executeStep(String taskKey, String conversationHistory) {
        return executeStep(taskKey, null, Map.of(), conversationHistory, Map.of());
    }

    public <T> TaskResult<T> executeStep(String taskKey,
                                         Suit businessObject,
                                         Map<String, Object> previousOutputs,
                                         String conversationHistory,
                                         Map<String, String> metadata) {
        AITask<T> task = registry.get(taskKey);

        if (task == null) {
            throw new IllegalArgumentException("No AI task registered for key: " + taskKey);
        }

        String conv = task.useConversationHistory() ? conversationHistory : null;
        PromptContext context = new PromptContext(task, businessObject, previousOutputs == null ? Map.of() : previousOutputs, conv, metadata == null ? Map.of() : metadata);

        String fullPromptText = promptRegistry.buildPromptText(taskKey, context);
        logger.info("Executing AI task {} with interactive={}.", taskKey, task.interactive());
        logger.info("=== FULL PROMPT TEXT ===\n{}", fullPromptText);
        try {
            if (task.interactive()) {
                InteractiveResponse response = parseStructuredResponse(fullPromptText, InteractiveResponse.class);
                String statusStr = response.status();

                if ("NEEDS_INFO".equalsIgnoreCase(statusStr)) {
                    return TaskResult.needsInfo(response.question());
                }

                if (response.data() != null) {
                    T parsedData = objectMapper.treeToValue(response.data(), task.responseType());
                    return TaskResult.complete(parsedData);
                }

                return TaskResult.complete(null);
            }

            T parsedData = parseStructuredResponse(fullPromptText, task.responseType());
            return TaskResult.complete(parsedData);
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse AI response into " + task.responseType().getSimpleName() + ": " + fullPromptText, e);
        }
    }

    /**
     * Gemma-Optimized Key-Value Execution:
     * Instructs Gemma models explicitly to format response as key:value pairs inside code blocks.
     */
    public Map<String, String> executeKeyValue(String promptText) {
        StringBuilder gemmaPrompt = new StringBuilder();
        gemmaPrompt.append(promptText);

        String rawResponse = generateText(gemmaPrompt.toString());
        logger.info("=== RAW AI MODEL OUTPUT (KEY-VALUE MODE) ===\n{}", rawResponse);

        Map<String, String> parsed = parseKeyValueFormat(rawResponse);
        logger.info("=== PARSED KEY-VALUE MAP ===\n{}", parsed);
        return parsed;
    }

    /**
     * Executes an AI task step optimized for Gemma models using key:value formatted output.
     */
    public TaskResult<Map<String, String>> executeStepKeyValue(String taskKey,
                                                                 Suit businessObject,
                                                                 Map<String, Object> previousOutputs,
                                                                 String conversationHistory,
                                                                 Map<String, String> metadata) {
        AITask<?> task = registry.get(taskKey);

        if (task == null) {
            throw new IllegalArgumentException("No AI task registered for key: " + taskKey);
        }

        String conv = task.useConversationHistory() ? conversationHistory : null;
        Map<String, String> promptMetadata = new java.util.HashMap<>(metadata == null ? Map.of() : metadata);
        promptMetadata.put("responseMode", "KEY_VALUE");
        PromptContext context = new PromptContext(task, businessObject,
            previousOutputs == null ? Map.of() : previousOutputs, conv, promptMetadata);

        String fullPromptText = promptRegistry.buildPromptText(taskKey, context);
        logger.info("Executing Gemma AI task {} with Key-Value format.", taskKey);

        Map<String, String> result = executeKeyValue(fullPromptText);

        if (task.interactive()) {
            String status = getCaseInsensitive(result, "status", "COMPLETE");
            String question = getCaseInsensitive(result, "question", null);
            if ("NEEDS_INFO".equalsIgnoreCase(status) && question != null) {
                return TaskResult.needsInfo(question);
            }
        }
        return TaskResult.complete(result);
    }

    /**
     * Hybrid Gemma Response Parser:
     * 1. Attempts JSON parsing first if the model returned raw JSON object.
     * 2. Falls back to line-by-line key:value parsing with code fence extraction.
     */
    public Map<String, String> parseKeyValueFormat(String rawResponse) {
        Map<String, String> resultMap = new LinkedHashMap<>();
        if (rawResponse == null || rawResponse.isBlank()) {
            return resultMap;
        }

        String textToParse = rawResponse.trim();
        // Extract content inside code block if present
        Pattern codeBlockPattern = Pattern.compile("```(?:json|text|yaml)?\\s*(.*?)\\s*```", Pattern.DOTALL);
        Matcher blockMatcher = codeBlockPattern.matcher(rawResponse);
        if (blockMatcher.find()) {
            textToParse = blockMatcher.group(1).trim();
        }

        // 1. Try JSON parsing first
        if (textToParse.startsWith("{") && textToParse.endsWith("}")) {
            try {
                JsonNode root = objectMapper.readTree(textToParse);
                if (root.isObject()) {
                    root.fieldNames().forEachRemaining(key -> {
                        JsonNode valNode = root.get(key);
                        if (valNode != null) {
                            resultMap.put(key.toLowerCase(), valNode.isValueNode() ? valNode.asText() : valNode.toString());
                        }
                    });
                    if (!resultMap.isEmpty()) {
                        return resultMap;
                    }
                }
            } catch (Exception e) {
                logger.debug("Raw JSON parsing attempt failed, falling back to line key-value parser.", e);
            }
        }

        // 2. Line-by-line key-value parsing
        String[] lines = textToParse.split("\\r?\\n");
        String currentKey = null;
        StringBuilder currentValue = new StringBuilder();

        Pattern keyValPattern = Pattern.compile("^(?:[\\-\\*\">•\\d+\\.]+\\s*)?(?:\\*\\*|`|\\*)?([a-zA-Z0-9_\\-\\s]+?)(?:\\*\\*|`|\\*)?\\s*[:=]\\s*(.*)$");

        for (String line : lines) {
            String trimmed = line.trim();
            if (trimmed.isEmpty() || trimmed.startsWith("```")) {
                continue;
            }

            Matcher matcher = keyValPattern.matcher(trimmed);

            if (matcher.matches()) {
                if (currentKey != null) {
                    resultMap.put(currentKey, currentValue.toString().trim());
                }

                currentKey = matcher.group(1).trim().toLowerCase();
                String val = matcher.group(2).trim();
                if ((val.startsWith("\"") && val.endsWith("\"")) || (val.startsWith("'") && val.endsWith("'"))) {
                    val = val.substring(1, val.length() - 1).trim();
                }
                currentValue = new StringBuilder(val);
            } else if (currentKey != null) {
                if (currentValue.length() > 0) {
                    currentValue.append("\n");
                }
                currentValue.append(trimmed);
            }
        }

        if (currentKey != null) {
            resultMap.put(currentKey, currentValue.toString().trim());
        }

        return resultMap;
    }

    private String getCaseInsensitive(Map<String, String> map, String keyName, String defaultValue) {
        if (map == null) return defaultValue;
        for (Map.Entry<String, String> entry : map.entrySet()) {
            if (entry.getKey().equalsIgnoreCase(keyName)) {
                return entry.getValue();
            }
        }
        return defaultValue;
    }

    public <T> T execute(String taskKey) {
        TaskResult<T> result = executeStep(taskKey, null);
        return result.data();
    }

    public String chat(String prompt) {
        logger.info("Executing simple AI chat prompt.");
        logger.info("=== CHAT PROMPT ===\n{}", prompt);
        String response = generateText(prompt);
        logger.info("=== CHAT RESPONSE ===\n{}", response);
        return response;
    }

    private String generateText(String promptText) {
        ChatResponse response = chatModel.call(new Prompt(promptText));
        if (response == null || response.getResult() == null || response.getResult().getOutput() == null) {
            logger.warn("Received empty or null response from AI model.");
            return "";
        }
        String rawText = response.getResults().get(response.getResults().size()-1).getOutput().getText();
        logger.info("=== RAW AI MODEL OUTPUT ===\n{}", rawText);
        return normalizeResponse(rawText);
    }

    private <T> T parseStructuredResponse(String promptText, Class<T> responseType) {
        BeanOutputConverter<T> converter = new BeanOutputConverter<>(responseType);
        String promptWithSchema = promptText + "\n" + converter.getFormat();
        String rawResponse = generateText(promptWithSchema);
        return converter.convert(rawResponse);
    }

    private String normalizeResponse(String rawResponse) {
        if (rawResponse == null) {
            return "";
        }

        String normalized = rawResponse.trim();
        Pattern fencePattern = Pattern.compile("^```(?:json|javascript|text|xml|yaml|yml)?\\s*(.*?)\\s*```$", Pattern.DOTALL);
        Matcher matcher = fencePattern.matcher(normalized);
        if (matcher.matches()) {
            normalized = matcher.group(1).trim();
        }
        return normalized;
    }

    private record InteractiveResponse(String status, String question, JsonNode data) {}
}
