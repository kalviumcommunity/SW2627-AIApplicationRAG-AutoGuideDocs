import React, { useState } from 'react';
import { 
  Car, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  Activity, 
  ArrowRight, 
  ShieldAlert,
  ChevronRight
} from 'lucide-react';

export default function VehicleOverviewPage({ vehicle, setCurrentPage, setSelectedDocId }) {
  const [activeTab, setActiveTab] = useState('manuals');

  const currentVeh = vehicle || {
    title: '2021 Ford F-150 Lariat 4WD',
    vin: '1FTFW1EG5MFXXXXXX',
    engine: '3.5L V6 EcoBoost',
    market: 'US / CA (Region Restricted)',
    version: 'Active diagnostics v4.2.1'
  };

  const documentFeed = [
    {
      doc_id: 'MAN-03-098',
      title: 'Cylinder Head Bolt Torque Specifications & Assembly Sequence',
      version: 'Approved v4.2',
      code: 'FM-2021-V6-TQR',
      last_updated: 'Jan 2024',
      status: 'Approved'
    },
    {
      doc_id: 'MAN-10R80-FLUID',
      title: '10R80 Automatic Transmission Fluid Drain & Refill Procedure',
      version: 'Approved v3.1',
      code: 'FM-21-10R80-FLD',
      last_updated: 'Nov 2023',
      status: 'Approved'
    },
    {
      doc_id: 'MAN-TIMING-CHAIN',
      title: 'Primary Timing Chain Routing and Camshaft Phasing Alignments',
      version: 'Approved v2.0',
      code: 'FM-V6-CHN-PHS',
      last_updated: 'Aug 2023',
      status: 'Approved'
    }
  ];

  const handleOpenDoc = (docId) => {
    setSelectedDocId(docId);
    setCurrentPage('document-viewer');
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Top Page Title */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Technical Documentation Portal
        </h1>
      </div>

      {/* Active Vehicle Header Card */}
      <div className="bg-sky-50/50 border border-sky-200 rounded-xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 rounded-xl bg-sky-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            <Car className="w-6 h-6" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center space-x-3">
              <h2 className="text-xl font-black text-slate-900">
                {currentVeh.title || `${currentVeh.year} ${currentVeh.manufacturer} ${currentVeh.model_family}`}
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-300">
                {currentVeh.version || 'Active diagnostics v4.2.1'}
              </span>
            </div>

            <p className="text-xs text-slate-600 font-medium">
              <span className="font-mono">VIN: {currentVeh.vin}</span> • Engine: {currentVeh.engine || currentVeh.engine_platform} • Market: {currentVeh.market || currentVeh.market_region}
            </p>
          </div>
        </div>

        <button
          onClick={() => setCurrentPage('diagnostic-guide')}
          className="px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-lg shadow-sm transition flex items-center space-x-2 shrink-0 cursor-pointer"
        >
          <Activity className="w-4 h-4" />
          <span>Launch Interactive OBD Session</span>
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-slate-200 flex space-x-6 text-xs font-bold">
        <button
          onClick={() => setActiveTab('manuals')}
          className={`pb-3 border-b-2 transition cursor-pointer ${
            activeTab === 'manuals' ? 'border-sky-600 text-sky-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Technical Manuals
        </button>
        <button
          onClick={() => {
            setActiveTab('obd');
            setCurrentPage('diagnostic-guide');
          }}
          className={`pb-3 border-b-2 transition cursor-pointer ${
            activeTab === 'obd' ? 'border-sky-600 text-sky-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          OBD Diagnostics
        </button>
        <button
          onClick={() => {
            setActiveTab('recalls');
            setCurrentPage('recall-registry');
          }}
          className={`pb-3 border-b-2 transition cursor-pointer ${
            activeTab === 'recalls' ? 'border-sky-600 text-sky-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          OEM Recalls (1 Active)
        </button>
        <button
          onClick={() => {
            setActiveTab('tsb');
            setCurrentPage('search-results');
          }}
          className={`pb-3 border-b-2 transition cursor-pointer ${
            activeTab === 'tsb' ? 'border-sky-600 text-sky-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Technical Bulletins (TSB)
        </button>
      </div>

      {/* Main Content Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: OEM Certified Document Feed (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-extrabold text-sm text-slate-900 tracking-tight">
              OEM Certified Document Feed
            </h3>
            <span className="text-[10px] font-semibold text-slate-400">
              Version History Available
            </span>
          </div>

          <div className="space-y-3">
            {documentFeed.map((doc) => (
              <div
                key={doc.doc_id}
                onClick={() => handleOpenDoc(doc.doc_id)}
                className="p-4 rounded-xl bg-slate-50 hover:bg-sky-50/60 border border-slate-200 hover:border-sky-300 transition flex items-center justify-between cursor-pointer group"
              >
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded bg-white text-sky-600 flex items-center justify-center shrink-0 border border-slate-200 shadow-2xs group-hover:bg-sky-600 group-hover:text-white transition mt-0.5">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-900 group-hover:text-sky-700 transition">
                      {doc.title}
                    </h4>
                    <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                      Doc ID: {doc.code} • Last Update: {doc.last_updated}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {doc.version}
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-sky-600" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Safety Recalls & Session Checklist */}
        <div className="space-y-6">
          {/* Card 1: Safety Recalls Flagged */}
          <div className="bg-red-50/60 border border-red-200 rounded-xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-red-100">
              <h3 className="font-extrabold text-xs text-red-900 uppercase tracking-wider flex items-center space-x-1.5">
                <ShieldAlert className="w-4 h-4 text-red-600" />
                <span>Safety Recalls Flagged</span>
              </h3>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-red-100 text-red-700 border border-red-300">
                1 ACTIVE NHTSA HAZARD
              </span>
              <h4 className="font-bold text-xs text-slate-900 mt-2">
                Brake Master Cylinder Fluid Leak
              </h4>
              <p className="text-[11px] text-slate-600 leading-normal">
                Loss of braking assist. Ensure field pressure verification routing FM-24012 is followed strictly.
              </p>
            </div>
          </div>

          {/* Card 2: Session Diagnostic Checklist */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2">
              SESSION DIAGNOSTIC CHECKLIST
            </h3>

            <div className="space-y-2.5 text-xs font-semibold text-slate-700">
              <div className="flex items-center space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>CAN Bus connection stable</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Database emissions checked</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                <span>TSB revision 4.2 pending review</span>
              </div>
            </div>

            <button
              onClick={() => setCurrentPage('diagnostic-guide')}
              className="w-full mt-2 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg transition flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <span>Interactive Workflow Guide</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
