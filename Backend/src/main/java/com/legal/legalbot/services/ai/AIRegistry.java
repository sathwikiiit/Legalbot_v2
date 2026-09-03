package com.legal.legalbot.services.ai;

import java.util.HashMap;
import java.util.Map;

import org.springframework.stereotype.Component;

import com.legal.legalbot.dto.ai.FactsResponse;
import com.legal.legalbot.dto.ai.ReliefResponse;
import com.legal.legalbot.model.Suit;

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
                Instruction.newBuilder()
                    .name("facts")
                    .description("Generate facts for a civil plaint.")
                    .build(),
                FactsResponse.class,
                true,
                Suit.class,
                Object.class,
                true
            )
        );

        tasks.put(
            "RELIEF",
            new AITask<>(
                Instruction.newBuilder()
                    .name("relief")
                    .description("Generate reliefs.")
                    .build(),
                ReliefResponse.class,
                true,
                Suit.class,
                Object.class,
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
