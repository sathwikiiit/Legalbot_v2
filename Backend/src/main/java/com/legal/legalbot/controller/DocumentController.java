package com.legal.legalbot.controller;

import java.io.File;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;

import com.legal.legalbot.dto.document.AiStepRequest;
import com.legal.legalbot.dto.document.BuildDocumentRequest;
import com.legal.legalbot.dto.document.DocumentTemplateDto;
import com.legal.legalbot.dto.document.InitializeDocumentRequest;
import com.legal.legalbot.dto.document.InitializeDocumentResponse;
import com.legal.legalbot.dto.document.RenderContextDto;
import com.legal.legalbot.dto.document.SectionDefinitionDto;
import com.legal.legalbot.dto.document.SectionPreviewRequest;
import com.legal.legalbot.dto.document.SectionPreviewResponse;
import com.legal.legalbot.dto.document.SectionUpdateRequest;
import com.legal.legalbot.dto.document.TaskResultDto;
import com.legal.legalbot.services.document.DocumentDraftService;
import com.legal.legalbot.services.document.DocumentTemplateService;
import com.legal.legalbot.services.document.DocumentWorkflowService;

@RestController
@RequestMapping("/api/documents")
public class DocumentController {

    private final DocumentTemplateService templateService;
    private final DocumentWorkflowService workflowService;
    private final DocumentDraftService draftService;

    public DocumentController(DocumentTemplateService templateService,
                              DocumentWorkflowService workflowService,
                              DocumentDraftService draftService) {
        this.templateService = templateService;
        this.workflowService = workflowService;
        this.draftService = draftService;
    }

    @GetMapping("/templates")
    public List<DocumentTemplateDto> getTemplates() {
        return templateService.getTemplates();
    }

    @GetMapping("/templates/{templateKey}")
    public DocumentTemplateDto getTemplate(@PathVariable String templateKey) {
        return templateService.getTemplate(templateKey);
    }

    @PostMapping("/initialize")
    public InitializeDocumentResponse initializeDraft(@RequestBody InitializeDocumentRequest request) {
        String draftId = workflowService.initializeDraft(request.getDocumentType(), request.getSuitDto());
        Map<String, List<RenderContextDto>> sectionContexts = new HashMap<>();
        DocumentTemplateDto template = templateService.getTemplate(request.getDocumentType());
        if (template != null) {
            for (SectionDefinitionDto section : template.getSections()) {
                if ("STATIC".equalsIgnoreCase(section.getSourceType())) {
                    sectionContexts.put(section.getSectionKey(), workflowService.getStaticSectionContexts(section.getSectionKey(), request.getSuitDto()));
                }
            }
        }
        InitializeDocumentResponse response = new InitializeDocumentResponse();
        response.setDraftId(draftId);
        response.setTemplate(template);
        response.setInitialSectionContexts(sectionContexts);
        return response;
    }

    @PostMapping("/sections/preview")
    public SectionPreviewResponse previewSection(@RequestBody SectionPreviewRequest request) {
        SectionPreviewResponse response = new SectionPreviewResponse();
        if ("AI" .equalsIgnoreCase(getSectionSourceType(request))) {
            AiStepRequest aiRequest = new AiStepRequest();
            aiRequest.setDraftId(request.getDraftId());
            aiRequest.setDocumentType(request.getDocumentType());
            aiRequest.setSectionKey(request.getSectionKey());
            aiRequest.setTaskKey(getSectionTaskKey(request));
            aiRequest.setConversationHistory(request.getConversationHistory());
            aiRequest.setSuitDto(request.getSuitDto());
            TaskResultDto result = workflowService.runAiSection(aiRequest);
            response.setTaskResult(result);
            response.setRenderContexts(result.getRenderContexts());
        } else {
            response.setRenderContexts(workflowService.getStaticSectionContexts(request.getSectionKey(), request.getSuitDto()));
        }
        return response;
    }

    @PutMapping("/sections/update")
    public List<RenderContextDto> updateSectionContexts(@RequestBody SectionUpdateRequest request) {
        return workflowService.saveSectionContexts(request.getDraftId(), request.getSectionKey(), request.getRenderContexts());
    }

    @PostMapping("/ai/step")
    public TaskResultDto aiStep(@RequestBody AiStepRequest request) {
        return workflowService.runAiSection(request);
    }

    @PostMapping("/build")
    public ResponseEntity<Resource> buildDocument(@RequestBody BuildDocumentRequest request) throws Exception {
        String outputPath = System.getProperty("java.io.tmpdir") + File.separator + "generated_" + request.getDraftId() + ".docx";
        if (request.getRenderContexts() != null) {
            workflowService.saveSectionContexts(request.getDraftId(), request.getSectionKey(), request.getRenderContexts());
        }
        workflowService.buildDocument(request.getDraftId(), outputPath);
        FileSystemResource resource = new FileSystemResource(outputPath);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=Legalbot_Document.docx")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.wordprocessingml.document"))
                .body(resource);
    }

    @GetMapping("/drafts/{draftId}")
    public Map<String, List<RenderContextDto>> getDraft(@PathVariable String draftId) {
        return draftService.getSectionContexts(draftId);
    }

    private String getSectionSourceType(SectionPreviewRequest request) {
        DocumentTemplateDto template = templateService.getTemplate(request.getDocumentType());
        if (template == null) return "STATIC";
        return template.getSections().stream()
                .filter(s -> s.getSectionKey().equalsIgnoreCase(request.getSectionKey()))
                .findFirst()
                .map(SectionDefinitionDto::getSourceType)
                .orElse("STATIC");
    }

    private String getSectionTaskKey(SectionPreviewRequest request) {
        DocumentTemplateDto template = templateService.getTemplate(request.getDocumentType());
        if (template == null) return null;
        return template.getSections().stream()
                .filter(s -> s.getSectionKey().equalsIgnoreCase(request.getSectionKey()))
                .findFirst()
                .map(SectionDefinitionDto::getTaskKey)
                .orElse(null);
    }
}
