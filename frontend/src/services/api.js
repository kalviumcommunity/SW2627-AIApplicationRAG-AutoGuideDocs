const API_BASE = '/api';

export async function loginUser(email, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: 'Login failed' }));
    throw new Error(errorData.detail || 'Login failed');
  }
  return res.json();
}

export async function registerUser(name, email, password, role = 'Lead Tech', region = 'US-EAST') {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password, role, region }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: 'Registration failed' }));
    throw new Error(errorData.detail || 'Registration failed');
  }
  return res.json();
}

export async function getRecentVehicles() {
  const res = await fetch(`${API_BASE}/vehicles`);
  if (!res.ok) throw new Error('Failed to fetch vehicles');
  return res.json();
}

export async function addVehicle(vehicleData) {
  const res = await fetch(`${API_BASE}/vehicles/add`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(vehicleData),
  });
  if (!res.ok) throw new Error('Failed to add vehicle');
  return res.json();
}

export async function verifyVIN(vin) {
  const res = await fetch(`${API_BASE}/vehicles/verify-vin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ vin }),
  });
  if (!res.ok) throw new Error('VIN verification failed');
  return res.json();
}

export async function getManuals(params = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE}/manuals?${query}`);
  if (!res.ok) throw new Error('Failed to fetch manuals');
  return res.json();
}

export async function uploadDocument(docData) {
  const res = await fetch(`${API_BASE}/manuals/upload`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(docData),
  });
  if (!res.ok) throw new Error('Document indexing failed');
  return res.json();
}

export async function uploadPDFDocument(formData) {
  const res = await fetch(`${API_BASE}/manuals/upload-pdf`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error('PDF indexing failed');
  return res.json();
}

export async function getManualDetail(docId) {
  const res = await fetch(`${API_BASE}/manuals/${docId}`);
  if (!res.ok) throw new Error('Failed to fetch document detail');
  return res.json();
}

export async function checkVersionIntegrity(docId) {
  const res = await fetch(`${API_BASE}/manuals/${docId}/check-version`);
  if (!res.ok) throw new Error('Failed to check version integrity');
  return res.json();
}

export async function searchRAG(query, options = {}) {
  const params = new URLSearchParams({
    query,
    vehicle_model: options.vehicleModel || '2021 Ford F-150 Lariat 4WD',
    region: options.region || 'US-EAST',
    doc_type: options.docType || 'All',
    system: options.system || 'All',
    limit: options.limit || 5,
  });
  const res = await fetch(`${API_BASE}/rag/search?${params.toString()}`);
  if (!res.ok) throw new Error('RAG search failed');
  return res.json();
}

export async function getDiagnosticSession(sessionId = 'DIAG-F150-2021-001') {
  const res = await fetch(`${API_BASE}/diagnostics/session/${sessionId}`);
  if (!res.ok) throw new Error('Failed to fetch diagnostic session');
  return res.json();
}

export async function advanceDiagnosticStep(sessionId = 'DIAG-F150-2021-001') {
  const res = await fetch(`${API_BASE}/diagnostics/session/${sessionId}/advance`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ timestamp: new Date().toISOString() }),
  });
  if (!res.ok) throw new Error('Failed to advance step');
  return res.json();
}

export async function getRecalls(region = 'US-EAST') {
  const res = await fetch(`${API_BASE}/recalls?region=${region}`);
  if (!res.ok) throw new Error('Failed to fetch recalls');
  return res.json();
}
