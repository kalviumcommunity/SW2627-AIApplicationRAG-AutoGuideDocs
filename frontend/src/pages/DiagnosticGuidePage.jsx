import React, { useState, useEffect } from 'react';
import { CheckCircle2, Circle, AlertTriangle, Wrench, ShieldAlert, ArrowRight, ShieldCheck } from 'lucide-react';
import { getDiagnosticSession, advanceDiagnosticStep } from '../services/api';

export default function DiagnosticGuidePage({ setCurrentPage }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchSession = async () => {
    try {
      const data = await getDiagnosticSession('DIAG-F150-2021-001');
      setSession(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSession();
  }, []);

  const handleAdvanceStep = async () => {
    setLoading(true);
    try {
      await advanceDiagnosticStep('DIAG-F150-2021-001');
      await fetchSession();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const currentVeh = session?.vehicle || {
    title: '2021 Ford F-150 Lariat 4WD',
    vin: '1FTFW1EG5MFXXXXXX',
    engine: '3.5L V6 EcoBoost',
    diagnostics: 'OBD-II CAN v4.2'
  };

  const steps = session?.steps || [
    { step_num: 1, title: 'Connect CAN Diagnostic Bus', detail: 'Established secure OBD session. VIN validated.', completed: true },
    { step_num: 2, title: 'Query Active Thermal Fault Codes', detail: 'Detected active P0217 (Engine Over Temperature) & P1085.', completed: true },
    { step_num: 3, title: 'ECT Sensor Resistance Check', detail: 'Probe ECT Connector C102. Standard target resistance: 2.5k to 3.2k ohms.', completed: false },
    { step_num: 4, title: 'Coolant Flow & Thermostat Bypass test', detail: 'Command active duty cycle to bypass valve and observe data.', completed: false },
    { step_num: 5, title: 'Generate Certified Resolution Log', detail: 'Lock document revision code to work order history.', completed: false }
  ];

  const activeStepNum = session?.active_step || 3;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Page Header Title */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Interactive Diagnostic Workflow
        </h1>
      </div>

      {/* Vehicle Info Bar */}
      <div className="bg-sky-50/50 border border-sky-200 rounded-xl p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-sky-600 text-white flex items-center justify-center font-bold">
            OBD
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="font-extrabold text-slate-900 text-base">
                {currentVeh.title}
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-700">
                Active Diagnostics Session
              </span>
            </div>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              VIN: {currentVeh.vin} • Engine: {currentVeh.engine} • Diagnostics: {currentVeh.diagnostics || 'OBD-II CAN v4.2'}
            </p>
          </div>
        </div>
      </div>

      {/* 2-Column Interactive Workflow Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Left Column: Troubleshooting Sequence (3 cols) */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-extrabold text-sm text-slate-900 tracking-tight">
              Troubleshooting Sequence
            </h3>
            <span className="text-xs font-bold text-sky-600">
              {activeStepNum}/5 Steps Active
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-sky-600 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${(activeStepNum / 5) * 100}%` }}
            ></div>
          </div>

          {/* Steps List */}
          <div className="space-y-4 pt-2">
            {steps.map((step) => {
              const isCompleted = step.completed || step.step_num < activeStepNum;
              const isActive = step.step_num === activeStepNum;

              return (
                <div
                  key={step.step_num}
                  className={`p-4 rounded-xl border transition ${
                    isActive
                      ? 'bg-sky-50/70 border-sky-300 ring-2 ring-sky-100'
                      : isCompleted
                      ? 'bg-slate-50 border-slate-200'
                      : 'bg-white border-slate-200 opacity-60'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="mt-0.5 shrink-0">
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      ) : isActive ? (
                        <div className="w-5 h-5 rounded-full bg-sky-600 text-white flex items-center justify-center text-[10px] font-bold">
                          {step.step_num}
                        </div>
                      ) : (
                        <Circle className="w-5 h-5 text-slate-300" />
                      )}
                    </div>

                    <div className="space-y-1">
                      <h4 className={`text-xs font-extrabold ${isActive ? 'text-sky-900' : 'text-slate-800'}`}>
                        {step.title}
                      </h4>
                      <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                        {step.detail}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Verification Steps & Tools (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Critical Safety Box */}
          <div className="bg-red-50/70 border border-red-200 rounded-xl p-5 shadow-xs space-y-3">
            <div className="flex items-center space-x-2 text-red-700 font-extrabold text-xs">
              <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
              <span>CRITICAL SAFETY STANDARD</span>
            </div>

            <p className="text-xs font-bold text-red-900 leading-snug">
              SYSTEM UNDER EXTREME THERMAL PRESSURE. Do not remove coolant reservoir cap while engine is hot. Risk of severe burns.
            </p>
          </div>

          {/* Required Shop Tools */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2 flex items-center space-x-1.5">
              <Wrench className="w-3.5 h-3.5 text-slate-400" />
              <span>REQUIRED SHOP TOOLS</span>
            </h3>

            <div className="space-y-2 text-xs font-medium text-slate-700">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Digital Multimeter (DMM)</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>OBD-II CAN Diagnostic Interface Link</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleAdvanceStep}
              disabled={loading}
              className="w-full py-3 bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition cursor-pointer"
            >
              {loading ? 'Validating Signal...' : 'Accept Resistance & Advance'}
            </button>

            <button
              onClick={() => alert('Manual override request logged to supervisor queue.')}
              className="w-full py-2.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
            >
              Request Manual Override
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
