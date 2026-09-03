import React, { useState } from 'react';
import { SuitDto } from '../types';
import { Search, Plus, FileText, Gavel, User, Home, Trash2, Edit, Sparkles, Building2 } from 'lucide-react';

interface SuitListProps {
  suits: SuitDto[];
  onSelectSuit: (suit: SuitDto) => void;
  onEditSuit: (suit: SuitDto) => void;
  onDeleteSuit: (id: number) => void;
  onNewSuit: () => void;
  activeSuitId?: number;
}

export const SuitList: React.FC<SuitListProps> = ({
  suits,
  onSelectSuit,
  onEditSuit,
  onDeleteSuit,
  onNewSuit,
  activeSuitId
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [lawyerFilter, setLawyerFilter] = useState('');

  const filteredSuits = suits.filter(s => {
    const matchesSearch =
      s.court.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.plaintiffs.some(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      s.defendants.some(d => d.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      s.suitType.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesLawyer = !lawyerFilter || s.lawyer.toLowerCase().includes(lawyerFilter.toLowerCase());

    return matchesSearch && matchesLawyer;
  });

  const getSuitBadgeColor = (suitType: string) => {
    switch (suitType) {
      case 'PLAINT_RECOVERY':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'PLAINT_INJUNCTION':
        return 'bg-sky-100 text-sky-800 border-sky-200';
      case 'PLAINT_SPECIFIC_PERFORMANCE':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'EVICTION_PETITION':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search by party name, court, city or suit type..."
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 bg-slate-50"
          />
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto justify-end">
          <input
            type="text"
            value={lawyerFilter}
            onChange={e => setLawyerFilter(e.target.value)}
            placeholder="Filter by Advocate name..."
            className="px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 bg-slate-50 w-full sm:w-48"
          />

          <button
            id="add-suit-list-btn"
            onClick={onNewSuit}
            className="bg-slate-900 hover:bg-slate-800 text-amber-300 font-semibold text-xs px-4 py-2.5 rounded-lg flex items-center space-x-1.5 transition shadow"
          >
            <Plus className="w-4 h-4" />
            <span className="whitespace-nowrap">Register New Suit</span>
          </button>
        </div>
      </div>

      {/* Suits Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredSuits.length === 0 ? (
          <div className="col-span-full bg-white p-12 rounded-xl border border-slate-200 text-center space-y-3">
            <Gavel className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-base font-semibold text-slate-800">No Suits Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No legal suit records match your search criteria. Register a new suit or adjust your filters.
            </p>
            <button
              onClick={onNewSuit}
              className="mt-2 text-xs bg-amber-600 hover:bg-amber-500 text-slate-950 font-semibold px-4 py-2 rounded-lg transition"
            >
              Create New Suit Entry
            </button>
          </div>
        ) : (
          filteredSuits.map(suit => {
            const isActive = suit.id === activeSuitId;
            const p1 = suit.plaintiffs[0]?.name || 'N/A';
            const d1 = suit.defendants[0]?.name || 'N/A';

            return (
              <div
                key={suit.id}
                className={`bg-white rounded-xl border transition-all duration-200 overflow-hidden flex flex-col justify-between ${
                  isActive
                    ? 'border-amber-500 ring-2 ring-amber-500/20 shadow-lg'
                    : 'border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-md'
                }`}
              >
                {/* Header Tag */}
                <div className="p-5 border-b border-slate-100 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md border uppercase tracking-wider ${getSuitBadgeColor(suit.suitType)}`}>
                      {suit.suitType.replace(/_/g, ' ')}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      ID: #{suit.id}
                    </span>
                  </div>

                  {/* Title Cause */}
                  <div>
                    <h3 className="font-serif font-bold text-slate-900 text-base leading-snug">
                      {p1} <span className="text-slate-400 font-sans font-normal text-xs px-1">v.</span> {d1}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 flex items-center space-x-1">
                      <Building2 className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span className="truncate">{suit.court}, {suit.city}</span>
                    </p>
                  </div>
                </div>

                {/* Details Body */}
                <div className="p-5 bg-slate-50/50 space-y-3 text-xs text-slate-700 flex-1">
                  <div className="flex items-center space-x-2">
                    <User className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                    <span className="font-medium text-slate-800">Counsel:</span>
                    <span className="text-slate-600 truncate">{suit.lawyer}</span>
                  </div>

                  {suit.property?.[0] && (
                    <div className="flex items-center space-x-2">
                      <Home className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
                      <span className="font-medium text-slate-800">Property:</span>
                      <span className="text-slate-600 truncate">
                        {suit.property[0].type} ({suit.property[0].extent}) - Valuation Rs. {suit.property[0].mkvalue}/-
                      </span>
                    </div>
                  )}

                  <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                    <span className="text-[11px] font-semibold text-slate-500 uppercase block mb-1">Main Relief Claimed:</span>
                    <p className="text-xs text-slate-800 italic line-clamp-2">
                      "{suit.relief}"
                    </p>
                  </div>
                </div>

                {/* Action Footer */}
                <div className="p-4 bg-slate-100/80 border-t border-slate-200 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onEditSuit(suit)}
                      className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded transition"
                      title="Edit Suit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteSuit(suit.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition"
                      title="Delete Suit"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={() => onSelectSuit(suit)}
                    className="bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs px-3.5 py-2 rounded-lg flex items-center space-x-1.5 shadow transition"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Launch Draft Engine</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
