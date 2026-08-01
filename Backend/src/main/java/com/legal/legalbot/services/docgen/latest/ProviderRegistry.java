package com.legal.legalbot.services.docgen.latest;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;

import com.legal.legalbot.model.Party;
import com.legal.legalbot.model.Suit;
import com.legal.legalbot.services.docgen.internal.DraftContext;
import com.legal.legalbot.services.docgen.internal.RenderContext;

public class ProviderRegistry {
    private final Map<String, Function<DraftContext, List<RenderContext>>> providers = new HashMap<>();

    public ProviderRegistry() {
        registerDefaultProviders();
    }

    public void registerProvider(String sectionKey, Function<DraftContext, List<RenderContext>> provider) {
        providers.put(sectionKey, provider);
    }

    public List<RenderContext> executeProvider(String sectionKey, DraftContext context) {
        Function<DraftContext, List<RenderContext>> provider = providers.get(sectionKey);
        if (provider == null) {
            throw new IllegalArgumentException("No provider registered for section: " + sectionKey);
        }
        return provider.apply(context);
    }

    private void registerDefaultProviders() {
        // Cause title provider using typed Suit object
        providers.put("CAUSE_TITLE", context -> {
            List<RenderContext> list = new ArrayList<>();
            Suit suit = context.getSuit();
            if (suit == null) return list;

            // Court Heading
            String courtName = suit.getCourt() != null ? suit.getCourt().toUpperCase() : "_____";
            String city = suit.getCity() != null ? suit.getCity().toUpperCase() : "_____";
            String courtHeader = String.format("IN THE COURT OF THE %s AT %s", courtName, city);
            
            list.add(new RenderContext("COURT_NAME", courtHeader));

            // Plaintiffs
            if (suit.getPlaintiffs() != null && !suit.getPlaintiffs().isEmpty()) {
                for (Party plaintiff : suit.getPlaintiffs()) {
                    list.add(new RenderContext("PARTY_NAME", plaintiff.toString()));
                }
                list.add(new RenderContext("PARTY_TAG", "--- Plaintiffs"));
            }

            // Divider
            list.add(new RenderContext("SECTION_DIVIDER", "AND"));

            // Defendants
            if (suit.getDefendants() != null && !suit.getDefendants().isEmpty()) {
                for (Party defendant : suit.getDefendants()) {
                    list.add(new RenderContext("PARTY_NAME", defendant.toString()));
                }
                list.add(new RenderContext("PARTY_TAG", "--- Defendants"));
            }

            return list;
        });
    }
}
