import React, { useState, useEffect } from 'react';
import { Search, Filter, Bot, ExternalLink, AlertCircle, FileText, CheckCircle2 } from 'lucide-react';
import { searchRAG } from '../services/api';

export default function SearchResultsPage({ searchQuery, setSearchQuery, setCurrentPage, setSelectedDocId, activeRegion }) {
  const [queryInput, setQueryInput] = useState(searchQuery || 'engine overheating');
  const [docTypeFilter, setDocTypeFilter] = useState('All');
  const [systemFilter, setSystemFilter] = useState('Engine Cooling (53-03)');
  const [sortBy, setSortBy] = useState('Most Relevant');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  const performSearch = async (term = queryInput) => {
    setLoading(true);
    try {
      const data = await searchRAG(term, {
        vehicleModel: '2021 Ford F-150 Lariat 4WD',
        region: activeRegion || 'US-EAST',
        docType: docTypeFilter,
        system: systemFilter === 'All' ? 'All' : 'Engine Cooling',
      });
      setResults(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    performSearch(searchQuery || 'engine overheating');
  }, [searchQuery, activeRegion]);

  const handleRunSearch = (e) => {
    e?.preventDefault();
    setSearchQuery(queryInput);
    performSearch(queryInput);
  };

  const handleOpenDocument = (docId) => {
    setSelectedDocId(docId);
    setCurrentPage('document-viewer');
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header Title */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Query Diagnostics Database
        </h1>
      </div>

      {/* Main Search Bar Form */}
      <form onSubmit={handleRunSearch} className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute left-3.5 top-3.5 text-slate-400" />
          <input
            type="text"
            value={queryInput}
            onChange={(e) => setQueryInput(e.target.value)}
            placeholder="Type symptom or code (e.g. engine overheating, P0217)..."
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-300 rounded-xl text-sm font-semibold text-slate-800 shadow-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition cursor-pointer"
        >
          {loading ? 'Searching RAG...' : 'Run Diagnostic Search'}
        </button>
      </form>

      {/* Filter Toolbar Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white rounded-xl border border-slate-200 text-xs font-semibold shadow-2xs">
        <div className="flex flex-wrap items-center gap-3">
          {/* Doc Type Filter */}
          <div className="flex items-center space-x-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
            <span className="text-slate-400 font-normal">Document Type:</span>
            <select
              value={docTypeFilter}
              onChange={(e) => setDocTypeFilter(e.target.value)}
              className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="All">All Manuals & TSBs</option>
              <option value="TECHNICAL MANUAL">Technical Manuals</option>
              <option value="SERVICE BULLETIN">Service Bulletins (TSB)</option>
            </select>
          </div>

          {/* Applicability Filter */}
          <div className="flex items-center space-x-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
            <span className="text-slate-400 font-normal">Applicability:</span>
            <span className="font-bold text-slate-800">2021 Ford F-150</span>
          </div>

          {/* System Category Filter */}
          <div className="flex items-center space-x-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
            <span className="text-slate-400 font-normal">System:</span>
            <select
              value={systemFilter}
              onChange={(e) => setSystemFilter(e.target.value)}
              className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="Engine Cooling (53-03)">Engine Cooling (53-03)</option>
              <option value="All">All Systems</option>
            </select>
          </div>
        </div>

        {/* Sort By Filter */}
        <div className="flex items-center space-x-2">
          <span className="text-slate-400 font-normal">Sort By:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 font-bold text-slate-800 focus:outline-none cursor-pointer"
          >
            <option>Most Relevant</option>
            <option>Latest Updated</option>
          </select>
        </div>
      </div>

      {/* Match Counter Header */}
      <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
        <p>
          Showing <span className="font-bold text-slate-800">{results?.matches?.length || 3} matches</span> found in <span className="font-bold text-slate-800">{activeRegion || 'US-EAST'} database</span> for "{queryInput}"
        </p>
        <button
          onClick={() => {
            setDocTypeFilter('All');
            setSystemFilter('Engine Cooling (53-03)');
            setQueryInput('engine overheating');
            performSearch('engine overheating');
          }}
          className="text-sky-600 hover:underline cursor-pointer"
        >
          Reset All Filters
        </button>
      </div>

      {/* RAG Synthesis AI Assistant Box */}
      {results?.ai_summary && (
        <div className="bg-sky-50/70 border border-sky-200 rounded-xl p-5 shadow-2xs space-y-3">
          <div className="flex items-center space-x-2 text-sky-800 font-black text-xs">
            <Bot className="w-4 h-4 text-sky-600" />
            <span>AutoGuide RAG Intelligence Assistant • {results.ai_summary.verification_status}</span>
          </div>
          <p className="text-xs text-slate-700 font-bold">
            {results.ai_summary.headline}
          </p>
          <ul className="list-disc list-inside text-xs text-slate-600 space-y-1 pl-1">
            {results.ai_summary.summary_bullets?.map((b, i) => (
              <li key={i}>{b}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Document Results Feed */}
      <div className="space-y-4">
        {results?.matches?.map((m) => (
          <div
            key={m.doc_id}
            className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4 hover:border-sky-300 transition"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-mono font-extrabold uppercase px-2 py-0.5 rounded bg-sky-100 text-sky-800">
                  {m.doc_id} {m.doc_type}
                </span>
                {m.doc_type.includes('BULLETIN') && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-100 text-red-700 uppercase">
                    URGENT TSB
                  </span>
                )}
              </div>

              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                {m.status}
              </span>
            </div>

            <div>
              <h3 className="text-base font-extrabold text-slate-900 leading-snug">
                {m.title}
              </h3>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                {m.chunks?.[0]?.content || "Standard OEM certified procedures and diagnostic steps."}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-between pt-3 border-t border-slate-100 gap-4 text-xs">
              <div className="flex items-center space-x-4 text-[11px] font-medium text-slate-400">
                <span>Applicability: <strong className="text-slate-700">{m.applicability}</strong></span>
                <span>Doc Version: <strong className="text-slate-700">{m.version}</strong></span>
                <span>Last Updated: <strong className="text-slate-700">{m.last_updated}</strong></span>
              </div>

              <button
                onClick={() => handleOpenDocument(m.doc_id)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg transition flex items-center space-x-1.5 cursor-pointer"
              >
                <span>Open Document</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
