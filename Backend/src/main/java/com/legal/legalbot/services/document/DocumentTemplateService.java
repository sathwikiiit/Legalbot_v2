package com.legal.legalbot.services.document;

import java.util.List;

import org.springframework.stereotype.Service;

import com.legal.legalbot.dto.document.DocumentTemplateDto;
import com.legal.legalbot.dto.document.SectionDefinitionDto;

@Service
public class DocumentTemplateService {

    public List<DocumentTemplateDto> getTemplates() {
        return List.of(getDefaultCivilSuitTemplate());
    }

    public DocumentTemplateDto getTemplate(String templateKey) {
        if ("default_civil_suit".equalsIgnoreCase(templateKey)) {
            return getDefaultCivilSuitTemplate();
        }
        return null;
    }

    private DocumentTemplateDto getDefaultCivilSuitTemplate() {
        return new DocumentTemplateDto(
                "default_civil_suit",
                "Civil Suit Draft",
                List.of(
                        new SectionDefinitionDto("CAUSE_TITLE", "Cause Title", "STATIC", true, null, 100),
                        new SectionDefinitionDto("FACTS", "Facts", "AI", true, "FACTS", 200),
                        new SectionDefinitionDto("RELIEF", "Relief", "AI", true, "RELIEF", 300)
                )
        );
    }
}
