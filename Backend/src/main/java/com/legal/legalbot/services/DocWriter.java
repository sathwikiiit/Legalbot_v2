package com.legal.legalbot.services;
import org.apache.poi.xwpf.usermodel.*;
import org.openxmlformats.schemas.wordprocessingml.x2006.main.*;

import java.io.FileOutputStream;
import java.io.IOException;
import java.math.BigInteger;
import java.util.List;

// Class for document writing
class DocWriter {
    private XWPFDocument document;

    public DocWriter() {
        document = new XWPFDocument();
        setDocumentMargins(1.0);
    }

    private void setDocumentMargins(double marginInches) {
        CTSectPr sectPr = document.getDocument().getBody().addNewSectPr();
        CTPageMar pageMar = sectPr.addNewPgMar();
        int marginTwips = (int) (marginInches * 1440);
        pageMar.setTop(BigInteger.valueOf(marginTwips));
        pageMar.setLeft(BigInteger.valueOf(marginTwips));
        pageMar.setRight(BigInteger.valueOf(marginTwips));
        pageMar.setBottom(BigInteger.valueOf(marginTwips));
    }

    void setDefaultStyle(XWPFDocument document) {
        CTStyles ctStyles = CTStyles.Factory.newInstance();

        // --- 1.  Get or Create CTDocDefaults ---
        CTDocDefaults docDefaults = ctStyles.isSetDocDefaults() ? ctStyles.getDocDefaults() : ctStyles.addNewDocDefaults();

        // --- 2.  Set Default Font (CTRPrDefault) ---
        CTRPrDefault rPrDefault;
        if (docDefaults.isSetRPrDefault()) {
            rPrDefault = docDefaults.getRPrDefault();
        } else {
            rPrDefault = docDefaults.addNewRPrDefault();
        }
        CTFonts fonts =  rPrDefault.addNewRPr().addNewRFonts();
        fonts.setAscii("Times New Roman");

        // --- 3. Set Default Paragraph Properties (CTPPrDefault) ---
        CTPPrDefault pPrDefault;
        if (docDefaults.isSetPPrDefault()) {
            pPrDefault = docDefaults.getPPrDefault();
        } else {
            pPrDefault = docDefaults.addNewPPrDefault();
        }
        CTSpacing spacing = pPrDefault.addNewPPr().addNewSpacing();
        spacing.setLine(BigInteger.valueOf(360));
        spacing.setLineRule(STLineSpacingRule.AUTO);
        spacing.setBefore(BigInteger.valueOf(0));
        spacing.setAfter(BigInteger.valueOf(0));
    }

    public XWPFParagraph addParagraph(String text) {
        return addParagraph(text, false, "L", false, false);
    }

    public XWPFParagraph addParagraph(String text, boolean bold, String align, boolean indent) {
        return addParagraph(text, bold, align, indent, false);
    }

    public XWPFParagraph addParagraph(String text, boolean bold, String align, boolean indent, boolean underlined) {
        XWPFParagraph xwpfParagraph = document.createParagraph();
        if (text != null) {
            XWPFRun run = xwpfParagraph.createRun();
            run.setText(text);
            run.setBold(bold);
            run.setUnderline(underlined ? UnderlinePatterns.DASH : UnderlinePatterns.NONE);
            xwpfParagraph.setIndentFromLeft(indent?450:0 );
            xwpfParagraph.setIndentFromRight(indent?1000:0);

        }
        if (align != null) {
            switch (align) {
                case "C":
                    xwpfParagraph.setAlignment(ParagraphAlignment.CENTER);
                    break;
                case "L":
                    xwpfParagraph.setAlignment(ParagraphAlignment.LEFT);
                    break;
                case "R":
                    xwpfParagraph.setAlignment(ParagraphAlignment.RIGHT);
                    break;
                case "J":
                    xwpfParagraph.setAlignment(ParagraphAlignment.DISTRIBUTE);
                    break;
                default:
                    xwpfParagraph.setAlignment(ParagraphAlignment.DISTRIBUTE);
                    break;
            }
        }
        return xwpfParagraph;
    }
    public void addPageBreak() {
        this.addParagraph("").setPageBreak(true);
    }

    public void addListParagraph(List<String> texts, boolean bold, int level) {
        if (texts != null) {
            XWPFNumbering numbering = document.createNumbering();
            CTAbstractNum abstractNum = CTAbstractNum.Factory.newInstance();
            CTLvl lvl = abstractNum.addNewLvl();
            lvl.setIlvl(BigInteger.valueOf(0));

            // Set numbering format based on level
            switch (level) {
                case 1:
                    lvl.addNewNumFmt().setVal(STNumberFormat.DECIMAL);
                    lvl.addNewLvlText().setVal("%1.");
                    break;
                case 2:
                    lvl.addNewNumFmt().setVal(STNumberFormat.UPPER_ROMAN);
                    lvl.addNewLvlText().setVal("%I.");
                    break;
                case 3:
                    lvl.addNewNumFmt().setVal(STNumberFormat.UPPER_LETTER);
                    lvl.addNewLvlText().setVal("%A.");
                    break;
                case 4:
                    lvl.addNewNumFmt().setVal(STNumberFormat.LOWER_LETTER);
                    lvl.addNewLvlText().setVal("%a.");
                    break;
                case 5:
                    lvl.addNewNumFmt().setVal(STNumberFormat.DECIMAL);
                    lvl.addNewLvlText().setVal("%1.");
                    break;
                default:
                    lvl.addNewNumFmt().setVal(STNumberFormat.DECIMAL);
                    lvl.addNewLvlText().setVal("%1.");
                    break;
            }

            BigInteger numId = numbering.addNum(numbering.addAbstractNum(new org.apache.poi.xwpf.usermodel.XWPFAbstractNum(abstractNum)));

            for (String text : texts) {
                XWPFParagraph paragraph = document.createParagraph();
                paragraph.setNumID(numId);
                XWPFRun run = paragraph.createRun();
                run.setText(text);
                run.setBold(bold);
                if (level == 1) {
                    paragraph.setIndentationFirstLine(0);
                    paragraph.setIndentationLeft(450);
                    paragraph.setIndentationRight(1000);
                } else if (level == 5){
                    paragraph.setIndentationFirstLine(0);
                    paragraph.setIndentationLeft(0);
                    paragraph.setIndentationRight(0);
                }
            }
        }
    }
    public void generateDocument(String filePath) throws IOException {
        try (FileOutputStream outputStream = new FileOutputStream(filePath)) {
            document.write(outputStream);
        }
    }

}

