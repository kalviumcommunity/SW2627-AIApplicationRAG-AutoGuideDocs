import React from 'react';
import { 
  LayoutDashboard, 
  Search, 
  BookOpen, 
  Activity, 
  AlertTriangle, 
  FileText,
  Database
} from 'lucide-react';

export default function Sidebar({ currentPage, setCurrentPage, activeDatabase = "NA_EAST_v2024.12.1" }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'vehicle-search', label: 'Vehicle Search', icon: Search },
    { id: 'technical-manuals', label: 'Technical Manuals', icon: BookOpen },
    { id: 'diagnostics', label: 'Diagnostics (OBD)', icon: Activity },
    { id: 'recall-registry', label: 'Recall Registry', icon: AlertTriangle },
    { id: 'service-bulletins', label: 'Service Bulletins', icon: FileText },
  ];

  return (
    <aside className="w-60 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 min-h-[calc(100vh-4rem)]">
      {/* Top Nav List */}
      <div className="p-4 space-y-1">
        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
          Navigation
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer ${
                isActive
                  ? 'bg-sky-50 text-sky-600 border border-sky-100 font-bold shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-sky-600' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Bottom Database Footer */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <div className="flex items-center space-x-2 text-[10px] uppercase font-extrabold text-slate-400 tracking-wider mb-1">
          <Database className="w-3 h-3 text-slate-400" />
          <span>Active Database</span>
        </div>
        <div className="flex items-center space-x-2 text-xs font-mono font-bold text-slate-700 bg-white px-2.5 py-1.5 rounded border border-slate-200 shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>{activeDatabase}</span>
        </div>
      </div>
    </aside>
  );
}
