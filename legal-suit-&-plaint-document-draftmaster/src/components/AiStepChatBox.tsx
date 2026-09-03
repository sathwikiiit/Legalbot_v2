import React, { useState } from 'react';
import { SectionDefinitionDto, SuitDto, TaskResultDto, RenderContextDto } from '../types';
import { Sparkles, Bot, Send, Check, RefreshCw, AlertCircle, Edit3, MessageSquareText } from 'lucide-react';

interface AiStepChatBoxProps {
  section: SectionDefinitionDto;
  suit: SuitDto;
  draftId: string;
  documentType: string;
  onUpdateSectionContexts: (sectionKey: string, contexts: RenderContextDto[]) => void;
  currentContexts?: RenderContextDto[];
}

export const AiStepChatBox: React.FC<AiStepChatBoxProps> = ({
  section,
  suit,
  draftId,
  documentType,
  onUpdateSectionContexts,
  currentContexts
}) => {
  const [conversationHistory, setConversationHistory] = useState('');
  const [userPromptInput, setUserPromptInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [taskResult, setTaskResult] = useState<TaskResultDto | null>(null);
  const [editedText, setEditedText] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const isRuleBased = section.sourceType === 'RULE_BASED';

  const handleRunAiStep = async (promptMessage?: string) => {
    setIsLoading(true);
    const historyToSubmit = promptMessage
      ? `${conversationHistory ? conversationHistory + '\nAdvocate Input: ' : ''}${promptMessage}`
      : conversationHistory;

    try {
      const res = await fetch('/api/documents/ai/step', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          draftId,
          documentType,
          sectionKey: section.sectionKey,
          taskKey: section.taskKey,
          conversationHistory: historyToSubmit,
          suitDto: suit
        })
      });

      const result: TaskResultDto = await res.json();
      setTaskResult(result);

      if (promptMessage) {
        setConversationHistory(historyToSubmit);
        setUserPromptInput('');
      }

      if (result.status === 'COMPLETE' && result.renderContexts?.length) {
        setEditedText(result.renderContexts[0]?.value || '');
        onUpdateSectionContexts(section.sectionKey, result.renderContexts);
      }
    } catch (err) {
      console.error('Error running AI Step:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveManualEdit = () => {
    const updatedContexts: RenderContextDto[] = [
      {
        sectionKey: section.sectionKey,
        definitionKey: `${section.sectionKey}_manual_edit`,
        context: `Custom Legal Clause (${section.title})`,
        value: editedText,
        order: 1,
        sourceType: 'MANUAL_ENTRY',
        editable: true
      }
    ];
    onUpdateSectionContexts(section.sectionKey, updatedContexts);
    setIsEditing(false);
  };

  const activeValue = currentContexts?.[0]?.value || '';

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col space-y-4 p-5">
      {/* Header Banner */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center space-x-2">
          {isRuleBased ? (
            <div className="p-1.5 bg-slate-100 rounded text-slate-700">
              <Bot className="w-4 h-4" />
            </div>
          ) : (
            <div className="p-1.5 bg-purple-100 rounded text-purple-700">
              <Sparkles className="w-4 h-4" />
            </div>
          )}
          <div>
            <h3 className="text-sm font-serif font-bold text-slate-900">{section.title}</h3>
            <p className="text-[11px] text-slate-500">
              {isRuleBased
                ? 'Rule-Based Auto Formatter (Derived from Suit & Party details)'
                : 'AI Legal Drafting Step (CPC & Case Law Formatting)'}
            </p>
          </div>
        </div>

        {!isRuleBased && (
          <button
            onClick={() => handleRunAiStep()}
            disabled={isLoading}
            className="text-xs bg-purple-600 hover:bg-purple-500 text-white font-semibold px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition shadow disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{activeValue ? 'Regenerate AI Clause' : 'Generate AI Clause'}</span>
          </button>
        )}
      </div>

      {/* AI Interactive Question Box if NEEDS_INFO */}
      {taskResult?.status === 'NEEDS_INFO' && (
        <div className="bg-amber-50 border border-amber-300/80 rounded-xl p-4 text-xs text-amber-950 space-y-3 shadow-inner">
          <div className="flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <span className="font-bold text-amber-900">AI Legal Draftsman Question:</span>
              <p className="text-slate-800 font-medium leading-relaxed">{taskResult.question}</p>
            </div>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={userPromptInput}
              onChange={e => setUserPromptInput(e.target.value)}
              placeholder="Provide factual details (e.g. Agreement date, default date, notice ref)..."
              className="flex-1 px-3 py-2 border border-amber-300 rounded-lg text-xs bg-white text-slate-900 focus:ring-2 focus:ring-amber-500"
              onKeyDown={e => {
                if (e.key === 'Enter' && userPromptInput.trim()) {
                  handleRunAiStep(userPromptInput);
                }
              }}
            />
            <button
              onClick={() => userPromptInput.trim() && handleRunAiStep(userPromptInput)}
              disabled={isLoading || !userPromptInput.trim()}
              className="bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold px-4 py-2 rounded-lg flex items-center space-x-1 disabled:opacity-50 transition"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit</span>
            </button>
          </div>
        </div>
      )}

      {/* Section Content Display / Editor */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Current Section Legal Wording:
          </label>
          <button
            onClick={() => {
              setEditedText(activeValue);
              setIsEditing(!isEditing);
            }}
            className="text-xs text-amber-700 hover:text-amber-800 font-medium flex items-center space-x-1"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{isEditing ? 'Cancel Edit' : 'Edit Inline'}</span>
          </button>
        </div>

        {isEditing ? (
          <div className="space-y-2">
            <textarea
              rows={8}
              value={editedText}
              onChange={e => setEditedText(e.target.value)}
              className="w-full p-3 font-serif text-xs border border-amber-400 rounded-lg focus:ring-2 focus:ring-amber-500 bg-amber-50/20 text-slate-900 leading-relaxed"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsEditing(false)}
                className="px-3 py-1.5 text-xs text-slate-600 border border-slate-300 rounded-md hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveManualEdit}
                className="px-4 py-1.5 text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-md flex items-center space-x-1 shadow"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save Legal Clause</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-xs font-serif text-slate-900 whitespace-pre-wrap leading-relaxed shadow-inner min-h-[120px]">
            {activeValue || (
              <span className="text-slate-400 font-sans italic">
                No section draft generated yet. Click "{isRuleBased ? 'Initialize' : 'Generate AI Clause'}" above to build this section.
              </span>
            )}
          </div>
        )}
      </div>

      {/* Prompt / Context Guidance Box */}
      {!isRuleBased && (
        <div className="pt-3 border-t border-slate-100 space-y-2">
          <label className="text-[11px] font-semibold text-slate-600 flex items-center space-x-1">
            <MessageSquareText className="w-3.5 h-3.5 text-amber-600" />
            <span>Guide AI Legal Draftsman for this Section:</span>
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={userPromptInput}
              onChange={e => setUserPromptInput(e.target.value)}
              placeholder="e.g., Include specific clause regarding cheque bounce, or 18% contractual interest clause..."
              className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
            />
            <button
              onClick={() => userPromptInput.trim() && handleRunAiStep(userPromptInput)}
              disabled={isLoading || !userPromptInput.trim()}
              className="bg-slate-900 hover:bg-slate-800 text-amber-300 font-semibold px-4 py-2 text-xs rounded-lg flex items-center space-x-1 transition disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Apply Instruction</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
