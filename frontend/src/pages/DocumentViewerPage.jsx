import React, { useState, useEffect } from 'react';
import { FileText, ShieldCheck, Printer, Check, AlertTriangle, ChevronRight, Lock } from 'lucide-react';
import { getManualDetail, checkVersionIntegrity } from '../services/api';

export default function DocumentViewerPage({ docId = 'MAN-03-098', triggerVersionWarning }) {
  const [docData, setDocData] = useState(null);
  const [activeSection, setActiveSection] = useState('02. Fastener Assembly Sequences');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    getManualDetail(docId)
      .then((data) => setDocData(data.document))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [docId]);

  const doc = docData || {
    doc_id: 'MAN-03-098',
    title: 'Cylinder Head Bolt Torque Specifications',
    version: 'v4.2',
    status: 'Approved',
    last_updated: 'Jan 12, 2024',
    content_full: 'Full document content'
  };

  const sections = [
    '01. Specifications & Clearances',
    '02. Fastener Assembly Sequences',
    '03. Torque Targets & Formulas',
    '04. Post-Assembly Verification'
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          OEM Certified Document Viewer
        </h1>

        {/* Test Version Warning Trigger Button */}
        <button
          onClick={triggerVersionWarning}
          className="px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs rounded-lg border border-red-200 flex items-center space-x-1.5 cursor-pointer"
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Simulate Deprecated Version Block</span>
        </button>
      </div>

      {/* Vehicle Context Bar */}
      <div className="bg-sky-50/50 border border-sky-200 rounded-xl p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-sky-600 text-white flex items-center justify-center font-bold">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="font-extrabold text-slate-900 text-base">
                2021 Ford F-150 Lariat 4WD
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-700">
                Active Diagnostics Session
              </span>
            </div>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              VIN: 1FTFW1EG5MFXXXXXX • Engine: 3.5L V6 EcoBoost • Diagnostics: OBD-II CAN v4.2
            </p>
          </div>
        </div>
      </div>

      {/* Main 2-Column Document Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Column: Document Structure Navigation (1 col) */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
            <h3 className="font-extrabold text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2">
              DOCUMENT STRUCTURE
            </h3>

            <div className="space-y-1">
              {sections.map((sec) => (
                <button
                  key={sec}
                  onClick={() => setActiveSection(sec)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                    activeSection === sec
                      ? 'bg-sky-50 text-sky-600 border border-sky-100'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {sec}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2 text-xs font-mono text-slate-600">
            <h3 className="font-sans font-extrabold text-[11px] uppercase tracking-wider text-slate-400">
              DOCUMENT INTEGRITY
            </h3>
            <p><span className="text-slate-400 font-sans">ID:</span> FM-2021-V6-TQR</p>
            <p><span className="text-slate-400 font-sans">Authority:</span> Ford OEM {doc.version}</p>
          </div>
        </div>

        {/* Center / Right Column: Active Document Content (3 cols) */}
        <div className="lg:col-span-3 bg-white border border-slate-200 rounded-xl p-8 shadow-xs space-y-6">
          {/* Doc Header Title & Status */}
          <div className="flex items-start justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-xl font-black text-slate-900">
                {doc.title}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                All cylinder head retention fasteners must be tightened in the exact sequence outlined below. Reusing old bolts is strictly prohibited due to critical torque-to-yield material deformation limits.
              </p>
            </div>

            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 uppercase tracking-wider shrink-0">
              APPROVED DOCUMENT
            </span>
          </div>

          {/* Mandatory Torque Audit Warning Banner */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-1">
            <div className="flex items-center space-x-2 text-amber-800 font-extrabold text-xs">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <span>MANDATORY TORQUE-TO-YIELD AUDIT</span>
            </div>
            <p className="text-xs text-amber-900 leading-relaxed font-medium">
              Fasteners are one-time use only. Torque sequences outside of certified parameters will void regional drivetrain warranty scopes.
            </p>
          </div>

          {/* Multi-Stage Sequence Steps */}
          <div className="space-y-4 pt-2">
            <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
              Multi-Stage Sequence Steps
            </h3>

            <div className="space-y-3 text-xs font-semibold text-slate-800">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg flex items-start space-x-3">
                <span className="font-extrabold text-sky-600 shrink-0">Stage 1:</span>
                <span>Torque all cylinder head bolts in numerical sequence (1-9) to 40 Nm (30 lb-ft).</span>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg flex items-start space-x-3">
                <span className="font-extrabold text-sky-600 shrink-0">Stage 2:</span>
                <span>Additional rotation sequence. Rotate all bolts in sequence a further 90 degrees.</span>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg flex items-start space-x-3">
                <span className="font-extrabold text-sky-600 shrink-0">Stage 3:</span>
                <span>Final validation check. Confirm breakaway thresholds exceed 65 Nm (48 lb-ft).</span>
              </div>
            </div>
          </div>

          {/* Document Footer & Execution Buttons */}
          <div className="flex flex-wrap items-center justify-between pt-6 border-t border-slate-100 gap-4 text-xs font-medium text-slate-400">
            <span>Published: Jan 12, 2024 • Verified by AutoGuide NA-EAST</span>

            <div className="flex items-center space-x-3">
              <button 
                onClick={() => window.print()}
                className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-700 font-bold hover:bg-slate-50 transition flex items-center space-x-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print PDF</span>
              </button>

              <button
                onClick={() => alert('Execution confirmed and logged to session audit ledger.')}
                className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-lg shadow-xs transition flex items-center space-x-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Confirm Execution</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
