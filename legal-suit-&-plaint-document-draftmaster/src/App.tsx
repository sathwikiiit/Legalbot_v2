import React, { useState, useEffect } from 'react';
import {
  SuitDto,
  DocumentTemplateDto,
  RenderContextDto,
  InitializeDocumentResponse
} from './types';
import { Navbar } from './components/Navbar';
import { SuitList } from './components/SuitList';
import { SuitFormModal } from './components/SuitFormModal';
import { SplitEditor } from './components/SplitEditor';
import { LegalChat } from './components/LegalChat';
import { Gavel, Plus } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'draft' | 'suits' | 'chat'>('draft');
  const [suits, setSuits] = useState<SuitDto[]>([]);
  const [activeSuit, setActiveSuit] = useState<SuitDto | null>(null);
  const [templates, setTemplates] = useState<DocumentTemplateDto[]>([]);
  const [selectedTemplateKey, setSelectedTemplateKey] = useState<string>('PLAINT_RECOVERY');
  const [draftId, setDraftId] = useState<string>('');
  const [draftContexts, setDraftContexts] = useState<Record<string, RenderContextDto[]>>({});
  const [activeSectionKey, setActiveSectionKey] = useState<string>('jurisdiction_title');

  const [isSuitModalOpen, setIsSuitModalOpen] = useState(false);
  const [editingSuit, setEditingSuit] = useState<SuitDto | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);

  // Fetch initial suits and templates
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [suitsRes, tmplRes] = await Promise.all([
        fetch('/suits'),
        fetch('/api/documents/templates')
      ]);
      const suitsData: SuitDto[] = await suitsRes.json();
      const tmplData: DocumentTemplateDto[] = await tmplRes.json();

      setSuits(suitsData || []);
      setTemplates(tmplData || []);

      if (suitsData && suitsData.length > 0) {
        const firstSuit = suitsData[0];
        setActiveSuit(firstSuit);
        setSelectedTemplateKey(firstSuit.suitType || 'PLAINT_RECOVERY');
        // Auto initialize draft for first suit
        handleInitializeDraft(firstSuit, firstSuit.suitType || 'PLAINT_RECOVERY');
      }
    } catch (err) {
      console.error('Error fetching initial app data:', err);
    }
  };

  const fetchSuits = async () => {
    try {
      const res = await fetch('/suits');
      const data = await res.json();
      setSuits(data || []);
      if (data && data.length > 0 && !activeSuit) {
        setActiveSuit(data[0]);
      }
    } catch (err) {
      console.error('Error fetching suits:', err);
    }
  };

  // Initialize document draft for selected suit & template
  const handleInitializeDraft = async (suitToUse?: SuitDto, templateKeyToUse?: string) => {
    const suit = suitToUse || activeSuit;
    const tmplKey = templateKeyToUse || selectedTemplateKey;
    if (!suit) return;

    setIsInitializing(true);
    try {
      const res = await fetch('/api/documents/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentType: tmplKey,
          suitDto: suit
        })
      });

      const data: InitializeDocumentResponse = await res.json();
      setDraftId(data.draftId);
      setDraftContexts(data.initialSectionContexts || {});

      if (data.template?.sections?.length) {
        setActiveSectionKey(data.template.sections[0].sectionKey);
      }
    } catch (err) {
      console.error('Error initializing draft:', err);
    } finally {
      setIsInitializing(false);
    }
  };

  const handleSaveSuit = async (suit: SuitDto) => {
    try {
      await fetch('/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(suit)
      });
      await fetchSuits();
      setActiveSuit(suit);
      setIsSuitModalOpen(false);
      setEditingSuit(null);
      handleInitializeDraft(suit);
    } catch (err) {
      console.error('Error saving suit:', err);
    }
  };

  const handleDeleteSuit = async (id: number) => {
    try {
      await fetch('/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      await fetchSuits();
      if (activeSuit?.id === id) {
        const remaining = suits.filter(s => s.id !== id);
        setActiveSuit(remaining[0] || null);
      }
    } catch (err) {
      console.error('Error deleting suit:', err);
    }
  };

  const handleUpdateSectionContexts = async (sectionKey: string, contexts: RenderContextDto[]) => {
    const updatedDraft = {
      ...draftContexts,
      [sectionKey]: contexts
    };
    setDraftContexts(updatedDraft);

    if (draftId) {
      try {
        await fetch('/api/documents/sections/update', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            draftId,
            sectionKey,
            renderContexts: contexts
          })
        });
      } catch (err) {
        console.error('Error saving updated contexts:', err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-900 flex flex-col antialiased">
      {/* Streamlined Clean Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        suits={suits}
        activeSuit={activeSuit}
        onSelectSuit={suit => {
          setActiveSuit(suit);
          setSelectedTemplateKey(suit.suitType || 'PLAINT_RECOVERY');
          handleInitializeDraft(suit);
        }}
        onNewSuit={() => {
          setEditingSuit(null);
          setIsSuitModalOpen(true);
        }}
      />

      {/* Workspace Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-3">
        {/* VIEW 1: SPLIT DOCUMENT EDITOR WORKSPACE */}
        {activeTab === 'draft' && (
          <>
            {!activeSuit ? (
              <div className="bg-white p-12 rounded-xl border border-slate-200 text-center space-y-4 max-w-md mx-auto my-12 shadow-sm">
                <Gavel className="w-10 h-10 text-amber-600 mx-auto" />
                <h3 className="text-base font-bold text-slate-900">No Court Suit Selected</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Please select an existing suit or create a new suit entry to initialize the document drafting engine.
                </p>
                <button
                  onClick={() => {
                    setEditingSuit(null);
                    setIsSuitModalOpen(true);
                  }}
                  className="bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold px-4 py-2 rounded-lg text-xs transition inline-flex items-center space-x-1 shadow"
                >
                  <Plus className="w-4 h-4" />
                  <span>Register New Suit</span>
                </button>
              </div>
            ) : (
              <SplitEditor
                suit={activeSuit}
                templates={templates}
                selectedTemplateKey={selectedTemplateKey}
                onSelectTemplate={key => {
                  setSelectedTemplateKey(key);
                  handleInitializeDraft(activeSuit, key);
                }}
                draftId={draftId}
                draftContexts={draftContexts}
                activeSectionKey={activeSectionKey}
                onSelectSection={setActiveSectionKey}
                onUpdateSectionContexts={handleUpdateSectionContexts}
                onInitializeDraft={() => handleInitializeDraft()}
                isInitializing={isInitializing}
              />
            )}
          </>
        )}

        {/* VIEW 2: SUITS REGISTER */}
        {activeTab === 'suits' && (
          <div className="space-y-4">
            <SuitList
              suits={suits}
              activeSuitId={activeSuit?.id}
              onSelectSuit={suit => {
                setActiveSuit(suit);
                handleInitializeDraft(suit);
                setActiveTab('draft');
              }}
              onEditSuit={suit => {
                setEditingSuit(suit);
                setIsSuitModalOpen(true);
              }}
              onDeleteSuit={handleDeleteSuit}
              onNewSuit={() => {
                setEditingSuit(null);
                setIsSuitModalOpen(true);
              }}
            />
          </div>
        )}

        {/* VIEW 3: AI LEGAL ADVISORY */}
        {activeTab === 'chat' && <LegalChat />}
      </main>

      {/* Suit Creation/Edit Modal */}
      <SuitFormModal
        isOpen={isSuitModalOpen}
        onClose={() => {
          setIsSuitModalOpen(false);
          setEditingSuit(null);
        }}
        onSave={handleSaveSuit}
        initialSuit={editingSuit}
        templates={templates}
      />
    </div>
  );
}
