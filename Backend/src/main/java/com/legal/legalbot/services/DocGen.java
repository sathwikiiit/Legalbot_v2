package com.legal.legalbot.services;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import org.w3c.dom.Document;

import com.legal.legalbot.model.Party;
import com.legal.legalbot.model.Suit;

public class DocGen {
    private Suit currentSuit;
    private DocWriter docWriter;
    private Document templates;
    public DocGen(Suit suit) throws Exception {
        currentSuit = suit;
        docWriter = new DocWriter();
        try (InputStream is = getClass().getClassLoader().getResourceAsStream("static/template.xml")) {
            if (is == null) {
                throw new IOException("template.xml not found in resources/static/");
            }
            DocumentBuilderFactory dbFactory = DocumentBuilderFactory.newInstance();
            DocumentBuilder dBuilder = dbFactory.newDocumentBuilder();
            templates = dBuilder.parse(is);
            templates.getDocumentElement().normalize();
        }
    }
    
    public void generateDoc(ArrayList<String> required_docs, Suit suit, String filePath) throws IOException{

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
        docWriter.generateDocument(filePath);
    }

    private void addAddressAffidavit() {
        Map<String, Object> addressAffidavitData = currentSuit.toSuitMap(); 
        TemplateProcessor.processTemplate(templates, "address_affidavit", addressAffidavitData, docWriter);
    }

    private void addMinorAffidavit() {
        Map<String, Object> minorAffidavitData = currentSuit.toSuitMap(); 
        TemplateProcessor.processTemplate(templates, "minor_affidavit", minorAffidavitData, docWriter);
    }

    public void addCauseTitle(boolean isLong, boolean isIA) {
        java.util.Map<String, Object> causeTitleData = currentSuit.toSuitMap(); 
        String templateName = isLong ? "longCausetitle" : "shortCausetitle";
        TemplateProcessor.processTemplate(templates, templateName, causeTitleData, docWriter);
    }

    public void addShowCauseNotice() {
        List<Party> defendants = currentSuit.getDefendants();
        if (defendants != null) {
            for (Party defendant : defendants) {
                java.util.Map<String, Object> noticeData = currentSuit.toSuitMap();  
                noticeData.put("defendant_name", defendant.toString());
                TemplateProcessor.processTemplate(templates, "show_cause_notice", noticeData, docWriter);
            }
        }
    }

    public void addVerificationAffidavit() {
        java.util.Map<String, Object> dataMap = currentSuit.toSuitMap(); 
        TemplateProcessor.processTemplate(templates, "verification_affidavit", dataMap, docWriter);
    }

    public void addSummons() {
        List<Party> defendants = currentSuit.getDefendants();
        if (defendants != null) {
            for (Party defendant : defendants) {
               java.util.Map<String, Object> summonsData = currentSuit.toSuitMap(); 
                summonsData.put("defendant_name", defendant.toString());
                TemplateProcessor.processTemplate(templates, "summons", summonsData, docWriter);
            }
        }
    }
}
