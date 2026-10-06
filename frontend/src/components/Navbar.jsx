import React, { useState } from 'react';
import { ShieldCheck, Globe, User, Search, Upload, LogOut } from 'lucide-react';

export default function Navbar({ title, activeRegion, onRegionChange, onGlobalSearch, user, onSignOut, onOpenUploadModal }) {
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      {/* Brand & Page Header */}
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-2 cursor-pointer">
          <div className="w-8 h-8 bg-sky-600 rounded-md flex items-center justify-center text-white font-bold shadow-xs">
            <span className="text-lg tracking-tighter">AG</span>
          </div>
          <div>
            <span className="font-extrabold text-slate-800 text-lg tracking-tight">AutoGuide</span>
            <span className="ml-1 text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-sky-100 text-sky-700">
              Enterprise SaaS
            </span>
          </div>
        </div>

        <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>

        <h1 className="font-bold text-slate-800 text-lg hidden md:block">
          {title || "Query Diagnostics Database"}
        </h1>
      </div>

      {/* Right Action Tools */}
      <div className="flex items-center space-x-3">
        {/* Global Search Bar */}
        {onGlobalSearch && (
          <div className="relative hidden lg:block w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search VIN, Model, or TSB..."
              onKeyDown={(e) => {
                if (e.key === 'Enter') onGlobalSearch(e.target.value);
              }}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-700"
            />
          </div>
        )}

        {/* Index New Manual (RAG) Button */}
        {onOpenUploadModal && (
          <button
            onClick={onOpenUploadModal}
            className="px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 rounded-md text-xs font-extrabold flex items-center space-x-1.5 transition cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-sky-600" />
            <span className="hidden xl:inline">Index New Manual (RAG)</span>
          </button>
        )}

        {/* Live Sync Status Pill */}
        <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>V-Con Synced (Live)</span>
        </div>

        {/* Region Selector */}
        <div className="flex items-center space-x-1 px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded-md border border-slate-200">
          <Globe className="w-3.5 h-3.5 text-slate-500" />
          <select
            value={activeRegion}
            onChange={(e) => onRegionChange && onRegionChange(e.target.value)}
            className="bg-transparent font-semibold focus:outline-none cursor-pointer text-xs"
          >
            <option value="US-EAST">Region: US-EAST</option>
            <option value="EU-WEST">Region: EU-WEST</option>
            <option value="ASIA-PAC">Region: ASIA-PAC</option>
          </select>
        </div>

        {/* User Profile Menu */}
        <div className="relative pl-2 border-l border-slate-200">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center space-x-2 focus:outline-none cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs ring-2 ring-slate-100">
              {user?.name ? user.name.charAt(0) : "M"}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-bold text-slate-800 leading-tight">
                {user?.name || "Marcus K."}
              </p>
              <p className="text-[10px] text-slate-500 font-medium">
                {user?.role || "Lead Tech"}
              </p>
            </div>
          </button>

          {/* User Dropdown */}
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-40 animate-in fade-in zoom-in-95">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-800">{user?.name}</p>
                <p className="text-[10px] text-slate-400 font-mono">{user?.email}</p>
              </div>
              <button
                onClick={() => {
                  setShowUserMenu(false);
                  onSignOut && onSignOut();
                }}
                className="w-full text-left px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 flex items-center space-x-2 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out Account</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
