import React, { useState, useEffect } from 'react';
import { RenderContextDto } from '../types';
import { Layers, Plus, Trash2, Check, ArrowUp, ArrowDown } from 'lucide-react';

interface ContextEditorProps {
  draftId: string;
  sectionKey: string;
  contexts: RenderContextDto[];
  onSaveContexts: (sectionKey: string, contexts: RenderContextDto[]) => void;
}

export const ContextEditor: React.FC<ContextEditorProps> = ({
  draftId,
  sectionKey,
  contexts,
  onSaveContexts
}) => {
  const [localContexts, setLocalContexts] = useState<RenderContextDto[]>([]);

  useEffect(() => {
    setLocalContexts(contexts || []);
  }, [contexts]);

  const handleAddContextBlock = () => {
    const newBlock: RenderContextDto = {
      sectionKey,
      definitionKey: `${sectionKey}_param_${Date.now()}`,
      context: 'Custom Sub-Clause',
      value: '',
      order: localContexts.length + 1,
      sourceType: 'MANUAL_ENTRY',
      editable: true
    };
    setLocalContexts([...localContexts, newBlock]);
  };

  const handleRemoveBlock = (index: number) => {
    const updated = localContexts.filter((_, idx) => idx !== index);
    setLocalContexts(updated);
  };

  const handleMoveBlock = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === localContexts.length - 1)
    ) {
      return;
    }
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const updated = [...localContexts];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    setLocalContexts(updated);
  };

  const handleSaveAll = () => {
    onSaveContexts(sectionKey, localContexts);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center space-x-2">
          <Layers className="w-4 h-4 text-amber-600" />
          <h3 className="font-serif font-bold text-slate-900 text-sm">
            Render Context Items ({sectionKey})
          </h3>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleAddContextBlock}
            className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium px-3 py-1.5 rounded-lg flex items-center space-x-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Context Block</span>
          </button>
          <button
            onClick={handleSaveAll}
            className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-4 py-1.5 rounded-lg flex items-center space-x-1 shadow transition"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Update Section Contexts</span>
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {localContexts.length === 0 ? (
          <p className="text-xs text-slate-400 italic py-4 text-center">
            No render context items defined for this section. Click "Add Context Block" to add a custom parameter.
          </p>
        ) : (
          localContexts.map((ctx, index) => (
            <div key={ctx.definitionKey || index} className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-bold bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-mono">
                    #{index + 1}
                  </span>
                  <input
                    type="text"
                    value={ctx.context}
                    onChange={e => {
                      const updated = [...localContexts];
                      updated[index].context = e.target.value;
                      setLocalContexts(updated);
                    }}
                    placeholder="Context Title / Label"
                    className="text-xs font-semibold text-slate-900 bg-white border border-slate-300 rounded px-2 py-1 w-60"
                  />
                  <span className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                    ctx.sourceType === 'AI_ASSISTED' ? 'bg-purple-100 text-purple-800' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {ctx.sourceType}
                  </span>
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleMoveBlock(index, 'up')}
                    disabled={index === 0}
                    className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleMoveBlock(index, 'down')}
                    disabled={index === localContexts.length - 1}
                    className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleRemoveBlock(index)}
                    className="p-1 text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div>
                <textarea
                  rows={4}
                  value={ctx.value}
                  onChange={e => {
                    const updated = [...localContexts];
                    updated[index].value = e.target.value;
                    setLocalContexts(updated);
                  }}
                  className="w-full text-xs font-serif p-2.5 bg-white border border-slate-300 rounded focus:ring-2 focus:ring-amber-500 text-slate-900"
                  placeholder="Enter context block legal text..."
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
