import React from 'react';
import { Scale, Briefcase, Bot, Plus, FileEdit, ChevronDown } from 'lucide-react';
import { SuitDto } from '../types';

interface NavbarProps {
  activeTab: 'draft' | 'suits' | 'chat';
  setActiveTab: (tab: 'draft' | 'suits' | 'chat') => void;
  suits: SuitDto[];
  activeSuit: SuitDto | null;
  onSelectSuit: (suit: SuitDto) => void;
  onNewSuit: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  suits,
  activeSuit,
  onSelectSuit,
  onNewSuit
}) => {
  return (
    <header className="bg-slate-900 text-slate-100 border-b border-slate-800 sticky top-0 z-50 h-14 flex items-center px-4 sm:px-6">
      <div className="w-full max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left: Brand logo & Active Suit Selector */}
        <div className="flex items-center space-x-4">
          <div
            onClick={() => setActiveTab('draft')}
            className="flex items-center space-x-2 cursor-pointer hover:opacity-90 transition"
          >
            <div className="bg-amber-600 p-1.5 rounded-md text-slate-950 font-bold">
              <Scale className="w-4 h-4" />
            </div>
            <span className="font-serif font-bold text-base tracking-tight text-amber-100">
              Draftmaster
            </span>
          </div>

          {/* Active Suit Dropdown Selector */}
          {suits.length > 0 && (
            <div className="relative group">
              <div className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700/80 px-2.5 py-1 rounded-md border border-slate-700 text-xs text-slate-200 cursor-pointer transition">
                <span className="text-slate-400 hidden sm:inline">Suit:</span>
                <span className="font-semibold text-amber-300 truncate max-w-[140px] sm:max-w-[200px]">
                  {activeSuit ? `${activeSuit.plaintiffs[0]?.name || 'P'} v. ${activeSuit.defendants[0]?.name || 'D'}` : 'Select Suit'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
              </div>

              {/* Dropdown Menu */}
              <div className="absolute left-0 mt-1 w-64 bg-slate-900 border border-slate-700 rounded-lg shadow-xl py-1 hidden group-hover:block z-50">
                <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-800">
                  Select Court Suit
                </div>
                {suits.map(s => (
                  <button
                    key={s.id}
                    onClick={() => onSelectSuit(s)}
                    className={`w-full text-left px-3 py-2 text-xs hover:bg-slate-800 transition truncate flex items-center justify-between ${
                      s.id === activeSuit?.id ? 'text-amber-400 font-bold bg-slate-800/50' : 'text-slate-300'
                    }`}
                  >
                    <span className="truncate">{s.plaintiffs[0]?.name} v. {s.defendants[0]?.name}</span>
                    <span className="text-[10px] text-slate-500 ml-1">{s.suitType}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Center/Right: Clean Navigation Tabs */}
        <nav className="flex items-center space-x-1">
          <button
            onClick={() => setActiveTab('draft')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition ${
              activeTab === 'draft'
                ? 'bg-amber-600 text-slate-950 shadow-sm'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <FileEdit className="w-3.5 h-3.5" />
            <span>Document Editor</span>
          </button>

          <button
            onClick={() => setActiveTab('suits')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition ${
              activeTab === 'suits'
                ? 'bg-amber-600 text-slate-950 shadow-sm'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Suits Register</span>
          </button>

          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition ${
              activeTab === 'chat'
                ? 'bg-amber-600 text-slate-950 shadow-sm'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span className="hidden md:inline">AI Legal Assistant</span>
          </button>

          <button
            onClick={onNewSuit}
            className="ml-2 bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-1.5 rounded-md text-xs font-semibold flex items-center space-x-1 transition shadow"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Suit</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
