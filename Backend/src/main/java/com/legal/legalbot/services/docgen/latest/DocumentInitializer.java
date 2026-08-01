package com.legal.legalbot.services.docgen.latest;

import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.openxmlformats.schemas.wordprocessingml.x2006.main.CTPageMar;
import org.openxmlformats.schemas.wordprocessingml.x2006.main.CTSectPr;

import com.legal.legalbot.services.docgen.internal.DocumentConfig;

public class DocumentInitializer {

    public static XWPFDocument createLegalDraftDocument() {
        return createLegalDraftDocument(DocumentConfig.legalDraftDefaults());
    }

    public static XWPFDocument createLegalDraftDocument(DocumentConfig config) {
        XWPFDocument document = new XWPFDocument();

        CTSectPr sectPr = document.getDocument().getBody().isSetSectPr()
                ? document.getDocument().getBody().getSectPr()
                : document.getDocument().getBody().addNewSectPr();

        CTPageMar pageMar = sectPr.isSetPgMar() ? sectPr.getPgMar() : sectPr.addNewPgMar();

        pageMar.setTop(java.math.BigInteger.valueOf(2160));
        pageMar.setBottom(java.math.BigInteger.valueOf(1440));
        pageMar.setLeft(java.math.BigInteger.valueOf(2520));
        pageMar.setRight(java.math.BigInteger.valueOf(1440));

        return document;
    }
}
