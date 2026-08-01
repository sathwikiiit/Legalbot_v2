package com.legal.legalbot.dto.document;

import java.util.List;

public class TaskResultDto {
    public enum Status {
        NEEDS_INFO,
        COMPLETE
    }

    private Status status;
    private String question;
    private List<RenderContextDto> renderContexts;

    public TaskResultDto() {
    }

    public TaskResultDto(Status status, String question, List<RenderContextDto> renderContexts) {
        this.status = status;
        this.question = question;
        this.renderContexts = renderContexts;
    }

    public Status getStatus() {
        return status;
    }

    public void setStatus(Status status) {
        this.status = status;
    }

    public String getQuestion() {
        return question;
    }

    public void setQuestion(String question) {
        this.question = question;
    }

    public List<RenderContextDto> getRenderContexts() {
        return renderContexts;
    }

    public void setRenderContexts(List<RenderContextDto> renderContexts) {
        this.renderContexts = renderContexts;
    }
}
