import React from 'react';
import { DocumentTemplateDto } from '../types';
import { FileCode, ArrowRight, Layers, Sparkles } from 'lucide-react';

interface TemplateSelectorProps {
  templates: DocumentTemplateDto[];
  selectedTemplateKey: string;
  onSelectTemplate: (templateKey: string) => void;
  onInitializeDraft: () => void;
  isInitializing?: boolean;
}

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  templates,
  selectedTemplateKey,
  onSelectTemplate,
  onInitializeDraft,
  isInitializing = false
}) => {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-lg font-serif font-bold text-slate-900 flex items-center space-x-2">
            <FileCode className="w-5 h-5 text-amber-600" />
            <span>Select Document Drafting Template</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Choose standard court pleading format. Each template generates structured rule-based and AI-assisted sections.
          </p>
        </div>

        <button
          id="init-draft-btn"
          onClick={onInitializeDraft}
          disabled={isInitializing}
          className="bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs px-5 py-2.5 rounded-lg flex items-center space-x-2 transition shadow disabled:opacity-50"
        >
          {isInitializing ? (
            <span>Initializing Draft...</span>
          ) : (
            <>
              <Sparkles className="w-4 h-4 fill-slate-950" />
              <span>Initialize Suit Draft</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {templates.map(tmpl => {
          const isSelected = tmpl.templateKey === selectedTemplateKey;
          const ruleCount = tmpl.sections.filter(s => s.sourceType === 'RULE_BASED').length;
          const aiCount = tmpl.sections.filter(s => s.sourceType === 'AI_GENERATED' || s.sourceType === 'HYBRID').length;

          return (
            <div
              key={tmpl.templateKey}
              onClick={() => onSelectTemplate(tmpl.templateKey)}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                isSelected
                  ? 'border-amber-500 bg-amber-50/40 ring-2 ring-amber-500/20 shadow-md'
                  : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-slate-900 text-sm">{tmpl.displayName}</h3>
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 mt-0.5 ${
                  isSelected ? 'border-amber-600 bg-amber-600' : 'border-slate-300'
                }`}>
                  {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
              </div>

              <div className="mt-3 flex items-center space-x-3 text-xs text-slate-600">
                <span className="flex items-center space-x-1 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  <Layers className="w-3 h-3 text-slate-500" />
                  <span>{tmpl.sections.length} Sections</span>
                </span>
                <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200/60 font-medium">
                  {ruleCount} Rule-Based
                </span>
                <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded border border-purple-200/60 font-medium">
                  {aiCount} AI Assisted
                </span>
              </div>

              {/* Section titles preview */}
              <div className="mt-3 pt-3 border-t border-slate-200/60 space-y-1">
                {tmpl.sections.slice(0, 4).map(sec => (
                  <div key={sec.sectionKey} className="text-[11px] text-slate-500 flex items-center justify-between">
                    <span className="truncate">{sec.title}</span>
                    <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                      sec.sourceType === 'RULE_BASED'
                        ? 'bg-slate-100 text-slate-600'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {sec.sourceType}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
