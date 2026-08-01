package com.legal.legalbot.services.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.springframework.stereotype.Service;

@Service
public class AIService {

    private final AIRegistry registry;
    private final ChatModel chatModel;
    private final ObjectMapper objectMapper;

    public AIService(AIRegistry registry, ChatModel chatModel) {
        this.registry = registry;
        this.chatModel = chatModel;
        this.objectMapper = new ObjectMapper();
    }

    public AIService(AIRegistry registry) {
        this(registry, new MockChatModel());
    }

    /**
     * Executes one turn of an AI-driven task step.
     * The model evaluates the prompt and conversation history to either:
     * 1. Ask a dynamic follow-up question (TaskResult.NEEDS_INFO)
     * 2. Return the completed structured response (TaskResult.COMPLETE)
     */
    public <T> TaskResult<T> executeStep(String taskKey, String conversationHistory) {
        AITask<T> task = registry.get(taskKey);

        if (task == null) {
            throw new IllegalArgumentException("No AI task registered for key: " + taskKey);
        }

        Prompt prompt = task.prompt();

        StringBuilder fullPrompt = new StringBuilder();
        fullPrompt.append("Task: ").append(prompt.getName()).append("\n");
        if (prompt.getDescription() != null) {
            fullPrompt.append("Description: ").append(prompt.getDescription()).append("\n");
        }
        if (prompt.getTemplate() != null) {
            fullPrompt.append("Instructions: ").append(prompt.getTemplate()).append("\n");
        }

        if (conversationHistory != null && !conversationHistory.isBlank()) {
            fullPrompt.append("Conversation History:\n").append(conversationHistory).append("\n");
        }

        if (task.interactive()) {
            fullPrompt.append("\nInteractive Guidelines:\n");
            fullPrompt.append("- If you need more details from the user, output JSON format: {\"status\": \"NEEDS_INFO\", \"question\": \"Your question here\"}\n");
            fullPrompt.append("- If you have sufficient information, output JSON format: {\"status\": \"COMPLETE\", \"data\": <")
                      .append(task.responseType().getSimpleName()).append(" object>}\n");
        } else {
            fullPrompt.append("\nPlease output strictly valid JSON matching ")
                      .append(task.responseType().getSimpleName()).append(".\n");
        }

        String rawResponse = chatModel.generate(fullPrompt.toString());

        try {
            if (task.interactive()) {
                JsonNode node = objectMapper.readTree(rawResponse);
                String statusStr = node.has("status") ? node.get("status").asText() : "COMPLETE";

                if ("NEEDS_INFO".equalsIgnoreCase(statusStr)) {
                    String question = node.has("question") ? node.get("question").asText() : "Could you provide more details?";
                    return TaskResult.needsInfo(question);
                } else {
                    JsonNode dataNode = node.has("data") ? node.get("data") : node;
                    T parsedData = objectMapper.treeToValue(dataNode, task.responseType());
                    return TaskResult.complete(parsedData);
                }
            } else {
                T parsedData = objectMapper.readValue(rawResponse, task.responseType());
                return TaskResult.complete(parsedData);
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse AI response into " + task.responseType().getSimpleName() + ": " + rawResponse, e);
        }
    }

    public <T> T execute(String taskKey) {
        TaskResult<T> result = executeStep(taskKey, null);
        return result.data();
    }
}
