import React, { useState, useEffect } from 'react';
import { Search, Car, ShieldAlert, CheckCircle, ArrowRight, ExternalLink, Activity } from 'lucide-react';
import { getRecentVehicles, getRecalls } from '../services/api';

export default function DashboardPage({ setCurrentPage, setSelectedVehicle, user }) {
  const [vehicles, setVehicles] = useState([]);
  const [recalls, setRecalls] = useState([]);

  useEffect(() => {
    getRecentVehicles().then(data => setVehicles(data.vehicles || [])).catch(() => {});
    getRecalls(user?.region || 'US-EAST').then(data => setRecalls(data.recalls || [])).catch(() => {});
  }, [user]);

  const handleSelectVehicle = (veh) => {
    setSelectedVehicle(veh);
    setCurrentPage('vehicle-overview');
  };

  const displayName = user?.name ? `${user.role ? user.role + ' ' : ''}${user.name}` : 'Chief Tech Marcus';

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Welcome Back, {displayName}
          </h1>
          <p className="text-xs font-semibold text-slate-500 mt-1">
            Enterprise DB {user?.region || 'NA-EAST'} is synced, {recalls.length || 4} Active recalls recorded in region.
          </p>
        </div>
      </div>

      {/* Primary Technician Shortcuts Grid */}
      <div>
        <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-3">
          Primary Technician Shortcuts
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1 */}
          <button
            onClick={() => setCurrentPage('vehicle-search')}
            className="p-5 bg-white border border-slate-200 hover:border-sky-400 rounded-xl transition shadow-xs text-left group flex items-start space-x-4 cursor-pointer"
          >
            <div className="w-10 h-10 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 group-hover:bg-sky-600 group-hover:text-white transition">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-800 group-hover:text-sky-600 transition">
                Select New Vehicle
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Run multi-criteria filter
              </p>
            </div>
          </button>

          {/* Card 2 */}
          <button
            onClick={() => setCurrentPage('vehicle-search')}
            className="p-5 bg-white border border-slate-200 hover:border-amber-400 rounded-xl transition shadow-xs text-left group flex items-start space-x-4 cursor-pointer"
          >
            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 group-hover:bg-amber-600 group-hover:text-white transition">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-800 group-hover:text-amber-600 transition">
                VIN Lookup Tool
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Scan or enter 17-digit VIN
              </p>
            </div>
          </button>

          {/* Card 3 */}
          <button
            onClick={() => setCurrentPage('technical-manuals')}
            className="p-5 bg-white border border-slate-200 hover:border-emerald-400 rounded-xl transition shadow-xs text-left group flex items-start space-x-4 cursor-pointer"
          >
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-800 group-hover:text-emerald-600 transition">
                Approved Manuals
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                View OEM certified releases
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Main Grid: Workday Diagnostics & Bulletins */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Active Workday Diagnostics */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="font-extrabold text-sm text-slate-900 tracking-tight">
              Active Workday Diagnostics
            </h2>
            <button 
              onClick={() => setCurrentPage('vehicle-search')}
              className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center space-x-1 cursor-pointer"
            >
              <span>View History</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {vehicles.map((v, i) => (
              <div
                key={v.vin || i}
                onClick={() => handleSelectVehicle(v)}
                className="p-4 rounded-lg bg-slate-50 hover:bg-sky-50/60 border border-slate-200 hover:border-sky-300 transition flex items-center justify-between cursor-pointer group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded bg-white text-slate-700 flex items-center justify-center font-bold text-xs border border-slate-200 shadow-2xs group-hover:border-sky-300">
                    <Car className="w-4 h-4 text-sky-600" />
                  </div>
                  <div>
                    <h3 className="text-xs font-extrabold text-slate-800 group-hover:text-sky-700">
                      {v.year} {v.manufacturer.split(' ')[0]} {v.model_family} {v.trim_variant || ''}
                    </h3>
                    <p className="text-[11px] font-mono text-slate-400">
                      VIN: {v.vin} • Region: {v.market_region}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                    v.status === 'Active Sync'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : v.status === 'In Review'
                      ? 'bg-sky-50 text-sky-700 border-sky-200'
                      : 'bg-slate-200 text-slate-600 border-slate-300'
                  }`}>
                    {v.status}
                  </span>
                  <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-sky-600" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Active Bulletins & Recalls */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="font-extrabold text-sm text-slate-900 tracking-tight">
              Active Bulletins & Recalls
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-100 text-red-700 uppercase">
              {recalls.length} Urgent
            </span>
          </div>

          <div className="space-y-3">
            {recalls.map((r) => (
              <div
                key={r.recall_id}
                onClick={() => setCurrentPage('recall-registry')}
                className={`p-3.5 rounded-lg border text-xs space-y-1.5 cursor-pointer transition ${
                  r.severity.includes('HAZARD') || r.severity.includes('URGENT')
                    ? 'bg-red-50/50 border-red-200 hover:bg-red-100/50'
                    : 'bg-amber-50/50 border-amber-200 hover:bg-amber-100/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-[11px] text-red-700">
                    {r.nhtsa_id}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-500 uppercase">
                    {r.region}
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 leading-snug">
                  {r.title}
                </h3>
                <p className="text-[11px] text-slate-600 leading-normal">
                  {r.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
