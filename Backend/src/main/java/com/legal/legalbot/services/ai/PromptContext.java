package com.legal.legalbot.services.ai;

import java.util.Map;

import com.legal.legalbot.model.Suit;

/**
 * Context passed to prompt builders. Contains the AITask and optional business data,
 * previous AI outputs, conversation history and any request metadata.
 */
public record PromptContext(
        AITask<?> task,
        Suit businessObject,
        Map<String, Object> previousOutputs,
        String conversationHistory,
        Map<String, String> metadata
) {
    public static PromptContext empty(AITask<?> task) {
        return new PromptContext(task, null, Map.of(), null, Map.of());
    }
}
