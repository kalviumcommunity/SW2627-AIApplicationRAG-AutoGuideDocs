import React, { useState } from 'react';
import { Upload, X, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { uploadDocument, uploadPDFDocument } from '../services/api';

export default function UploadDocumentModal({ isOpen, onClose, onUploadSuccess }) {
  const [uploadType, setUploadType] = useState('text'); // 'text' or 'pdf'
  const [title, setTitle] = useState('');
  const [docType, setDocType] = useState('TECHNICAL MANUAL');
  const [manufacturer, setManufacturer] = useState('Ford (North America)');
  const [model, setModel] = useState('F-150 Pickup');
  const [engine, setEngine] = useState('3.5L V6 EcoBoost');
  const [region, setRegion] = useState('US-EAST');
  const [version, setVersion] = useState('v1.0');
  const [systemCategory, setSystemCategory] = useState('Engine Mechanical (51-01)');
  const [textContent, setTextContent] = useState('');
  const [pdfFile, setPdfFile] = useState(null);

  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatusMsg(null);

    try {
      if (uploadType === 'pdf') {
        if (!pdfFile) throw new Error('Please select a PDF file');
        const formData = new FormData();
        formData.append('file', pdfFile);
        formData.append('title', title);
        formData.append('doc_type', docType);
        formData.append('manufacturer', manufacturer);
        formData.append('model', model);
        formData.append('engine', engine);
        formData.append('region', region);
        formData.append('version', version);
        formData.append('system_category', systemCategory);

        const res = await uploadPDFDocument(formData);
        setStatusMsg({ type: 'success', text: `PDF Indexed into RAG Engine! Created ${res.chunks_count} vector chunks.` });
        setTimeout(() => {
          onUploadSuccess && onUploadSuccess(res);
          onClose();
        }, 1500);
      } else {
        if (!textContent.strip && !textContent) throw new Error('Document content cannot be empty');
        const res = await uploadDocument({
          title,
          doc_type: docType,
          content: textContent,
          manufacturer,
          model,
          engine,
          region,
          version,
          system_category: systemCategory
        });
        setStatusMsg({ type: 'success', text: `Document Indexed into RAG Engine! Created ${res.chunks_count} vector chunks.` });
        setTimeout(() => {
          onUploadSuccess && onUploadSuccess(res);
          onClose();
        }, 1500);
      }
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message || 'Failed to index document' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Upload className="w-5 h-5 text-sky-400" />
            <h2 className="font-extrabold text-base tracking-tight">
              Index OEM Document into RAG Vector Store
            </h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs font-semibold">
          {statusMsg && (
            <div className={`p-3 rounded-lg flex items-center space-x-2 ${
              statusMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {statusMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-red-600" />}
              <span>{statusMsg.text}</span>
            </div>
          )}

          {/* Type Toggle */}
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => setUploadType('text')}
              className={`flex-1 py-1.5 rounded-md font-extrabold transition ${
                uploadType === 'text' ? 'bg-white text-sky-700 shadow-2xs' : 'text-slate-500'
              }`}
            >
              Manual Text Ingestion
            </button>
            <button
              type="button"
              onClick={() => setUploadType('pdf')}
              className={`flex-1 py-1.5 rounded-md font-extrabold transition ${
                uploadType === 'pdf' ? 'bg-white text-sky-700 shadow-2xs' : 'text-slate-500'
              }`}
            >
              Upload OEM PDF File
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-slate-500 font-bold uppercase tracking-wider text-[10px] mb-1">
                Document Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. 10R80 Transmission Valve Body Inspection Procedure"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-sky-500"
                required
              />
            </div>

            <div>
              <label className="block text-slate-500 font-bold uppercase tracking-wider text-[10px] mb-1">
                Document Type
              </label>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-sky-500"
              >
                <option value="TECHNICAL MANUAL">TECHNICAL MANUAL</option>
                <option value="SERVICE BULLETIN (TSB)">SERVICE BULLETIN (TSB)</option>
                <option value="RECALL NOTICE">RECALL NOTICE</option>
                <option value="DIAGNOSTIC GUIDE">DIAGNOSTIC GUIDE</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-500 font-bold uppercase tracking-wider text-[10px] mb-1">
                Version Tag
              </label>
              <input
                type="text"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                placeholder="e.g. v1.0"
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-slate-500 font-bold uppercase tracking-wider text-[10px] mb-1">
                Manufacturer
              </label>
              <input
                type="text"
                value={manufacturer}
                onChange={(e) => setManufacturer(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-slate-500 font-bold uppercase tracking-wider text-[10px] mb-1">
                Target Model
              </label>
              <input
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          {uploadType === 'pdf' ? (
            <div>
              <label className="block text-slate-500 font-bold uppercase tracking-wider text-[10px] mb-1">
                Select OEM PDF File
              </label>
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => setPdfFile(e.target.files[0])}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-bold file:bg-sky-600 file:text-white cursor-pointer"
                required
              />
            </div>
          ) : (
            <div>
              <label className="block text-slate-500 font-bold uppercase tracking-wider text-[10px] mb-1">
                Full Document Text Content (Markdown / Text)
              </label>
              <textarea
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                rows={6}
                placeholder="Paste OEM repair specifications, torque values, or diagnostic steps..."
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-sky-500 font-mono text-xs"
                required
              />
            </div>
          )}

          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-lg shadow-xs transition cursor-pointer"
            >
              {loading ? 'Chunking & Indexing RAG Vector...' : 'Ingest Document into RAG'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
