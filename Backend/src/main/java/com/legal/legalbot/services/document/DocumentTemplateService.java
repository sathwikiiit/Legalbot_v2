package com.legal.legalbot.services.document;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.legal.legalbot.dto.document.DocumentTemplateDto;
import com.legal.legalbot.dto.document.SectionDefinitionDto;

@Service
public class DocumentTemplateService {

    public List<DocumentTemplateDto> getTemplates() {
        return List.of(
            getPlaintRecoveryTemplate(),
            getPlaintInjunctionTemplate(),
            getPlaintSpecificPerformanceTemplate(),
            getEvictionPetitionTemplate()
        );
    }

    public DocumentTemplateDto getTemplate(String templateKey) {
        if (templateKey == null || templateKey.isBlank()) {
            return getPlaintRecoveryTemplate();
        }

        switch (templateKey.toUpperCase()) {
            case "PLAINT_RECOVERY":
            case "DEFAULT_CIVIL_SUIT":
                return getPlaintRecoveryTemplate();
            case "PLAINT_INJUNCTION":
                return getPlaintInjunctionTemplate();
            case "PLAINT_SPECIFIC_PERFORMANCE":
                return getPlaintSpecificPerformanceTemplate();
            case "EVICTION_PETITION":
                return getEvictionPetitionTemplate();
            default:
                return getPlaintRecoveryTemplate(); // Fallback to default Recovery Plaint
        }
    }

    private DocumentTemplateDto getPlaintRecoveryTemplate() {
        return new DocumentTemplateDto(
            "PLAINT_RECOVERY",
            "Plaint - Suit for Recovery of Money (Order XXXVII CPC)",
            List.of(
                new SectionDefinitionDto("CAUSE_TITLE", "Court Jurisdiction & Forum Title", "STATIC", true, null, 100),
                new SectionDefinitionDto("FACTS", "Transaction Facts & Debt Default", "AI", true, "FACTS", 300),
                new SectionDefinitionDto("CAUSE_OF_ACTION", "Accrual of Cause of Action & Limitation", "STATIC", true, null, 400),
                new SectionDefinitionDto("JURISDICTION", "Territorial & Pecuniary Jurisdiction", "STATIC", true, null, 500),
                new SectionDefinitionDto("VALUATION_COURT_FEE", "Suit Valuation & Court Fee Particulars", "STATIC", true, null, 600),
                new SectionDefinitionDto("RELIEF", "Relief Claimed & Final Prayer Decree", "AI", true, "RELIEF", 700),
                new SectionDefinitionDto("VERIFICATION", "Verification Affidavit & Deponent Statement", "STATIC", true, null, 800)
            )
        );
    }

    private DocumentTemplateDto getPlaintInjunctionTemplate() {
        return new DocumentTemplateDto(
            "PLAINT_INJUNCTION",
            "Plaint - Declaration of Title & Permanent Injunction",
            List.of(
                new SectionDefinitionDto("CAUSE_TITLE", "Court Jurisdiction & Forum Title", "STATIC", true, null, 100),
                new SectionDefinitionDto("PARTIES", "Parties Particulars", "STATIC", true, null, 200),
                new SectionDefinitionDto("FACTS", "Title Facts & Interference Narrative", "AI", true, "FACTS", 300),
                new SectionDefinitionDto("PROPERTY_SCHEDULE", "Schedule Property Particulars", "STATIC", true, null, 400),
                new SectionDefinitionDto("CAUSE_OF_ACTION", "Cause of Action & Apprehension", "STATIC", true, null, 500),
                new SectionDefinitionDto("JURISDICTION", "Jurisdiction & Forum Competence", "STATIC", true, null, 600),
                new SectionDefinitionDto("VALUATION_COURT_FEE", "Suit Valuation & Fixed Court Fee", "STATIC", true, null, 700),
                new SectionDefinitionDto("RELIEF", "Injunction & Mandatory Relief Prayer", "AI", true, "RELIEF", 800),
                new SectionDefinitionDto("VERIFICATION", "Verification Affidavit", "STATIC", true, null, 900)
            )
        );
    }

    private DocumentTemplateDto getPlaintSpecificPerformanceTemplate() {
        return new DocumentTemplateDto(
            "PLAINT_SPECIFIC_PERFORMANCE",
            "Plaint - Specific Performance of Agreement to Sell",
            List.of(
                new SectionDefinitionDto("CAUSE_TITLE", "Court Jurisdiction & Forum Title", "STATIC", true, null, 100),
                new SectionDefinitionDto("PARTIES", "Parties Particulars", "STATIC", true, null, 200),
                new SectionDefinitionDto("FACTS", "Agreement to Sell & Breach Narrative", "AI", true, "FACTS", 300),
                new SectionDefinitionDto("PROPERTY_SCHEDULE", "Schedule Property Particulars", "STATIC", true, null, 400),
                new SectionDefinitionDto("READINESS_WILLINGNESS", "Readiness & Willingness (Sec 16(c))", "STATIC", true, null, 500),
                new SectionDefinitionDto("CAUSE_OF_ACTION", "Cause of Action & Legal Notice", "STATIC", true, null, 600),
                new SectionDefinitionDto("JURISDICTION", "Pecuniary & Territorial Jurisdiction", "STATIC", true, null, 700),
                new SectionDefinitionDto("VALUATION_COURT_FEE", "Valuation & Ad Valorem Court Fee", "STATIC", true, null, 800),
                new SectionDefinitionDto("RELIEF", "Specific Performance Decree Prayer", "AI", true, "RELIEF", 900),
                new SectionDefinitionDto("VERIFICATION", "Verification Affidavit", "STATIC", true, null, 1000)
            )
        );
    }

    private DocumentTemplateDto getEvictionPetitionTemplate() {
        return new DocumentTemplateDto(
            "EVICTION_PETITION",
            "Eviction Petition & Rent Arrears Recovery",
            List.of(
                new SectionDefinitionDto("CAUSE_TITLE", "Court / Rent Controller Forum Title", "STATIC", true, null, 100),
                new SectionDefinitionDto("PARTIES", "Landlord & Tenant Particulars", "STATIC", true, null, 200),
                new SectionDefinitionDto("FACTS", "Tenancy Agreement & Lease Default", "AI", true, "FACTS", 300),
                new SectionDefinitionDto("PROPERTY_SCHEDULE", "Demised Premises Particulars", "STATIC", true, null, 400),
                new SectionDefinitionDto("CAUSE_OF_ACTION", "Notice Termination & Cause of Action", "STATIC", true, null, 500),
                new SectionDefinitionDto("JURISDICTION", "Jurisdiction & Rent Control Forum", "STATIC", true, null, 600),
                new SectionDefinitionDto("VALUATION_COURT_FEE", "Court Fee Valuation", "STATIC", true, null, 700),
                new SectionDefinitionDto("RELIEF", "Eviction & Mesne Profits Decree Prayer", "AI", true, "RELIEF", 800),
                new SectionDefinitionDto("VERIFICATION", "Verification Affidavit", "STATIC", true, null, 900)
            )
        );
    }
}
