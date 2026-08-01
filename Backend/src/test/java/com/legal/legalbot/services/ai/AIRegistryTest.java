package com.legal.legalbot.services.ai;

import com.legal.legalbot.dto.ai.FactsResponse;
import com.legal.legalbot.dto.ai.ReliefResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class AIRegistryTest {

    private AIRegistry registry;
    private AIService aiService;

    @BeforeEach
    void setUp() {
        registry = new AIRegistry();
        aiService = new AIService(registry, new MockChatModel());
    }

    @Test
    void testGetRegisteredTasks() {
        AITask<FactsResponse> factsTask = registry.get("FACTS");
        assertNotNull(factsTask);
        assertEquals("facts", factsTask.prompt().getName());
        assertEquals(FactsResponse.class, factsTask.responseType());
        assertTrue(factsTask.interactive());

        AITask<ReliefResponse> reliefTask = registry.get("RELIEF");
        assertNotNull(reliefTask);
        assertEquals("relief", reliefTask.prompt().getName());
        assertEquals(ReliefResponse.class, reliefTask.responseType());
        assertTrue(reliefTask.interactive());
    }

    @Test
    void testAIDrivenInteractiveStepNeedsInfo() {
        TaskResult<FactsResponse> result = aiService.executeStep("FACTS", null);
        assertNotNull(result);
        assertEquals(TaskResult.Status.NEEDS_INFO, result.status());
        assertNotNull(result.question());
        assertNull(result.data());
    }

    @Test
    void testAIDrivenInteractiveStepComplete() {
        String history = "Q: What date did the alleged encroachment take place?\nA: January 15th, 2024";
        TaskResult<FactsResponse> result = aiService.executeStep("FACTS", history);
        assertNotNull(result);
        assertEquals(TaskResult.Status.COMPLETE, result.status());
        assertNull(result.question());
        assertNotNull(result.data());
        assertFalse(result.data().facts().isEmpty());
    }

    @Test
    void testUnknownTaskThrowsException() {
        assertThrows(IllegalArgumentException.class, () -> aiService.executeStep("NON_EXISTENT", null));
    }
}
