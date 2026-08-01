package com.legal.legalbot.services.docgen.latest;

import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import com.legal.legalbot.model.Party;
import com.legal.legalbot.model.Suit;
import com.legal.legalbot.services.docgen.internal.DraftContext;
import com.legal.legalbot.services.docgen.internal.RenderContext;

import static org.junit.jupiter.api.Assertions.*;

class ProviderRegistryTest {

    private ProviderRegistry registry;

    @BeforeEach
    void setUp() {
        registry = new ProviderRegistry();
    }

    @Test
    void testCauseTitleProvider() {
        Suit suit = new Suit();
        suit.setCourt("District Court");
        suit.setCity("Hyderabad");

        Party plaintiff = new Party();
        plaintiff.setName("John Doe");

        Party defendant = new Party();
        defendant.setName("Jane Smith");

        suit.setPlaintiffs(List.of(plaintiff));
        suit.setDefendants(List.of(defendant));

        DraftContext context = new DraftContext(suit);
        List<RenderContext> renders = registry.executeProvider("CAUSE_TITLE", context);

        assertNotNull(renders);
        assertFalse(renders.isEmpty());

        assertEquals("COURT_NAME", renders.get(0).getDefinitionKey());
        assertTrue(renders.get(0).getContext().contains("DISTRICT COURT"));
    }

    @Test
    void testUnregisteredProviderThrowsException() {
        Suit suit = new Suit();
        DraftContext context = new DraftContext(suit);

        assertThrows(IllegalArgumentException.class, () -> {
            registry.executeProvider("NON_EXISTENT_SECTION", context);
        });
    }
}
