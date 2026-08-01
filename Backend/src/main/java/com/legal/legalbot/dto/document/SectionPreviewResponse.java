package com.legal.legalbot.dto.document;

import java.util.List;

public class SectionPreviewResponse {
    private TaskResultDto taskResult;
    private List<RenderContextDto> renderContexts;

    public SectionPreviewResponse() {
    }

    public TaskResultDto getTaskResult() {
        return taskResult;
    }

    public void setTaskResult(TaskResultDto taskResult) {
        this.taskResult = taskResult;
    }

    public List<RenderContextDto> getRenderContexts() {
        return renderContexts;
    }

    public void setRenderContexts(List<RenderContextDto> renderContexts) {
        this.renderContexts = renderContexts;
    }
}
