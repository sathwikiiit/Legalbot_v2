package com.legal.legalbot.services.docgen.internal;

public class DocumentConfig {
    private int firstLineIndentTwips = 720;
    private int lineSpacingTwips = 240;

    public static DocumentConfig legalDraftDefaults() {
        return new DocumentConfig();
    }

    public int getFirstLineIndentTwips() {
        return firstLineIndentTwips;
    }

    public void setFirstLineIndentTwips(int firstLineIndentTwips) {
        this.firstLineIndentTwips = firstLineIndentTwips;
    }

    public int getLineSpacingTwips() {
        return lineSpacingTwips;
    }

    public void setLineSpacingTwips(int lineSpacingTwips) {
        this.lineSpacingTwips = lineSpacingTwips;
    }
}
