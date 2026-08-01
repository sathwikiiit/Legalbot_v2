package com.legal.legalbot.services.docgen.legacy;

import java.io.FileOutputStream;
import java.io.IOException;
import java.math.BigInteger;

import org.apache.poi.xwpf.usermodel.ParagraphAlignment;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.apache.poi.xwpf.usermodel.XWPFParagraph;
import org.apache.poi.xwpf.usermodel.XWPFRun;
import org.openxmlformats.schemas.wordprocessingml.x2006.main.CTPageMar;
import org.openxmlformats.schemas.wordprocessingml.x2006.main.CTSectPr;

public class DocWriter {
    private XWPFDocument document;

    public DocWriter() {
        document = new XWPFDocument();
        setPageMargins();
    }

    private void setPageMargins() {
        CTSectPr sectPr = document.getDocument().getBody().isSetSectPr() 
            ? document.getDocument().getBody().getSectPr() 
            : document.getDocument().getBody().addNewSectPr();
        CTPageMar pageMar = sectPr.isSetPgMar() ? sectPr.getPgMar() : sectPr.addNewPgMar();
        
        pageMar.setTop(BigInteger.valueOf(2160));
        pageMar.setBottom(BigInteger.valueOf(1440));
        pageMar.setLeft(BigInteger.valueOf(2520));
        pageMar.setRight(BigInteger.valueOf(1440));
    }

    public void addParagraph(String text, String alignment, boolean bold, boolean underline, int fontSize, boolean isJustified, int firstLineIndent, int lineSpacing) {
        XWPFParagraph paragraph = document.createParagraph();
        
        if (alignment != null) {
            switch (alignment.toLowerCase()) {
                case "center":
                    paragraph.setAlignment(ParagraphAlignment.CENTER);
                    break;
                case "right":
                    paragraph.setAlignment(ParagraphAlignment.RIGHT);
                    break;
                case "left":
                    paragraph.setAlignment(ParagraphAlignment.LEFT);
                    break;
                case "both":
                case "justified":
                    paragraph.setAlignment(ParagraphAlignment.BOTH);
                    break;
                default:
                    paragraph.setAlignment(ParagraphAlignment.LEFT);
            }
        }
        
        if (isJustified) {
            paragraph.setAlignment(ParagraphAlignment.BOTH);
        }

        if (firstLineIndent > 0) {
            paragraph.setIndentFromLeft(firstLineIndent);
        }

        XWPFRun run = paragraph.createRun();
        run.setText(text);
        run.setBold(bold);
        if (underline) {
            run.setUnderline(org.apache.poi.xwpf.usermodel.UnderlinePatterns.SINGLE);
        }
        if (fontSize > 0) {
            run.setFontSize(fontSize);
        }
    }

    public void generateDocument(String filePath) throws IOException {
        try (FileOutputStream out = new FileOutputStream(filePath)) {
            document.write(out);
        }
    }
}
