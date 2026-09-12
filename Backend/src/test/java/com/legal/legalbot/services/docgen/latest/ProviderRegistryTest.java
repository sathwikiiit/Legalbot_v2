package com.legal.legalbot.services.docgen.latest;

import static org.junit.jupiter.api.Assertions.assertTrue;

import java.math.BigDecimal;
import java.util.List;

import org.junit.jupiter.api.Test;

import com.legal.legalbot.model.Property;
import com.legal.legalbot.model.Suit;

class ProviderRegistryTest {

    @Test
    void rendersNumberedPropertyScheduleWithLocationAreaAndBoundaries() {
        Property property = new Property();
        property.setType("LAND");
        property.setSyn("142/A");
        property.setAreaValue(new BigDecimal("2"));
        property.setAreaUnit("ACRE");
        property.setGuntas(new BigDecimal("15"));
        property.setVillageOrTown("Lakshmipuram");
        property.setMandal("Mandal One");
        property.setDistrict("District One");
        property.setNorthBoundary("Road");
        property.setSouthBoundary("Ramesh's land");
        property.setEastBoundary("Canal");
        property.setWestBoundary("Survey No. 143");

        Suit suit = new Suit();
        suit.setProperty(List.of(property));

        String schedule = new ProviderRegistry()
                .executeProvider("PROPERTY_SCHEDULE", new com.legal.legalbot.services.docgen.internal.DraftContext(suit))
                .get(0)
                .getValue();

        assertTrue(schedule.contains("SCHEDULE PROPERTY - 1"));
        assertTrue(schedule.contains("Survey No. 142/A"));
        assertTrue(schedule.contains("2 Acres and 15 Guntas"));
        assertTrue(schedule.contains("Village/Town: Lakshmipuram"));
        assertTrue(schedule.contains("Mandal: Mandal One"));
        assertTrue(schedule.contains("District: District One"));
        assertTrue(schedule.contains("North: Road"));
        assertTrue(schedule.contains("West: Survey No. 143"));
    }
}