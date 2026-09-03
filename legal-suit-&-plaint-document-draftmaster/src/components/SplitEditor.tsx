import React, { useState, useRef, useEffect } from 'react';
import {
  SuitDto,
  DocumentTemplateDto,
  SectionDefinitionDto,
  RenderContextDto,
  TaskResultDto
} from '../types';
import {
  Sparkles,
  Bot,
  Send,
  Check,
  ChevronLeft,
  ChevronRight,
  Download,
  Printer,
  RefreshCw,
  Edit3,
  MessageSquare,
  FileText,
  AlertCircle,
  HelpCircle,
  Zap
} from 'lucide-react';

interface SplitEditorProps {
  suit: SuitDto;
  templates: DocumentTemplateDto[];
  selectedTemplateKey: string;
  onSelectTemplate: (templateKey: string) => void;
  draftId: string;
  draftContexts: Record<string, RenderContextDto[]>;
  activeSectionKey: string;
  onSelectSection: (sectionKey: string) => void;
  onUpdateSectionContexts: (sectionKey: string, contexts: RenderContextDto[]) => void;
  onInitializeDraft: () => void;
  isInitializing?: boolean;
}

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  isQuestion?: boolean;
  timestamp: string;
}

export const SplitEditor: React.FC<SplitEditorProps> = ({
  suit,
  templates,
  selectedTemplateKey,
  onSelectTemplate,
  draftId,
  draftContexts,
  activeSectionKey,
  onSelectSection,
  onUpdateSectionContexts,
  onInitializeDraft,
  isInitializing = false
}) => {
  const paperRef = useRef<HTMLDivElement>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const [activeMode, setActiveMode] = useState<'chat' | 'edit'>('chat');
  const [chatHistories, setChatHistories] = useState<Record<string, ChatMessage[]>>({});
  const [userPrompt, setUserPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEditingInline, setIsEditingInline] = useState(false);
  const [editedText, setEditedText] = useState('');

  const activeTemplate = templates.find(t => t.templateKey === selectedTemplateKey) || templates[0];
  const sections = activeTemplate?.sections || [];
  const activeIndex = sections.findIndex(s => s.sectionKey === activeSectionKey);
  const activeSection = sections[activeIndex >= 0 ? activeIndex : 0];

  const currentContexts = draftContexts[activeSection?.sectionKey] || [];
  const activeValue = currentContexts[0]?.value || '';
  const isRuleBased = activeSection?.sourceType === 'RULE_BASED';

  const isInteractive = activeSection?.interactive === true;

  // Set active mode based on section interactivity
  useEffect(() => {
    if (isInteractive) {
      setActiveMode('chat');
    } else {
      setActiveMode('edit');
    }
  }, [activeSectionKey, isInteractive]);

  // Initialize chat history for active section if empty and interactive
  useEffect(() => {
    if (!activeSection || !isInteractive) return;
    const secKey = activeSection.sectionKey;
    if (!chatHistories[secKey] || chatHistories[secKey].length === 0) {
      const initialMsg: ChatMessage = {
        id: `init_${Date.now()}`,
        sender: 'ai',
        text: `Counsel, I am ready to assist with drafting the "${activeSection.title}" clause. Please provide any specific facts, dates, monetary values, or legal references you want included.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatHistories(prev => ({ ...prev, [secKey]: [initialMsg] }));
    }
  }, [activeSectionKey, isInteractive]);

  // Scroll chat to bottom when message arrives
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistories, activeSectionKey, isLoading]);

  // Handle sending an interactive chat message for current section
  const handleSendChatMessage = async (msgText?: string) => {
    const textToSend = msgText || userPrompt;
    if (!textToSend.trim() || !activeSection) return;

    const secKey = activeSection.sectionKey;
    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // Update state immediately with user message
    const updatedHistory = [...(chatHistories[secKey] || []), userMsg];
    setChatHistories(prev => ({ ...prev, [secKey]: updatedHistory }));
    setUserPrompt('');
    setIsLoading(true);

    // Build accumulated conversation string to send to backend
    const conversationString = updatedHistory
      .map(m => (m.sender === 'user' ? `Advocate: ${m.text}` : `AI Draftsman: ${m.text}`))
      .join('\n');

    try {
      const res = await fetch('/api/documents/ai/step', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          draftId,
          documentType: selectedTemplateKey,
          sectionKey: activeSection.sectionKey,
          taskKey: activeSection.taskKey,
          conversationHistory: conversationString,
          suitDto: suit
        })
      });

      const result: TaskResultDto = await res.json();

      if (result.status === 'NEEDS_INFO' && result.question) {
        const questionMsg: ChatMessage = {
          id: `ai_q_${Date.now()}`,
          sender: 'ai',
          text: result.question,
          isQuestion: true,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setChatHistories(prev => ({
          ...prev,
          [secKey]: [...(prev[secKey] || []), questionMsg]
        }));
      } else if (result.status === 'COMPLETE' && result.renderContexts?.length) {
        const generatedText = result.renderContexts[0]?.value || '';
        const completeMsg: ChatMessage = {
          id: `ai_c_${Date.now()}`,
          sender: 'ai',
          text: `Section clause updated:\n\n"${generatedText}"`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setChatHistories(prev => ({
          ...prev,
          [secKey]: [...(prev[secKey] || []), completeMsg]
        }));
        onUpdateSectionContexts(secKey, result.renderContexts);
      }
    } catch (err) {
      console.error('Error in AI step chat:', err);
      const errorMsg: ChatMessage = {
        id: `err_${Date.now()}`,
        sender: 'ai',
        text: 'Counsel, unable to reach the AI server. You can edit the section text directly in the editor tab.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatHistories(prev => ({
        ...prev,
        [secKey]: [...(prev[secKey] || []), errorMsg]
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveInlineText = () => {
    if (!activeSection) return;
    const updated: RenderContextDto[] = [
      {
        sectionKey: activeSection.sectionKey,
        definitionKey: `${activeSection.sectionKey}_custom`,
        context: activeSection.title,
        value: editedText,
        order: 1,
        sourceType: 'MANUAL_ENTRY',
        editable: true
      }
    ];
    onUpdateSectionContexts(activeSection.sectionKey, updated);
    setIsEditingInline(false);
  };

  const handleNextSection = () => {
    if (activeIndex < sections.length - 1) {
      onSelectSection(sections[activeIndex + 1].sectionKey);
      setIsEditingInline(false);
    }
  };

  const handlePrevSection = () => {
    if (activeIndex > 0) {
      onSelectSection(sections[activeIndex - 1].sectionKey);
      setIsEditingInline(false);
    }
  };

  const handleDownloadDocx = () => {
    const contentHtml = paperRef.current ? paperRef.current.innerHTML : '';
    const wordHtml = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>Legal Suit Plaint</title>
        <style>
          body { font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.6; margin: 1in; }
          .court-title { text-align: center; font-weight: bold; text-transform: uppercase; margin-bottom: 20px; }
          .section-block { margin-bottom: 20px; text-align: justify; }
        </style>
      </head>
      <body>${contentHtml}</body>
      </html>
    `;
    const blob = new Blob(['\ufeff', wordHtml], {
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

  const currentChatMessages = chatHistories[activeSection?.sectionKey] || [];

  // Quick prompt suggestions based on section
  const getSectionSuggestions = () => {
    if (!activeSection) return [];
    const secKey = activeSection.sectionKey;
    if (secKey.includes('cause_of_action')) {
      return [
        'Include cheque bounce date 15th Jan and legal notice dated 28th Jan',
        'Add 18% contractual interest from default date',
        'Detail loan agreement executed on 10th March 2023'
      ];
    }
    if (secKey.includes('valuation') || secKey.includes('court_fee')) {
      return [
        'Calculate court fee under Section 7(i) for Rs. 15,00,000 claim',
        'Apply maximum court fee cap under state schedule'
      ];
    }
    if (secKey.includes('prayer')) {
      return [
        'Add decree for recovery of Rs. 15,00,000 along with 18% interest',
        'Include prayer for cost of suit and interim injunction'
      ];
    }
    return [
      'Draft standard CPC compliant wording for this section',
      'Include specific dates and monetary amounts from suit facts'
    ];
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4.5rem)] space-y-3">
      {/* Top Workspace Header Bar */}
      <div className="bg-white border border-slate-200 rounded-xl px-4 py-2 flex flex-wrap items-center justify-between gap-3 shadow-sm">
        {/* Template Selector & Section Progress */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:inline">
              Pleading Format:
            </span>
            <select
              value={selectedTemplateKey}
              onChange={e => onSelectTemplate(e.target.value)}
              className="text-xs font-semibold bg-slate-100 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-900 focus:ring-2 focus:ring-amber-500"
            >
              {templates.map(t => (
                <option key={t.templateKey} value={t.templateKey}>
                  {t.displayName}
                </option>
              ))}
            </select>
          </div>

          <div className="h-4 w-px bg-slate-200 hidden sm:block" />

          {/* Section Step Counter */}
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-mono">
              Step {activeIndex + 1} of {sections.length}
            </span>
            <span className="text-xs font-semibold text-slate-800 truncate max-w-[160px] sm:max-w-xs">
              {activeSection?.title}
            </span>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => window.print()}
            className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-3 py-1.5 rounded-lg flex items-center space-x-1 transition"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Print / PDF</span>
          </button>
          <button
            onClick={handleDownloadDocx}
            className="text-xs bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold px-3 py-1.5 rounded-lg flex items-center space-x-1 shadow transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download DOCX</span>
          </button>
        </div>
      </div>

      {/* Main Split View: Left Interactive Editor (45%), Right Live Sheet (55%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 overflow-hidden">
        {/* LEFT PANEL: INTERACTIVE SECTION CHAT & DRAFTING */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col overflow-hidden">
          {/* Step Navigation Pill Strip */}
          <div className="p-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <button
              onClick={handlePrevSection}
              disabled={activeIndex === 0}
              className="px-2.5 py-1 text-xs rounded border border-slate-300 text-slate-700 hover:bg-slate-100 disabled:opacity-40 flex items-center space-x-1 transition"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Prev</span>
            </button>

            {/* Steps Pill Indicators */}
            <div className="flex items-center space-x-1 overflow-x-auto max-w-[180px] sm:max-w-[240px] px-1">
              {sections.map((sec, idx) => {
                const isActive = sec.sectionKey === activeSectionKey;
                const hasVal = draftContexts[sec.sectionKey]?.some(c => c.value && c.value.trim().length > 5);
                return (
                  <button
                    key={sec.sectionKey}
                    onClick={() => onSelectSection(sec.sectionKey)}
                    title={sec.title}
                    className={`w-6 h-6 rounded-full text-[10px] font-mono font-bold flex items-center justify-center flex-shrink-0 transition ${
                      isActive
                        ? 'bg-amber-600 text-slate-950 ring-2 ring-amber-400/50'
                        : hasVal
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            <button
              onClick={handleNextSection}
              disabled={activeIndex === sections.length - 1}
              className="px-2.5 py-1 text-xs rounded bg-slate-900 text-amber-300 hover:bg-slate-800 disabled:opacity-40 flex items-center space-x-1 font-semibold transition"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Section Mode Toggle Header */}
          <div className="px-4 py-2 bg-slate-100/80 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h3 className="text-xs font-bold text-slate-900 truncate max-w-[180px]">
                {activeSection?.title}
              </h3>
              <span className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                isInteractive ? 'bg-purple-100 text-purple-800 font-semibold' : 'bg-slate-200 text-slate-700 font-medium'
              }`}>
                {isInteractive ? 'AI-Interactive' : 'Rule-Based'}
              </span>
            </div>

            {/* Interactive Chat vs Direct Wording Toggle (Only if interactive is true) */}
            {isInteractive && (
              <div className="flex bg-slate-200/80 p-0.5 rounded-lg text-[11px] font-semibold">
                <button
                  onClick={() => setActiveMode('chat')}
                  className={`px-2.5 py-1 rounded-md transition flex items-center space-x-1 ${
                    activeMode === 'chat'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <MessageSquare className="w-3 h-3 text-amber-600" />
                  <span>AI Chat</span>
                </button>
                <button
                  onClick={() => {
                    setActiveMode('edit');
                    setEditedText(activeValue);
                  }}
                  className={`px-2.5 py-1 rounded-md transition flex items-center space-x-1 ${
                    activeMode === 'edit'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Edit3 className="w-3 h-3 text-amber-600" />
                  <span>Text Wording</span>
                </button>
              </div>
            )}
          </div>

          {/* INTERACTIVE CHAT MODE (ONLY FOR INTERACTIVE SECTIONS) */}
          {isInteractive && activeMode === 'chat' ? (
            <div className="flex-1 flex flex-col overflow-hidden bg-slate-50/50">
              {/* Chat Message Stream */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
                {currentChatMessages.map(msg => (
                  <div
                    key={msg.id}
                    className={`flex items-start space-x-2 ${
                      msg.sender === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {msg.sender === 'ai' && (
                      <div className="w-6 h-6 rounded-full bg-slate-900 text-amber-400 flex items-center justify-center flex-shrink-0 mt-0.5 shadow">
                        <Bot className="w-3.5 h-3.5" />
                      </div>
                    )}

                    <div
                      className={`max-w-[85%] rounded-xl p-3 leading-relaxed whitespace-pre-wrap ${
                        msg.sender === 'user'
                          ? 'bg-amber-600 text-slate-950 font-medium rounded-tr-none shadow'
                          : msg.isQuestion
                          ? 'bg-amber-50 border border-amber-300 text-amber-950 rounded-tl-none font-medium shadow-sm'
                          : 'bg-white text-slate-900 border border-slate-200 rounded-tl-none font-serif shadow-sm'
                      }`}
                    >
                      {msg.isQuestion && (
                        <div className="flex items-center space-x-1 font-bold text-amber-900 text-[10px] uppercase tracking-wider mb-1">
                          <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
                          <span>Clarification Required</span>
                        </div>
                      )}
                      {msg.text}
                      <span className="block text-[9px] text-slate-400 text-right mt-1 font-sans">
                        {msg.timestamp}
                      </span>
                    </div>

                    {msg.sender === 'user' && (
                      <div className="w-6 h-6 rounded-full bg-amber-600 text-slate-950 font-bold flex items-center justify-center flex-shrink-0 mt-0.5 text-[10px] shadow">
                        Adv
                      </div>
                    )}
                  </div>
                ))}

                {isLoading && (
                  <div className="flex items-center space-x-2 text-xs text-slate-500 italic p-2">
                    <Bot className="w-4 h-4 text-amber-600 animate-spin" />
                    <span>AI Draftsman analyzing legal context and CPC rules...</span>
                  </div>
                )}
                <div ref={chatBottomRef} />
              </div>

              {/* Quick Prompt Suggestions */}
              {getSectionSuggestions().length > 0 && (
                <div className="p-2 bg-slate-100/80 border-t border-slate-200 flex items-center space-x-1.5 overflow-x-auto text-[10px]">
                  <Zap className="w-3 h-3 text-amber-600 flex-shrink-0 ml-1" />
                  {getSectionSuggestions().map((sug, i) => (
                    <button
                      key={i}
                      onClick={() => handleSendChatMessage(sug)}
                      className="whitespace-nowrap bg-white hover:bg-amber-50 text-slate-700 hover:text-amber-900 border border-slate-200 hover:border-amber-300 px-2.5 py-1 rounded-full transition"
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              )}

              {/* Chat Input Box */}
              <div className="p-3 bg-white border-t border-slate-200">
                <form
                  onSubmit={e => {
                    e.preventDefault();
                    handleSendChatMessage();
                  }}
                  className="flex gap-2"
                >
                  <input
                    type="text"
                    value={userPrompt}
                    onChange={e => setUserPrompt(e.target.value)}
                    placeholder="Ask AI Draftsman or provide dates, cheque numbers, amounts..."
                    className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 bg-slate-50 text-slate-900"
                  />
                  <button
                    type="submit"
                    disabled={isLoading || !userPrompt.trim()}
                    className="bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold px-3.5 py-2 rounded-lg text-xs flex items-center space-x-1 transition disabled:opacity-50 shadow"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            </div>
          ) : (
            /* NON-INTERACTIVE / DIRECT TEXT WORDING EDITOR MODE */
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-white">
              {!isInteractive && (
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center space-x-2 text-[11px] text-slate-600">
                  <AlertCircle className="w-4 h-4 text-slate-500 flex-shrink-0" />
                  <span>Rule-based section auto-generated as per CPC provisions and suit particulars. AI chat is not enabled for non-interactive sections.</span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Section Wording Output:
                </label>
                <button
                  onClick={() => {
                    setEditedText(activeValue);
                    setIsEditingInline(!isEditingInline);
                  }}
                  className="text-xs text-amber-700 hover:text-amber-800 font-semibold flex items-center space-x-1"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>{isEditingInline ? 'Cancel' : 'Edit Text'}</span>
                </button>
              </div>

              {isEditingInline ? (
                <div className="space-y-2">
                  <textarea
                    rows={12}
                    value={editedText}
                    onChange={e => setEditedText(e.target.value)}
                    className="w-full p-3 font-serif text-xs border border-amber-500 rounded-lg focus:ring-2 focus:ring-amber-500 bg-amber-50/20 text-slate-900 leading-relaxed"
                  />
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => setIsEditingInline(false)}
                      className="px-3 py-1.5 text-xs border border-slate-300 rounded text-slate-600 hover:bg-slate-100"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveInlineText}
                      className="px-4 py-1.5 text-xs bg-emerald-600 text-white font-semibold rounded flex items-center space-x-1 shadow"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Save Legal Wording</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-xs font-serif text-slate-900 whitespace-pre-wrap leading-relaxed min-h-[220px] shadow-inner">
                  {activeValue || (
                    <span className="text-slate-400 font-sans italic text-center block py-12">
                      Section text pending. Use the AI Chat tab or click "Edit Text" to write clause wording.
                    </span>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Bottom Save & Advance Bar */}
          <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            <span className="text-[11px] text-slate-500 font-medium">
              Live updates reflect on court paper →
            </span>
            <button
              onClick={handleNextSection}
              disabled={activeIndex === sections.length - 1}
              className="bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold px-4 py-1.5 rounded-lg text-xs flex items-center space-x-1.5 shadow transition disabled:opacity-40"
            >
              <span>Save & Next Section</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* RIGHT PANEL: LIVE COURT DOCUMENT PAPER SHEET */}
        <div className="lg:col-span-7 bg-slate-200/80 rounded-xl p-4 sm:p-6 overflow-y-auto border border-slate-300 flex justify-center shadow-inner">
          <div
            ref={paperRef}
            className="bg-white text-slate-950 p-6 sm:p-10 rounded-md shadow-2xl border border-slate-300 w-full max-w-2xl font-serif text-xs leading-relaxed space-y-5 selection:bg-amber-200"
            style={{ minHeight: '900px' }}
          >
            {/* Render all sections in sequence on paper sheet */}
            {sections.map(sec => {
              const contexts = draftContexts[sec.sectionKey] || [];
              const isActive = sec.sectionKey === activeSectionKey;

              return (
                <div
                  key={sec.sectionKey}
                  onClick={() => onSelectSection(sec.sectionKey)}
                  className={`p-3 rounded transition-all cursor-pointer relative ${
                    isActive
                      ? 'bg-amber-50/90 ring-2 ring-amber-500/80 shadow-md border-l-4 border-l-amber-600'
                      : 'hover:bg-slate-50/80 border border-transparent hover:border-slate-200'
                  }`}
                >
                  {contexts.length > 0 && (
                    contexts.map((ctx, idx) => (
                      <div
                        key={ctx.definitionKey || idx}
                        className={`${
                          sec.sectionKey === 'jurisdiction_title'
                            ? 'text-center font-bold uppercase text-slate-900 border-b border-slate-200 pb-3 tracking-wide'
                            : 'text-justify text-slate-900'
                        }`}
                      >
                        {ctx.value}
                      </div>
                    ))
                  )}
                </div>
              );
            })}

            {/* Signature Block */}
            <div className="pt-8 border-t border-slate-300 mt-8 grid grid-cols-2 gap-4 text-[11px] font-serif">
              <div>
                <p className="font-bold text-slate-900 uppercase">ADVOCATE FOR PLAINTIFF(S)</p>
                <p className="text-slate-700 mt-1">{suit.lawyer}</p>
                <p className="text-slate-400 text-[10px]">High Court Advocate</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-slate-900 uppercase">PLAINTIFF(S)</p>
                <p className="text-slate-700 mt-1">{suit.plaintiffs[0]?.name}</p>
                <p className="text-slate-400 text-[10px]">Deponent</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
