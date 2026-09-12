package com.legal.legalbot.services.docgen.latest;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.time.Year;

import com.legal.legalbot.model.Party;
import com.legal.legalbot.model.Property;
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
            if (suit != null && suit.getProperty() != null && !suit.getProperty().isEmpty()) {
                for (int index = 0; index < suit.getProperty().size(); index++) {
                    list.add(new RenderContext("PROPERTY_SCHEDULE", propertySchedule(suit.getProperty().get(index), index + 1)));
                }
            } else {
                list.add(new RenderContext("PROPERTY_SCHEDULE", "SCHEDULE PROPERTY: All that piece and parcel of the schedule property situated within the jurisdiction of this Hon'ble Court."));
            }
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

    private String propertySchedule(Property property, int index) {
        StringBuilder schedule = new StringBuilder("SCHEDULE PROPERTY - ").append(index).append(":\n");
        schedule.append("All that piece and parcel of the ")
                .append(propertyTypeLabel(property.getType()));

        if (property.getSyn() != null && !property.getSyn().isBlank()) {
            schedule.append(", bearing Survey No. ").append(property.getSyn());
        }
        if (property.getPlotNo() != null && !property.getPlotNo().isBlank()) {
            schedule.append(", Plot No. ").append(property.getPlotNo());
        }
        if (property.getFlatNo() != null && !property.getFlatNo().isBlank()) {
            schedule.append(", Flat No. ").append(property.getFlatNo());
        }
        if (property.getHn() != null && !property.getHn().isBlank()) {
            schedule.append(", Door/House No. ").append(property.getHn());
        }
        if (property.getAreaValue() != null && property.getAreaUnit() != null && !property.getAreaUnit().isBlank()) {
            schedule.append(", measuring ").append(property.getAreaValue()).append(" ")
                    .append(areaUnitLabel(property.getAreaUnit()));
            if ("ACRE".equalsIgnoreCase(property.getAreaUnit()) && property.getGuntas() != null) {
                schedule.append(" and ").append(property.getGuntas()).append(" Guntas");
            }
        } else if (property.getExtent() != null && !property.getExtent().isBlank()) {
            schedule.append(", measuring ").append(property.getExtent());
        }

        String location = labeledLocation(property);
        if (!location.isBlank()) {
            schedule.append(".\nSituated at: ").append(location);
        }

        String boundaries = joinBoundaries(property);
        if (!boundaries.isBlank()) {
            schedule.append(".\nBoundaries: ").append(boundaries);
        }
        return schedule.append('.').toString();
    }

    private String propertyTypeLabel(String type) {
        if (type == null || type.isBlank()) {
            return "schedule property";
        }
        return switch (type.toUpperCase()) {
            case "LAND" -> "agricultural land";
            case "PLOT" -> "open plot/site";
            case "HOUSE" -> "residential house/building";
            case "APARTMENT" -> "flat/apartment";
            case "COMMERCIAL" -> "commercial premises";
            default -> type;
        };
    }

    private String areaUnitLabel(String unit) {
        return switch (unit.toUpperCase()) {
            case "SQFT" -> "Square Feet";
            case "SQYD" -> "Square Yards";
            case "GUNTA" -> "Guntas";
            case "ACRE" -> "Acres";
            default -> unit;
        };
    }

    private String joinNonBlank(String... values) {
        return java.util.Arrays.stream(values)
                .filter(value -> value != null && !value.isBlank())
                .collect(java.util.stream.Collectors.joining(", "));
    }

    private String labeledLocation(Property property) {
        List<String> location = new ArrayList<>();
        addLocation(location, "Door/House No.", property.getHn());
        addLocation(location, "Flat No.", property.getFlatNo());
        addLocation(location, "Building", property.getBuildingName());
        addLocation(location, "Street", property.getStreet());
        addLocation(location, "Locality", property.getLocality());
        addLocation(location, "Village/Town", property.getVillageOrTown());
        addLocation(location, "Mandal", property.getMandal());
        addLocation(location, "District", property.getDistrict());
        addLocation(location, "State", property.getState());
        addLocation(location, "PIN", property.getPincode());
        return String.join(", ", location);
    }

    private void addLocation(List<String> location, String label, String value) {
        if (value != null && !value.isBlank()) {
            location.add(label + ": " + value);
        }
    }

    private String joinBoundaries(Property property) {
        List<String> boundaries = new ArrayList<>();
        addBoundary(boundaries, "North", property.getNorthBoundary());
        addBoundary(boundaries, "South", property.getSouthBoundary());
        addBoundary(boundaries, "East", property.getEastBoundary());
        addBoundary(boundaries, "West", property.getWestBoundary());
        return String.join("; ", boundaries);
    }

    private void addBoundary(List<String> boundaries, String direction, String value) {
        if (value != null && !value.isBlank()) {
            boundaries.add(direction + ": " + value);
        }
    }
}
