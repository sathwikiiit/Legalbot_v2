package com.legal.legalbot.services.ai;

import java.util.HashMap;
import java.util.Map;

import org.springframework.stereotype.Component;

import com.legal.legalbot.dto.ai.FactsResponse;
import com.legal.legalbot.dto.ai.ReliefResponse;

@Component
public class AIRegistry {

    private final Map<String, AITask<?>> tasks = new HashMap<>();

    public AIRegistry() {
        register();
    }

    private void register() {

        tasks.put(
            "FACTS",
            new AITask<>(
                Prompt.newBuilder()
                    .name("facts")
                    .description("Generate facts for a civil plaint.")
                    .build(),
                FactsResponse.class,
                true
            )
        );

        tasks.put(
            "RELIEF",
            new AITask<>(
                Prompt.newBuilder()
                    .name("relief")
                    .description("Generate reliefs.")
                    .build(),
                ReliefResponse.class,
                true
            )
        );
    }

    public void registerTask(String key, AITask<?> task) {
        tasks.put(key, task);
    }

    @SuppressWarnings("unchecked")
    public <T> AITask<T> get(String key) {
        return (AITask<T>) tasks.get(key);
    }
}
