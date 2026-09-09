package com.legal.legalbot.services.docgen.latest;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.time.Year;

import com.legal.legalbot.model.Party;
import com.legal.legalbot.model.Suit;
import com.legal.legalbot.services.docgen.internal.DraftContext;
import com.legal.legalbot.services.docgen.internal.RenderContext;

public class ProviderRegistry {
    private static final Map<String, String> FILING_LAWS = Map.of(
            "PLAINT_RECOVERY", "ORDER XXXVII OF THE CODE OF CIVIL PROCEDURE, 1908",
            "PLAINT_INJUNCTION", "ORDER XXXIX RULES 1 AND 2 OF THE CODE OF CIVIL PROCEDURE, 1908",
            "PLAINT_SPECIFIC_PERFORMANCE", "THE SPECIFIC RELIEF ACT, 1963",
            "EVICTION_PETITION", "SECTION 106 OF THE TRANSFER OF PROPERTY ACT, 1882",
            "PLAINT_PARTITION", "ORDER XX RULE 18 OF THE CODE OF CIVIL PROCEDURE, 1908"
    );
    private final Map<String, Function<DraftContext, List<RenderContext>>> providers = new HashMap<>();

    public ProviderRegistry() {
        registerDefaultProviders();
    }

    public void registerProvider(String sectionKey, Function<DraftContext, List<RenderContext>> provider) {
        providers.put(sectionKey, provider);
    }

    public List<RenderContext> executeProvider(String sectionKey, DraftContext context) {
        Function<DraftContext, List<RenderContext>> provider = providers.get(sectionKey);
        if (provider != null) {
            return provider.apply(context);
        }

        // Fallback default static section renderer
        List<RenderContext> list = new ArrayList<>();
        Suit suit = context == null ? null : context.getSuit();
        String cityStr = (suit != null && suit.getCity() != null) ? suit.getCity() : "Station";

        if ("PARTIES".equalsIgnoreCase(sectionKey)) {
            String pf = (suit != null && suit.getPlaintiff1() != null) ? suit.getPlaintiff1() : "Plaintiff";
            String df = (suit != null && suit.getDefendant1() != null) ? suit.getDefendant1() : "Defendant";
            list.add(new RenderContext("PARTIES_SUMMARY", pf + " (Plaintiff) vs " + df + " (Defendant)"));
        } else if ("JURISDICTION".equalsIgnoreCase(sectionKey)) {
            list.add(new RenderContext("JURISDICTION", "That the Cause of Action arose within the territorial and pecuniary jurisdiction of this Hon'ble Court at " + cityStr + "."));
        } else if ("VALUATION_COURT_FEE".equalsIgnoreCase(sectionKey)) {
            list.add(new RenderContext("VALUATION", "The suit is valued for the purpose of court fee and jurisdiction under the Court Fees Act. Court fee is paid herewith."));
        } else if ("CAUSE_OF_ACTION".equalsIgnoreCase(sectionKey)) {
            list.add(new RenderContext("CAUSE_OF_ACTION", "The cause of action for the suit arose on the dates of default and transaction, within the territorial jurisdiction of this Hon'ble Court."));
        } else if ("VERIFICATION".equalsIgnoreCase(sectionKey)) {
            list.add(new RenderContext("VERIFICATION", "VERIFICATION: Verified at " + cityStr + " that the contents of paragraphs of the plaint are true to the best of my knowledge and legal advice."));
        } else if ("PROPERTY_SCHEDULE".equalsIgnoreCase(sectionKey)) {
            list.add(new RenderContext("PROPERTY_SCHEDULE", "SCHEDULE PROPERTY: All that piece and parcel of the schedule property situated within the jurisdiction of this Hon'ble Court."));
        } else if ("INTRO".equalsIgnoreCase(sectionKey)) {
            list.add(new RenderContext("INTRO", "May it please Your Honour,"));
        } else {
            list.add(new RenderContext(sectionKey, "[" + sectionKey + " Section Clause]"));
        }
        return list;
    }

    private void registerDefaultProviders() {
        // Cause title provider using typed Suit object
        providers.put("CAUSE_TITLE", context -> {
            List<RenderContext> list = new ArrayList<>();
            Suit suit = context == null ? null : context.getSuit();
            if (suit == null) return list;

            // Court Heading
            String courtName = suit.getCourt() != null ? suit.getCourt().toUpperCase() : "____";
            String city = suit.getCity() != null ? suit.getCity().toUpperCase() : "____";
            String courtHeader = String.format("IN THE COURT OF THE %s AT %s", courtName, city);

            list.add(new RenderContext("COURT_NAME", courtHeader));
            int causeYear = suit.getDate() != null
                    ? suit.getDate().toInstant().atZone(java.time.ZoneId.systemDefault()).getYear()
                    : Year.now().getValue();
            list.add(new RenderContext("COURT_NAME", "OS No. ____ OF " + causeYear));

            // Plaintiffs
            if (suit.getPlaintiffs() != null && !suit.getPlaintiffs().isEmpty()) {
                boolean numberPlaintiffs = suit.getPlaintiffs().size() > 1;
                for (int i = 0; i < suit.getPlaintiffs().size(); i++) {
                    Party plaintiff = suit.getPlaintiffs().get(i);
                    String prefix = numberPlaintiffs ? (i + 1) + ". " : "";
                    list.add(new RenderContext("PARTY_NAME", prefix + plaintiff.toString()));
                }
                list.add(new RenderContext("PARTY_TAG", "... " + (suit.getPlaintiffs().size() > 1 ? "Plaintiffs" : "Plaintiff")));
            }

            // Divider
            list.add(new RenderContext("SECTION_DIVIDER", "AND"));

            // Defendants
            if (suit.getDefendants() != null && !suit.getDefendants().isEmpty()) {
                for (Party defendant : suit.getDefendants()) {
                    list.add(new RenderContext("PARTY_NAME", defendant.toString()));
                }
                list.add(new RenderContext("PARTY_TAG", "... Defendants"));
            }

            list.add(new RenderContext("CAUSE_TITLE_DETAIL", "PLAINT FILED UNDER: " + filedUnder(suit.getSuitType())));
            list.add(new RenderContext("CAUSE_TITLE_DETAIL", "CLAIM: " + claimFor(suit)));

            return list;
        });
    }

    private String filedUnder(String suitType) {
        if (suitType == null) {
            return "THE RELEVANT PROVISIONS OF LAW";
        }
        String normalizedType = suitType.toUpperCase();
        return FILING_LAWS.getOrDefault(normalizedType, normalizedType.replace('_', ' '));
    }

    private String claimFor(Suit suit) {
        if ("PLAINT_PARTITION".equalsIgnoreCase(suit.getSuitType())) {
            return "Partition and separate possession of the Schedule Property, with consequential reliefs and costs";
        }
        if (suit.getRelief() != null && !suit.getRelief().isBlank()) {
            return suit.getRelief();
        }
        return "As set out in the plaint";
    }
}
