import React from 'react';
import { SectionDefinitionDto, RenderContextDto } from '../types';
import { CheckCircle2, Circle, Sparkles, FileText, ArrowRight, ArrowLeft } from 'lucide-react';

interface SectionStepperProps {
  sections: SectionDefinitionDto[];
  activeSectionKey: string;
  onSelectSection: (sectionKey: string) => void;
  draftContexts: Record<string, RenderContextDto[]>;
}

export const SectionStepper: React.FC<SectionStepperProps> = ({
  sections,
  activeSectionKey,
  onSelectSection,
  draftContexts
}) => {
  const activeIndex = sections.findIndex(s => s.sectionKey === activeSectionKey);

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h3 className="font-semibold text-slate-900 text-xs uppercase tracking-wider flex items-center space-x-2">
          <FileText className="w-4 h-4 text-amber-600" />
          <span>Plaint Section Sequence</span>
        </h3>
        <span className="text-xs text-slate-500 font-medium">
          Step {activeIndex + 1} of {sections.length}
        </span>
      </div>

      {/* Stepper Pills List */}
      <div className="flex flex-col space-y-2">
        {sections.map((sec, idx) => {
          const isActive = sec.sectionKey === activeSectionKey;
          const hasContent = draftContexts[sec.sectionKey]?.some(c => c.value && c.value.trim().length > 10);
          const isAi = sec.sourceType === 'AI_GENERATED' || sec.sourceType === 'HYBRID';

          return (
            <button
              key={sec.sectionKey}
              onClick={() => onSelectSection(sec.sectionKey)}
              className={`w-full p-3 rounded-lg text-left transition flex items-center justify-between border ${
                isActive
                  ? 'bg-amber-50 border-amber-500 text-slate-900 font-medium shadow-sm'
                  : 'bg-slate-50/70 hover:bg-slate-100 border-slate-200 text-slate-700'
              }`}
            >
              <div className="flex items-center space-x-3 truncate">
                <div className="flex-shrink-0">
                  {hasContent ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : isActive ? (
                    <Circle className="w-4 h-4 text-amber-600 fill-amber-100" />
                  ) : (
                    <Circle className="w-4 h-4 text-slate-300" />
                  )}
                </div>
                <div className="truncate">
                  <div className="text-xs font-semibold text-slate-800 truncate">{sec.title}</div>
                  <div className="text-[10px] text-slate-400 font-mono">{sec.taskKey}</div>
                </div>
              </div>

              <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
                {isAi && (
                  <span className="text-[10px] bg-purple-100 text-purple-800 font-semibold px-2 py-0.5 rounded flex items-center space-x-1 border border-purple-200">
                    <Sparkles className="w-3 h-3" />
                    <span>AI</span>
                  </span>
                )}
                <span className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                  hasContent ? 'bg-emerald-100 text-emerald-800 font-medium' : 'bg-slate-200 text-slate-600'
                }`}>
                  {hasContent ? 'Ready' : 'Pending'}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
        <button
          onClick={() => {
            if (activeIndex > 0) {
              onSelectSection(sections[activeIndex - 1].sectionKey);
            }
          }}
          disabled={activeIndex === 0}
          className="px-3 py-1.5 text-xs rounded border border-slate-300 text-slate-700 hover:bg-slate-100 disabled:opacity-40 flex items-center space-x-1 font-medium transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Previous</span>
        </button>

        <button
          onClick={() => {
            if (activeIndex < sections.length - 1) {
              onSelectSection(sections[activeIndex + 1].sectionKey);
            }
          }}
          disabled={activeIndex === sections.length - 1}
          className="px-3 py-1.5 text-xs rounded bg-slate-900 text-amber-300 hover:bg-slate-800 disabled:opacity-40 flex items-center space-x-1 font-semibold transition shadow"
        >
          <span>Next Section</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
