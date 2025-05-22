package com.legal.legalbot.services;
import java.io.IOException;
import java.util.ArrayList;

import org.springframework.stereotype.Service;
import org.w3c.dom.Document;

import com.legal.legalbot.model.Party;
import com.legal.legalbot.model.Suit;

@Service
public class DocGen {
    private Suit currentSuit;
    private DocWriter docWriter;
    private Document templates;
    public DocGen(Suit suit) throws Exception {
        currentSuit = suit;
        docWriter = new DocWriter();
        templates = loadTemplates("template.xml");
    }
    
    public void generateDoc(ArrayList<String> required_docs, Suit suit){

        if (required_docs.contains("Notice")){
            addShowCauseNotice();
        }
        if (required_docs.contains("Summons")){
            addSummons();
        }
        if (required_docs.contains("Verification Affidavit")){
            addVerificationAffidavit();
        }
        if (required_docs.contains("Address Affidavit")){
            addAddressAffidavit();
        }
        if (required_docs.contains("Minor Affidavit")){
            addMinorAffidavit();
        }
    }

    private void addAddressAffidavit() {
        addCauseTitle();
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'addAddressAffidavit'");
    }

    private void addMinorAffidavit() {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'addMinorAffidavit'");
    }

    private void addCauseTitle() {
        this.currentSuit.getDate();
    }
        public void addCauseTitle(boolean isLong, boolean isIA) {
        java.util.Map<String, Object> causeTitleData = currentSuit.toSuitMap(); // Use fully qualified name
        String templateName = isLong ? "longCausetitle" : "shortCausetitle";
        TemplateProcessor.processTemplate(templates, templateName, causeTitleData, docWriter);
    }

    public void addShowCauseNotice() {
        Party[] defendants = currentSuit.getDefendants();
        if (defendants != null) {
            for (Party defendant : defendants) {
                java.util.Map<String, Object> noticeData = currentSuit.toSuitMap();  // Use fully qualified name
                noticeData.put("defendant_name", defendant.toString());
                TemplateProcessor.processTemplate(templates, "show_cause_notice", noticeData, docWriter);
            }
        }
    }

    public void addVerificationAffidavit() {
        java.util.Map<String, Object> dataMap = currentSuit.toSuitMap(); // Use fully qualified name
        TemplateProcessor.processTemplate(templates, "verification_affidavit", dataMap, docWriter);
    }

    public void addSummons() {
        Party[] defendants = currentSuit.getDefendants();
        if (defendants != null) {
            for (Party defendant : defendants) {
               java.util.Map<String, Object> summonsData = currentSuit.toSuitMap(); // Use fully qualified name
                summonsData.put("defendant_name", defendant.toString());
                TemplateProcessor.processTemplate(templates, "summons", summonsData, docWriter);
            }
        }
    }

    public void generateDocument(String filePath) throws IOException {
        docWriter.generateDocument(filePath);
    }

    private org.w3c.dom.Document loadTemplates(String filePath) throws Exception { // Use fully qualified name
        javax.xml.parsers.DocumentBuilderFactory dbFactory = javax.xml.parsers.DocumentBuilderFactory.newInstance(); // Use fully qualified name
        javax.xml.parsers.DocumentBuilder dBuilder = dbFactory.newDocumentBuilder();  // Use fully qualified name
        org.w3c.dom.Document doc = dBuilder.parse(new java.io.File(filePath));  // Use fully qualified name
        doc.getDocumentElement().normalize();
        return doc;
    }
}
