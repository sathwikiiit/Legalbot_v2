package com.legal.legalbot.services.docgen.latest;

import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.junit.jupiter.api.Test;
import org.openxmlformats.schemas.wordprocessingml.x2006.main.CTPageMar;

import static org.junit.jupiter.api.Assertions.*;

class DocumentInitializerTest {

    @Test
    void testCreateLegalDraftDocumentSetsMarginsCorrectly() {
        XWPFDocument doc = DocumentInitializer.createLegalDraftDocument();
        assertNotNull(doc);

        CTPageMar margins = doc.getDocument().getBody().getSectPr().getPgMar();
        assertNotNull(margins);

        assertEquals("2160", String.valueOf(margins.getTop()));
        assertEquals("1440", String.valueOf(margins.getBottom()));
        assertEquals("2520", String.valueOf(margins.getLeft()));
        assertEquals("1440", String.valueOf(margins.getRight()));
    }
}
