import React, { useState, useEffect } from 'react';
import { AlertTriangle, ShieldAlert, Globe, Search, Filter } from 'lucide-react';
import { getRecalls } from '../services/api';

export default function RecallRegistryPage({ activeRegion }) {
  const [recalls, setRecalls] = useState([]);
  const [filterRegion, setFilterRegion] = useState(activeRegion || 'US-EAST');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    getRecalls(filterRegion).then(data => setRecalls(data.recalls || [])).catch(() => {});
  }, [filterRegion]);

  const filteredRecalls = recalls.filter(r => 
    r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.nhtsa_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.models.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            NHTSA & OEM Recall Registry
          </h1>
          <p className="text-xs font-semibold text-slate-500 mt-1">
            Regionally enforced safety recalls, critical hazards, and service update bulletins.
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold">
          <Globe className="w-4 h-4 text-slate-400" />
          <span>Filter Region:</span>
          <select
            value={filterRegion}
            onChange={(e) => setFilterRegion(e.target.value)}
            className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer"
          >
            <option value="US-EAST">US-EAST</option>
            <option value="EU-WEST">EU-WEST</option>
            <option value="ASIA-PAC">ASIA-PAC</option>
          </select>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Filter by recall ID, title, or vehicle model..."
          className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
        />
      </div>

      {/* Recalls Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredRecalls.map((r) => (
          <div
            key={r.recall_id}
            className={`p-6 rounded-xl border space-y-3 bg-white shadow-xs transition hover:shadow-md ${
              r.severity.includes('HAZARD') || r.severity.includes('URGENT')
                ? 'border-red-200 border-l-4 border-l-red-500'
                : 'border-amber-200 border-l-4 border-l-amber-500'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-100">
                {r.nhtsa_id}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 uppercase">
                {r.region}
              </span>
            </div>

            <div>
              <h3 className="text-base font-extrabold text-slate-900 leading-snug">
                {r.title}
              </h3>
              <p className="text-xs font-bold text-slate-500 mt-1">
                Applicable Models: {r.models}
              </p>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
              {r.description}
            </p>

            <div className="flex items-center justify-between pt-2 text-xs text-slate-400 font-medium">
              <span>Published: {r.publication_date}</span>
              <span className="font-bold text-slate-700">{r.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
