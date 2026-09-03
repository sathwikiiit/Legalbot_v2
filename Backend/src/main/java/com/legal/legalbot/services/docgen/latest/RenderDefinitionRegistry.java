package com.legal.legalbot.services.docgen.latest;

import java.math.BigInteger;
import java.util.HashMap;
import java.util.Map;
import java.util.function.BiConsumer;

import org.apache.poi.xwpf.usermodel.ParagraphAlignment;
import org.apache.poi.xwpf.usermodel.XWPFAbstractNum;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.apache.poi.xwpf.usermodel.XWPFNumbering;
import org.apache.poi.xwpf.usermodel.XWPFParagraph;
import org.apache.poi.xwpf.usermodel.XWPFRun;
import org.openxmlformats.schemas.wordprocessingml.x2006.main.CTAbstractNum;
import org.openxmlformats.schemas.wordprocessingml.x2006.main.CTLvl;
import org.openxmlformats.schemas.wordprocessingml.x2006.main.STNumberFormat;

import com.legal.legalbot.services.docgen.internal.DocumentConfig;
import com.legal.legalbot.services.docgen.internal.RenderContext;

public class RenderDefinitionRegistry {
    private final Map<String, BiConsumer<RenderContext, XWPFDocument>> definitions = new HashMap<>();
    private final Map<String, BigInteger> listNumIds = new HashMap<>();
    private final DocumentConfig config = DocumentConfig.legalDraftDefaults();

    public RenderDefinitionRegistry() {
        registerDefinitions();
    }

    public void render(RenderContext context, XWPFDocument document) {
        if (context == null || document == null) return;
        BiConsumer<RenderContext, XWPFDocument> renderer = definitions.get(context.getDefinitionKey());
        if (renderer != null) {
            renderer.accept(context, document);
        } else {
            XWPFParagraph paragraph = document.createParagraph();
            XWPFRun run = paragraph.createRun();
            run.setText(context.getValue());
        }
    }

    private void registerDefinitions() {
        definitions.put("NUM_BEGINNING", (context, document) -> {
            String listType = context.getContext();
            if (listType != null && !listType.isBlank()) {
                resetList(listType.trim().toUpperCase());
            } else {
                listNumIds.clear();
            }
        });

        definitions.put("COURT_NAME", (context, document) -> {
            String courtName = context.getContext();
            XWPFParagraph paragraph = document.createParagraph();
            paragraph.setAlignment(ParagraphAlignment.CENTER);
            XWPFRun run = paragraph.createRun();
            run.setBold(true);
            run.setText(courtName);
        });

        definitions.put("PARTY_NAME", (context, document) -> {
            String partyName = context.getContext();
            XWPFParagraph paragraph = document.createParagraph();
            paragraph.setAlignment(ParagraphAlignment.LEFT);
            XWPFRun run = paragraph.createRun();
            run.setText(partyName);
        });

        definitions.put("PARTY_TAG", (context, document) -> {
            String partyTag = context.getContext();
            XWPFParagraph paragraph = document.createParagraph();
            paragraph.setAlignment(ParagraphAlignment.RIGHT);
            XWPFRun run = paragraph.createRun();
            run.setBold(true);
            run.setText(partyTag);
        });

        definitions.put("SECTION_DIVIDER", (context, document) -> {
            String divider = context.getContext();
            XWPFParagraph paragraph = document.createParagraph();
            paragraph.setAlignment(ParagraphAlignment.CENTER);
            XWPFRun run = paragraph.createRun();
            run.setBold(true);
            run.setText(divider);
        });

        definitions.put("DOCUMENT_TITLE", (context, document) -> {
            String documentTitle = context.getContext();
            XWPFParagraph paragraph = document.createParagraph();
            paragraph.setAlignment(ParagraphAlignment.CENTER);
            XWPFRun run = paragraph.createRun();
            run.setBold(true);
            run.setText(documentTitle);
        });

        definitions.put("PARTY_FULL_DETAILS", (context, document) -> {
            String partyDetails = context.getContext();
            XWPFParagraph paragraph = document.createParagraph();
            paragraph.setAlignment(ParagraphAlignment.LEFT);
            XWPFRun run = paragraph.createRun();
            run.setText(partyDetails);
        });

        definitions.put("FACTS_INTRO", (context, document) -> {
            String factsIntro = context.getContext();
            XWPFParagraph paragraph = document.createParagraph();
            paragraph.setAlignment(ParagraphAlignment.BOTH);
            paragraph.setIndentFromLeft(config.getFirstLineIndentTwips());
            XWPFRun run = paragraph.createRun();
            run.setText(factsIntro);
        });

        definitions.put("FACTS", (context, document) -> {
            String facts = context.getContext();
            createListItem(document, facts, "FACTS", true);
        });

        definitions.put("RELIEF", (context, document) -> {
            String relief = context.getContext();
            createListItem(document, relief, "RELIEF", false);
        });
    }

    private void createListItem(XWPFDocument document, String text, String listType, boolean numbered) {
        BigInteger numId = listNumIds.computeIfAbsent(listType, key -> createList(document, numbered));
        XWPFParagraph paragraph = document.createParagraph();
        paragraph.setNumID(numId);
        paragraph.setAlignment(ParagraphAlignment.BOTH);
        XWPFRun run = paragraph.createRun();
        run.setText(text);
    }

    private BigInteger createList(XWPFDocument document, boolean numbered) {
        XWPFNumbering numbering = document.createNumbering();
        CTAbstractNum abstractNum = CTAbstractNum.Factory.newInstance();
        CTLvl lvl = abstractNum.addNewLvl();
        lvl.setIlvl(BigInteger.ZERO);
        lvl.addNewNumFmt().setVal(numbered ? STNumberFormat.DECIMAL : STNumberFormat.BULLET);
        lvl.addNewLvlText().setVal(numbered ? "%1." : "•");

        return numbering.addNum(numbering.addAbstractNum(new XWPFAbstractNum(abstractNum)));
    }

    private void resetList(String listType) {
        listNumIds.remove(listType);
    }
}
