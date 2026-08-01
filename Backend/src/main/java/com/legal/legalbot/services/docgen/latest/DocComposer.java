package com.legal.legalbot.services.docgen.latest;

import java.io.FileOutputStream;
import java.io.OutputStream;
import java.util.List;

import org.apache.poi.xwpf.usermodel.XWPFDocument;

import com.legal.legalbot.model.Suit;
import com.legal.legalbot.services.docgen.internal.DraftContext;
import com.legal.legalbot.services.docgen.internal.RenderContext;

public class DocComposer {

    private final ProviderRegistry providerRegistry;
    private final RenderDefinitionRegistry renderRegistry;

    public DocComposer(ProviderRegistry providerRegistry, RenderDefinitionRegistry renderRegistry) {
        this.providerRegistry = providerRegistry;
        this.renderRegistry = renderRegistry;
    }

    public DocComposer() {
        this(new ProviderRegistry(), new RenderDefinitionRegistry());
    }

    public void composeDocument(Suit suit, String sectionKey, String outputPath) throws Exception {
        DraftContext draftContext = new DraftContext(suit);
        List<RenderContext> renderContexts = providerRegistry.executeProvider(sectionKey, draftContext);

        try (XWPFDocument document = DocumentInitializer.createLegalDraftDocument();
             OutputStream os = new FileOutputStream(outputPath)) {

            for (RenderContext rc : renderContexts) {
                renderRegistry.render(rc, document);
            }

            document.write(os);
        }
    }

    public void composeDocumentFromContexts(List<RenderContext> renderContexts, String outputPath) throws Exception {
        try (XWPFDocument document = DocumentInitializer.createLegalDraftDocument();
             OutputStream os = new FileOutputStream(outputPath)) {

            for (RenderContext rc : renderContexts) {
                renderRegistry.render(rc, document);
            }

            document.write(os);
        }
    }
}
