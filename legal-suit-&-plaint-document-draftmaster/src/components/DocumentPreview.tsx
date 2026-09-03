import React, { useRef } from 'react';
import { SuitDto, DocumentTemplateDto, RenderContextDto } from '../types';
import { Download, Printer, FileText, CheckCircle2, ShieldCheck, Scale } from 'lucide-react';

interface DocumentPreviewProps {
  suit: SuitDto;
  template: DocumentTemplateDto;
  draftContexts: Record<string, RenderContextDto[]>;
  draftId: string;
}

export const DocumentPreview: React.FC<DocumentPreviewProps> = ({
  suit,
  template,
  draftContexts,
  draftId
}) => {
  const paperRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadTxt = async () => {
    try {
      const res = await fetch('/api/documents/build', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ draftId })
      });
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${suit.suitType || 'Suit'}_${suit.id}.txt`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      console.error('Download error:', err);
    }
  };

  const handleDownloadDocx = () => {
    // Generate Word HTML blob with legal document formatting
    const contentHtml = paperRef.current ? paperRef.current.innerHTML : '';
    const wordDocumentHtml = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>Legal Suit Plaint</title>
        <style>
          body { font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.6; margin: 1in; }
          .court-title { text-align: center; font-weight: bold; text-transform: uppercase; margin-bottom: 20px; }
          .cause-title { text-align: center; font-weight: bold; margin-bottom: 30px; }
          .section-block { margin-bottom: 20px; text-align: justify; }
          .prayer { font-weight: bold; }
        </style>
      </head>
      <body>
        ${contentHtml}
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff', wordDocumentHtml], {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PLAINT_${suit.id || 'draft'}.doc`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  // Compile full text across sections in sequence
  const compiledSections = template.sections.map(sec => {
    const contexts = draftContexts[sec.sectionKey] || [];
    return {
      section: sec,
      contexts
    };
  });

  return (
    <div className="space-y-6">
      {/* Control Action Toolbar */}
      <div className="bg-slate-900 text-slate-100 p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-amber-600/20 text-amber-400 rounded-lg border border-amber-500/30">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-sm text-amber-100">
              Court Pleading Live Document Engine
            </h3>
            <p className="text-xs text-slate-400">
              Draft ID: <span className="font-mono text-amber-300">{draftId}</span> • Standard Legal Paper Format
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
          <button
            onClick={handlePrint}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-3.5 py-2 rounded-lg flex items-center space-x-1.5 transition border border-slate-700"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save PDF</span>
          </button>

          <button
            onClick={handleDownloadDocx}
            className="bg-amber-600 hover:bg-amber-500 text-slate-950 text-xs font-bold px-4 py-2 rounded-lg flex items-center space-x-1.5 transition shadow"
          >
            <Download className="w-4 h-4" />
            <span>Download DOCX</span>
          </button>

          <button
            onClick={handleDownloadTxt}
            className="bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-semibold px-3.5 py-2 rounded-lg flex items-center space-x-1.5 transition border border-slate-700"
          >
            <FileText className="w-4 h-4" />
            <span>TXT Export</span>
          </button>
        </div>
      </div>

      {/* Realistic Legal A4 Paper Sheet */}
      <div className="bg-slate-200/80 p-4 sm:p-8 rounded-xl flex justify-center overflow-x-auto shadow-inner">
        <div
          ref={paperRef}
          className="bg-white text-slate-950 p-8 sm:p-14 rounded shadow-2xl border border-slate-300 w-full max-w-3xl font-serif text-sm leading-relaxed space-y-6 selection:bg-amber-200"
          style={{ minHeight: '1100px' }}
        >
          {/* Document Content Blocks */}
          {compiledSections.map(({ section, contexts }) => (
            <div key={section.sectionKey} className="space-y-3">
              {contexts.map((ctx, idx) => (
                <div
                  key={ctx.definitionKey || idx}
                  className={`text-slate-900 whitespace-pre-wrap ${
                    section.sectionKey === 'jurisdiction_title'
                      ? 'text-center font-bold tracking-wide uppercase font-serif border-b border-slate-200 pb-4'
                      : 'text-justify font-serif'
                  }`}
                >
                  {ctx.value}
                </div>
              ))}
            </div>
          ))}

          {/* Signature Block */}
          <div className="pt-12 border-t border-slate-300 mt-12 grid grid-cols-2 gap-8 text-xs font-serif">
            <div>
              <p className="font-bold text-slate-900 uppercase">ADVOCATE FOR PLAINTIFF(S)</p>
              <p className="text-slate-700 mt-1">{suit.lawyer}</p>
              <p className="text-slate-500 text-[11px] mt-0.5">High Court & Civil Courts Advocate</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-slate-900 uppercase">PLAINTIFF(S)</p>
              <p className="text-slate-700 mt-1">{suit.plaintiffs[0]?.name}</p>
              <p className="text-slate-500 text-[11px] mt-0.5">Deponent / Affiant</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
