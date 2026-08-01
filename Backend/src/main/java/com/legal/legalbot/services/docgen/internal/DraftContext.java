package com.legal.legalbot.services.docgen.internal;

import com.legal.legalbot.model.Suit;

public class DraftContext {
    private final Suit suit;

    public DraftContext(Suit suit) {
        this.suit = suit;
    }

    public Suit getSuit() {
        return suit;
    }
}
