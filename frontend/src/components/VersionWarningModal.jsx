import React from 'react';
import { AlertTriangle, CheckCircle, ArrowRight, X } from 'lucide-react';

export default function VersionWarningModal({ alertData, onClose, onOpenCurrent, onViewPrevious }) {
  if (!alertData) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full border border-red-200 overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Top Warning Banner Header */}
        <div className="bg-white px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-slate-800">
            <span className="font-extrabold text-lg">System Integrity Alert</span>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Alert Content */}
        <div className="p-6 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-red-50 rounded-full text-red-500 flex items-center justify-center mx-auto border border-red-100">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-extrabold text-slate-900">
              Outdated Document Blocked
            </h2>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              You are attempting to access a deprecated manual revision superseded by a certified release.
            </p>
          </div>

          {/* Comparison Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Previous Version Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3 relative">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">PREVIOUS VERSION</span>
                  <span className="text-sm font-extrabold text-slate-800">v4.1 (Dec 2023)</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-600 uppercase">
                  REPLACED
                </span>
              </div>

              <div className="text-xs space-y-1.5 text-slate-600 font-mono pt-2 border-t border-slate-200">
                <p><span className="text-slate-400 font-sans">ID:</span> FM-2021-V6-TQR</p>
                <p><span className="text-slate-400 font-sans">Torque Limit:</span> 35 Nm (25 lb-ft)</p>
                <p><span className="text-slate-400 font-sans">Sequence:</span> 8-bolt routing</p>
              </div>
            </div>

            {/* Approved Version Card */}
            <div className="bg-emerald-50/50 border border-emerald-300 rounded-lg p-4 space-y-3 relative">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">APPROVED VERSION</span>
                  <span className="text-sm font-extrabold text-emerald-900">v4.2 (Jan 2024)</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500 text-white uppercase shadow-2xs">
                  ACTIVE
                </span>
              </div>

              <div className="text-xs space-y-1.5 text-emerald-900 font-mono pt-2 border-t border-emerald-200">
                <p><span className="text-emerald-600 font-sans">ID:</span> FM-2021-V6-TQR (Rev)</p>
                <p><span className="text-emerald-600 font-sans">Torque Limit:</span> 40 Nm (30 lb-ft)</p>
                <p><span className="text-emerald-600 font-sans">Sequence:</span> 9-bolt updated</p>
              </div>
            </div>
          </div>

          {/* Explanation Text */}
          <div className="text-[11px] text-slate-500 bg-slate-50 p-3 rounded-md border border-slate-200 leading-relaxed text-center">
            The updated sequence introduces two additional stabilizers to prevent seal leakage under high-cabin temperature loads. Running the previous v4.1 procedure might cause diagnostic failure codes.
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-center space-x-3 pt-2">
            <button
              onClick={onViewPrevious}
              className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
            >
              View Previous Version
            </button>
            <button
              onClick={onOpenCurrent}
              className="px-5 py-2 bg-sky-600 text-white rounded-lg text-xs font-bold hover:bg-sky-700 transition shadow-sm flex items-center space-x-1.5 cursor-pointer"
            >
              <span>Open Current Version</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
