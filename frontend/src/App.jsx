import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import VersionWarningModal from './components/VersionWarningModal';
import UploadDocumentModal from './components/UploadDocumentModal';

import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import VehicleSearchPage from './pages/VehicleSearchPage';
import VehicleOverviewPage from './pages/VehicleOverviewPage';
import SearchResultsPage from './pages/SearchResultsPage';
import DiagnosticGuidePage from './pages/DiagnosticGuidePage';
import DocumentViewerPage from './pages/DocumentViewerPage';
import RecallRegistryPage from './pages/RecallRegistryPage';

export default function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('autoguide_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return null;
  });

  const [token, setToken] = useState(() => localStorage.getItem('autoguide_token') || '');

  // Issue 1 Fix: Default to dashboard on load
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [activeRegion, setActiveRegion] = useState('US-EAST');
  const [selectedVehicle, setSelectedVehicle] = useState({
    vin: "1FTFW1EG5MFXXXXXX",
    manufacturer: "Ford (North America)",
    model_family: "F-150 Pickup",
    year: 2021,
    engine_platform: "3.5L V6 EcoBoost (Gen 3)",
    trim_variant: "Lariat SuperCrew 4WD",
    market_region: "US / Canada Markets",
    status: "Active Sync"
  });

  const [searchQuery, setSearchQuery] = useState('engine overheating');
  const [selectedDocId, setSelectedDocId] = useState('MAN-03-098');
  const [versionWarningAlert, setVersionWarningAlert] = useState(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Issue 1 Fix: Navigate to dashboard after login or signup
  const handleLoginSuccess = (userData, userToken) => {
    setUser(userData);
    setToken(userToken || 'demo_token');
    localStorage.setItem('autoguide_user', JSON.stringify(userData));
    localStorage.setItem('autoguide_token', userToken || 'demo_token');
    setCurrentPage('dashboard');
  };

  const handleSignOut = () => {
    setUser(null);
    setToken('');
    localStorage.removeItem('autoguide_user');
    localStorage.removeItem('autoguide_token');
  };

  const handleGlobalSearch = (query) => {
    setSearchQuery(query);
    setCurrentPage('search-results');
  };

  const triggerVersionWarningModal = () => {
    setVersionWarningAlert({
      title: "Outdated Document Blocked",
      subtitle: "You are attempting to access a deprecated manual revision superseded by a certified release.",
      previous_version: "v4.1 (Dec 2023)",
      approved_version: "v4.2 (Jan 2024)"
    });
  };

  if (!user) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  const getPageTitle = () => {
    switch (currentPage) {
      case 'dashboard': return 'Dashboard overview';
      case 'vehicle-search': return 'Query Diagnostics Database';
      case 'vehicle-overview': return 'Technical Documentation Portal';
      case 'search-results': return 'Query Diagnostics Database';
      case 'diagnostics':
      case 'diagnostic-guide': return 'Interactive Diagnostic Workflow';
      case 'document-viewer': return 'OEM Certified Document Viewer';
      case 'recall-registry': return 'NHTSA & OEM Recall Registry';
      case 'technical-manuals': return 'Technical Documentation Portal';
      case 'service-bulletins': return 'Query Diagnostics Database';
      default: return 'Query Diagnostics Database';
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/60 flex flex-col font-sans text-slate-800 antialiased selection:bg-sky-500 selection:text-white">
      {/* Top Navbar Header */}
      <Navbar
        title={getPageTitle()}
        activeRegion={activeRegion}
        onRegionChange={(reg) => setActiveRegion(reg)}
        onGlobalSearch={handleGlobalSearch}
        user={user}
        onSignOut={handleSignOut}
        onOpenUploadModal={() => setIsUploadModalOpen(true)}
      />

      {/* Main Container Layout with Left Sidebar */}
      <div className="flex flex-1">
        <Sidebar
          currentPage={currentPage}
          setCurrentPage={(p) => {
            if (p === 'technical-manuals') {
              setCurrentPage('vehicle-overview');
            } else if (p === 'service-bulletins') {
              setSearchQuery('service bulletin');
              setCurrentPage('search-results');
            } else {
              setCurrentPage(p);
            }
          }}
          activeDatabase="NA_EAST_v2024.12.1"
        />

        {/* Page Content Body */}
        <main className="flex-1 min-w-0 overflow-y-auto">
          {currentPage === 'dashboard' && (
            <DashboardPage
              setCurrentPage={setCurrentPage}
              setSelectedVehicle={setSelectedVehicle}
              user={user}
            />
          )}

          {currentPage === 'vehicle-search' && (
            <VehicleSearchPage
              setCurrentPage={setCurrentPage}
              setSelectedVehicle={setSelectedVehicle}
              setSearchQuery={setSearchQuery}
            />
          )}

          {currentPage === 'vehicle-overview' && (
            <VehicleOverviewPage
              vehicle={selectedVehicle}
              setCurrentPage={setCurrentPage}
              setSelectedDocId={setSelectedDocId}
            />
          )}

          {currentPage === 'search-results' && (
            <SearchResultsPage
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              setCurrentPage={setCurrentPage}
              setSelectedDocId={setSelectedDocId}
              activeRegion={activeRegion}
            />
          )}

          {/* Issue 2 Fix: Support both 'diagnostics' and 'diagnostic-guide' */}
          {(currentPage === 'diagnostic-guide' || currentPage === 'diagnostics') && (
            <DiagnosticGuidePage
              setCurrentPage={setCurrentPage}
            />
          )}

          {currentPage === 'document-viewer' && (
            <DocumentViewerPage
              docId={selectedDocId}
              triggerVersionWarning={triggerVersionWarningModal}
            />
          )}

          {currentPage === 'recall-registry' && (
            <RecallRegistryPage
              activeRegion={activeRegion}
            />
          )}
        </main>
      </div>

      {/* Screenshot 3 System Integrity Alert Version Warning Modal */}
      <VersionWarningModal
        alertData={versionWarningAlert}
        onClose={() => setVersionWarningAlert(null)}
        onViewPrevious={() => {
          setSelectedDocId('MAN-03-098-DEPRECATED');
          setVersionWarningAlert(null);
          setCurrentPage('document-viewer');
        }}
        onOpenCurrent={() => {
          setSelectedDocId('MAN-03-098');
          setVersionWarningAlert(null);
          setCurrentPage('document-viewer');
        }}
      />

      {/* RAG Document Upload / Indexing Modal */}
      <UploadDocumentModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadSuccess={(docRes) => {
          if (docRes?.doc_id) {
            setSelectedDocId(docRes.doc_id);
            setCurrentPage('document-viewer');
          }
        }}
      />
    </div>
  );
}
