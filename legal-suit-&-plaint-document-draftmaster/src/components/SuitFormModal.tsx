import React, { useState, useEffect } from 'react';
import { SuitDto, PartyDto, PropertyDto } from '../types';
import { X, Plus, Trash2, Building2, User, Home, Gavel } from 'lucide-react';

interface SuitFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (suit: SuitDto) => void;
  initialSuit?: SuitDto | null;
}

export const SuitFormModal: React.FC<SuitFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialSuit
}) => {
  const [court, setCourt] = useState('IN THE COURT OF THE CIVIL JUDGE (SENIOR DIVISION)');
  const [city, setCity] = useState('Bengaluru, Karnataka');
  const [lawyer, setLawyer] = useState('Adv. Rajesh Sharma, High Court Advocate');
  const [suitType, setSuitType] = useState('PLAINT_RECOVERY');
  const [relief, setRelief] = useState('Recovery of principal sum of Rs. 25,00,000/- with interest @ 18% p.a., costs of suit and permanent injunction.');

  const [plaintiffs, setPlaintiffs] = useState<PartyDto[]>([
    {
      id: 1,
      name: 'Shri Ramesh Kumar',
      relation: 'S/o Late Suresh Kumar',
      gender: 'Male',
      age: 42,
      occupation: 'Business / Proprietor',
      address: 'No. 45, MG Road, Ward 12, Bengaluru - 560001',
      partyType: 'PLAINTIFF'
    }
  ]);

  const [defendants, setDefendants] = useState<PartyDto[]>([
    {
      id: 2,
      name: 'Shri Vijay Verma',
      relation: 'S/o Shri Somnath Verma',
      gender: 'Male',
      age: 48,
      occupation: 'Commercial Trader',
      address: 'Plot No. 88, Industrial Layout, Peenya, Bengaluru - 560058',
      partyType: 'DEFENDANT'
    }
  ]);

  const [properties, setProperties] = useState<PropertyDto[]>([
    {
      id: 1,
      type: 'Commercial Office Premises',
      mkvalue: '60,00,000',
      extent: '2400 sq. ft.',
      syn: 'Sy. No. 112/A',
      hn: 'Door No. 12',
      plotNo: 'Plot No. 88'
    }
  ]);

  useEffect(() => {
    if (initialSuit) {
      setCourt(initialSuit.court || '');
      setCity(initialSuit.city || '');
      setLawyer(initialSuit.lawyer || '');
      setSuitType(initialSuit.suitType || 'PLAINT_RECOVERY');
      setRelief(initialSuit.relief || '');
      setPlaintiffs(initialSuit.plaintiffs?.length ? initialSuit.plaintiffs : plaintiffs);
      setDefendants(initialSuit.defendants?.length ? initialSuit.defendants : defendants);
      setProperties(initialSuit.property?.length ? initialSuit.property : properties);
    }
  }, [initialSuit]);

  if (!isOpen) return null;

  const handleAddPlaintiff = () => {
    setPlaintiffs([
      ...plaintiffs,
      {
        id: Date.now(),
        name: '',
        relation: 'S/o ',
        gender: 'Male',
        age: 35,
        occupation: 'Service / Business',
        address: '',
        partyType: 'PLAINTIFF'
      }
    ]);
  };

  const handleRemovePlaintiff = (id: number) => {
    if (plaintiffs.length > 1) {
      setPlaintiffs(plaintiffs.filter(p => p.id !== id));
    }
  };

  const handleAddDefendant = () => {
    setDefendants([
      ...defendants,
      {
        id: Date.now(),
        name: '',
        relation: 'S/o ',
        gender: 'Male',
        age: 40,
        occupation: 'Business',
        address: '',
        partyType: 'DEFENDANT'
      }
    ]);
  };

  const handleRemoveDefendant = (id: number) => {
    if (defendants.length > 1) {
      setDefendants(defendants.filter(d => d.id !== id));
    }
  };

  const handleAddProperty = () => {
    setProperties([
      ...properties,
      {
        id: Date.now(),
        type: 'Residential Premises',
        mkvalue: '50,00,000',
        extent: '1200 sq. ft.',
        syn: 'Sy No. 12',
        hn: 'No. 1',
        plotNo: 'Plot 1'
      }
    ]);
  };

  const handleRemoveProperty = (id: number) => {
    if (properties.length > 1) {
      setProperties(properties.filter(p => p.id !== id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newSuit: SuitDto = {
      id: initialSuit?.id || Date.now(),
      court,
      city,
      lawyer,
      suitType,
      relief,
      plaintiffs,
      defendants,
      property: properties,
      date: new Date().toISOString(),
      affiantIndex: '1'
    };
    onSave(newSuit);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <Gavel className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-serif font-bold tracking-wide">
              {initialSuit ? 'Edit Legal Suit Record' : 'Register New Suit / Plaint Entry'}
            </h2>
          </div>
          <button
            id="close-suit-modal-btn"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 text-slate-800 text-sm">
          {/* Forum & Court Details */}
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-4">
            <h3 className="font-semibold text-slate-900 flex items-center space-x-2 border-b border-slate-200 pb-2">
              <Building2 className="w-4 h-4 text-amber-600" />
              <span>1. Court Forum & Legal Representation</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Court Jurisdiction Title
                </label>
                <input
                  type="text"
                  required
                  value={court}
                  onChange={e => setCourt(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white"
                  placeholder="e.g. IN THE COURT OF THE CIVIL JUDGE (SR DIV)"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  City / Station & State
                </label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white"
                  placeholder="e.g. Bengaluru, Karnataka"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Advocate / Senior Counsel Name
                </label>
                <input
                  type="text"
                  required
                  value={lawyer}
                  onChange={e => setLawyer(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white"
                  placeholder="e.g. Adv. Rajesh Sharma, High Court Advocate"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Suit Category / Nature
                </label>
                <select
                  value={suitType}
                  onChange={e => setSuitType(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white font-medium text-slate-800"
                >
                  <option value="PLAINT_RECOVERY">Money Suit / Recovery of Debt (Order XXXVII)</option>
                  <option value="PLAINT_INJUNCTION">Declaration of Title & Permanent Injunction</option>
                  <option value="PLAINT_SPECIFIC_PERFORMANCE">Specific Performance of Agreement to Sell</option>
                  <option value="EVICTION_PETITION">Eviction of Tenant & Rent Arrears</option>
                </select>
              </div>
            </div>
          </div>

          {/* Plaintiff(s) */}
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h3 className="font-semibold text-slate-900 flex items-center space-x-2">
                <User className="w-4 h-4 text-emerald-600" />
                <span>2. Plaintiff(s) Details</span>
              </h3>
              <button
                type="button"
                onClick={handleAddPlaintiff}
                className="text-xs bg-emerald-100 text-emerald-800 hover:bg-emerald-200 px-2.5 py-1 rounded font-medium flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Co-Plaintiff</span>
              </button>
            </div>

            {plaintiffs.map((p, index) => (
              <div key={p.id} className="p-3 bg-white rounded-md border border-slate-200 space-y-3 relative">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Plaintiff #{index + 1}
                  </span>
                  {plaintiffs.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemovePlaintiff(p.id)}
                      className="text-red-500 hover:text-red-700 text-xs flex items-center space-x-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Full Name / Entity</label>
                    <input
                      type="text"
                      required
                      value={p.name}
                      onChange={e => {
                        const updated = [...plaintiffs];
                        updated[index].name = e.target.value;
                        setPlaintiffs(updated);
                      }}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs"
                      placeholder="e.g. Ramesh Kumar"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Parentage / Relation</label>
                    <input
                      type="text"
                      value={p.relation}
                      onChange={e => {
                        const updated = [...plaintiffs];
                        updated[index].relation = e.target.value;
                        setPlaintiffs(updated);
                      }}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs"
                      placeholder="e.g. S/o Late Suresh Kumar"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Occupation</label>
                    <input
                      type="text"
                      value={p.occupation}
                      onChange={e => {
                        const updated = [...plaintiffs];
                        updated[index].occupation = e.target.value;
                        setPlaintiffs(updated);
                      }}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs"
                      placeholder="Business / Service"
                    />
                  </div>
                  <div className="sm:col-span-2 lg:col-span-3">
                    <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Residential / Office Address</label>
                    <input
                      type="text"
                      required
                      value={p.address}
                      onChange={e => {
                        const updated = [...plaintiffs];
                        updated[index].address = e.target.value;
                        setPlaintiffs(updated);
                      }}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs"
                      placeholder="Door No, Street, Ward, City, Pin"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Defendant(s) */}
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h3 className="font-semibold text-slate-900 flex items-center space-x-2">
                <User className="w-4 h-4 text-red-600" />
                <span>3. Defendant(s) Details</span>
              </h3>
              <button
                type="button"
                onClick={handleAddDefendant}
                className="text-xs bg-red-100 text-red-800 hover:bg-red-200 px-2.5 py-1 rounded font-medium flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Co-Defendant</span>
              </button>
            </div>

            {defendants.map((d, index) => (
              <div key={d.id} className="p-3 bg-white rounded-md border border-slate-200 space-y-3 relative">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Defendant #{index + 1}
                  </span>
                  {defendants.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveDefendant(d.id)}
                      className="text-red-500 hover:text-red-700 text-xs flex items-center space-x-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Full Name / Entity</label>
                    <input
                      type="text"
                      required
                      value={d.name}
                      onChange={e => {
                        const updated = [...defendants];
                        updated[index].name = e.target.value;
                        setDefendants(updated);
                      }}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs"
                      placeholder="e.g. Vijay Verma"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Parentage / Relation</label>
                    <input
                      type="text"
                      value={d.relation}
                      onChange={e => {
                        const updated = [...defendants];
                        updated[index].relation = e.target.value;
                        setDefendants(updated);
                      }}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs"
                      placeholder="e.g. S/o Somnath Verma"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Occupation</label>
                    <input
                      type="text"
                      value={d.occupation}
                      onChange={e => {
                        const updated = [...defendants];
                        updated[index].occupation = e.target.value;
                        setDefendants(updated);
                      }}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs"
                      placeholder="Commercial Trader"
                    />
                  </div>
                  <div className="sm:col-span-2 lg:col-span-3">
                    <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Address</label>
                    <input
                      type="text"
                      required
                      value={d.address}
                      onChange={e => {
                        const updated = [...defendants];
                        updated[index].address = e.target.value;
                        setDefendants(updated);
                      }}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs"
                      placeholder="Door No, Street, Layout, City"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Property Schedule */}
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h3 className="font-semibold text-slate-900 flex items-center space-x-2">
                <Home className="w-4 h-4 text-indigo-600" />
                <span>4. Schedule Property Particulars</span>
              </h3>
              <button
                type="button"
                onClick={handleAddProperty}
                className="text-xs bg-indigo-100 text-indigo-800 hover:bg-indigo-200 px-2.5 py-1 rounded font-medium flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Property Item</span>
              </button>
            </div>

            {properties.map((prop, index) => (
              <div key={prop.id} className="p-3 bg-white rounded-md border border-slate-200 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Property Type</label>
                    <input
                      type="text"
                      value={prop.type}
                      onChange={e => {
                        const updated = [...properties];
                        updated[index].type = e.target.value;
                        setProperties(updated);
                      }}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs"
                      placeholder="Commercial Premises / Land"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Market Value (INR)</label>
                    <input
                      type="text"
                      value={prop.mkvalue}
                      onChange={e => {
                        const updated = [...properties];
                        updated[index].mkvalue = e.target.value;
                        setProperties(updated);
                      }}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs"
                      placeholder="e.g. 50,00,000"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Extent / Area</label>
                    <input
                      type="text"
                      value={prop.extent}
                      onChange={e => {
                        const updated = [...properties];
                        updated[index].extent = e.target.value;
                        setProperties(updated);
                      }}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs"
                      placeholder="e.g. 2400 sq. ft."
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Survey / Khata No (syn)</label>
                    <input
                      type="text"
                      value={prop.syn}
                      onChange={e => {
                        const updated = [...properties];
                        updated[index].syn = e.target.value;
                        setProperties(updated);
                      }}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs"
                      placeholder="Sy. No. 112/A"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-0.5">House / Door No (hn)</label>
                    <input
                      type="text"
                      value={prop.hn}
                      onChange={e => {
                        const updated = [...properties];
                        updated[index].hn = e.target.value;
                        setProperties(updated);
                      }}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs"
                      placeholder="No. 12"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Plot No</label>
                    <input
                      type="text"
                      value={prop.plotNo}
                      onChange={e => {
                        const updated = [...properties];
                        updated[index].plotNo = e.target.value;
                        setProperties(updated);
                      }}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs"
                      placeholder="Plot No. 88"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Main Relief Claimed */}
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-2">
            <label className="block text-xs font-semibold text-slate-800">
              5. Main Relief & Prayer Claimed
            </label>
            <textarea
              required
              rows={3}
              value={relief}
              onChange={e => setRelief(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-amber-500 text-xs font-sans"
              placeholder="State the core decree sought (e.g. Recovery of money, possession, declaration, injunction)"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 font-medium text-xs transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="save-suit-submit-btn"
              className="px-5 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-slate-950 font-semibold text-xs transition shadow"
            >
              Save Suit Record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
