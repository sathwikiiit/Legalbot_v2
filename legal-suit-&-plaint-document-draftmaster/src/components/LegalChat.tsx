import React, { useState } from 'react';
import { Bot, Send, User, Sparkles, Scale, BookOpen, ShieldAlert } from 'lucide-react';

export const LegalChat: React.FC = () => {
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string }>>([
    {
      sender: 'ai',
      text: "Greetings Counsel! I am your Senior Counsel AI Legal Assistant. You can ask me regarding Civil Procedure Code (CPC), Specific Relief Act, Limitation Act, Jurisdiction precedents, or Court Fee valuation rules."
    }
  ]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendQuery = async (queryText?: string) => {
    const textToSend = queryText || inputPrompt;
    if (!textToSend.trim()) return;

    const userMsg = { sender: 'user' as const, text: textToSend };
    setMessages(prev => [...prev, userMsg]);
    if (!queryText) setInputPrompt('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: textToSend })
      });
      const responseText = await res.json();

      setMessages(prev => [
        ...prev,
        { sender: 'ai', text: typeof responseText === 'string' ? responseText : JSON.stringify(responseText) }
      ]);
    } catch (err) {
      console.error('Chat error:', err);
      setMessages(prev => [
        ...prev,
        { sender: 'ai', text: "Counsel, I am currently operating offline. Under CPC Order VII, ensure all material facts supporting cause of action and valuation are clearly stated." }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const sampleQueries = [
    "What is the limitation period for filing a suit for recovery of money based on ledger entries?",
    "How is court fee calculated under Section 24 of Court Fees Act for injunction suits?",
    "What are the mandatory ingredients of Sec 16(c) Specific Relief Act in a specific performance suit?",
    "Explain Order XXXVII summary suit procedure requirements for commercial debts."
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-[75vh] overflow-hidden">
      {/* Chat Header */}
      <div className="bg-slate-900 text-slate-100 px-6 py-4 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="bg-amber-600/20 text-amber-400 p-2 rounded-lg border border-amber-500/30">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-serif font-bold text-base text-amber-100">
              Senior Counsel AI Advisory Portal
            </h2>
            <p className="text-xs text-slate-400">
              High Court & Supreme Court Legal Precedents & Civil Procedure Guide
            </p>
          </div>
        </div>

        <span className="text-xs bg-amber-950 text-amber-400 px-2.5 py-1 rounded-full border border-amber-800/60 font-semibold flex items-center space-x-1">
          <Sparkles className="w-3 h-3" />
          <span>Gemini AI Connected</span>
        </span>
      </div>

      {/* Suggested Quick Questions */}
      <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center space-x-2 overflow-x-auto text-xs">
        <span className="font-semibold text-slate-500 whitespace-nowrap flex items-center space-x-1">
          <BookOpen className="w-3.5 h-3.5 text-amber-600" />
          <span>Quick Topics:</span>
        </span>
        {sampleQueries.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSendQuery(q)}
            className="whitespace-nowrap bg-white hover:bg-amber-50 text-slate-700 hover:text-amber-900 border border-slate-200 hover:border-amber-300 px-3 py-1 rounded-full text-[11px] transition"
          >
            {q.slice(0, 45)}...
          </button>
        ))}
      </div>

      {/* Messages Stream */}
      <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/50">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex items-start space-x-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender === 'ai' && (
              <div className="w-8 h-8 rounded-full bg-slate-900 text-amber-400 flex items-center justify-center flex-shrink-0 shadow">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-2xl rounded-2xl p-4 text-xs leading-relaxed whitespace-pre-wrap ${
                msg.sender === 'user'
                  ? 'bg-amber-600 text-slate-950 font-medium rounded-tr-none shadow'
                  : 'bg-white text-slate-900 border border-slate-200 font-serif rounded-tl-none shadow-sm'
              }`}
            >
              {msg.text}
            </div>

            {msg.sender === 'user' && (
              <div className="w-8 h-8 rounded-full bg-amber-600 text-slate-950 flex items-center justify-center flex-shrink-0 font-bold text-xs shadow">
                Adv
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center space-x-2 text-xs text-slate-500 italic">
            <Bot className="w-4 h-4 text-amber-600 animate-bounce" />
            <span>Senior Counsel AI analyzing precedents and statutory provisions...</span>
          </div>
        )}
      </div>

      {/* Input Box */}
      <div className="p-4 bg-white border-t border-slate-200">
        <form
          onSubmit={e => {
            e.preventDefault();
            handleSendQuery();
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={inputPrompt}
            onChange={e => setInputPrompt(e.target.value)}
            placeholder="Ask AI Senior Counsel regarding CPC rules, limitation, court fee, or case law..."
            className="flex-1 px-4 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 bg-slate-50"
          />
          <button
            type="submit"
            disabled={isLoading || !inputPrompt.trim()}
            className="bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-xs flex items-center space-x-1.5 transition disabled:opacity-50 shadow"
          >
            <Send className="w-4 h-4" />
            <span>Ask Counsel</span>
          </button>
        </form>
      </div>
    </div>
  );
};
