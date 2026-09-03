package com.legal.legalbot.services.ai;

/**
 * Represents a registered AI task including its instruction, expected response type,
 * whether it is interactive, and optional business object / previous-output types
 * plus a flag indicating whether conversation history should be provided.
 */
public record AITask<T>(
                Instruction prompt,
                Class<T> responseType,
                boolean interactive,
                Class<?> businessObjectType,
                Class<?> previousOutputType,
                boolean useConversationHistory
) {
        public AITask(Instruction prompt, Class<T> responseType, boolean interactive) {
                this(prompt, responseType, interactive, Object.class, Object.class, true);
        }
}
