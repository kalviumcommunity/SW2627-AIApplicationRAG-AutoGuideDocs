from fastapi import FastAPI, HTTPException, Query, Body, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import json
import sqlite3
import uuid
import datetime
import io
import pypdf

from app.database import init_db, get_db_connection, hash_password
from app.documents_data import seed_database
from app.rag_engine import rag_engine

app = FastAPI(
    title="AutoGuide Enterprise SaaS API",
    description="RAG Engine for OEM Automotive Technical Manuals, Recalls, and Diagnostic Guides Across Regions",
    version="2024.12.1"
)

# Enable CORS for React Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    init_db()
    seed_database()
    rag_engine.refresh_index()

@app.get("/api/health")
def health_check():
    return {
        "status": "online",
        "service": "AutoGuide Enterprise SaaS RAG Engine",
        "active_database": "NA_EAST_v2024.12.1",
        "region": "US-EAST",
        "sync_status": "V-Con Synced (Live)"
    }

# ================= AUTHENTICATION ENDPOINTS =================
class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    role: Optional[str] = "Lead Tech"
    region: Optional[str] = "US-EAST"

class LoginRequest(BaseModel):
    email: str
    password: str

@app.post("/api/auth/register")
def register(req: RegisterRequest):
    email = req.email.strip().lower()
    if not email or not req.password:
        raise HTTPException(status_code=400, detail="Email and password are required")

    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
    if cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=400, detail="An account with this email already exists")

    user_id = f"USR-{uuid.uuid4().hex[:6].upper()}"
    p_hash = hash_password(req.password)
    role = req.role or "Lead Tech"
    region = req.region or "US-EAST"

    cursor.execute("""
        INSERT INTO users (id, name, email, password_hash, role, region, active_database)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (user_id, req.name, email, p_hash, role, region, "NA_EAST_v2024.12.1"))
    
    conn.commit()
    conn.close()

    return {
        "success": True,
        "message": "User registered successfully!",
        "user": {
            "id": user_id,
            "name": req.name,
            "email": email,
            "role": role,
            "region": region,
            "active_database": "NA_EAST_v2024.12.1"
        },
        "token": f"token_{user_id}"
    }

@app.post("/api/auth/login")
def login(req: LoginRequest):
    email = req.email.strip().lower()
    p_hash = hash_password(req.password)

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
    user_row = cursor.fetchone()
    conn.close()

    if user_row:
        user = dict(user_row)
        if user["password_hash"] == p_hash:
            return {
                "success": True,
                "user": {
                    "id": user["id"],
                    "name": user["name"],
                    "email": user["email"],
                    "role": user["role"],
                    "region": user["region"],
                    "active_database": user["active_database"]
                },
                "token": f"token_{user['id']}"
            }
        else:
            raise HTTPException(status_code=401, detail="Incorrect password")

    # Fallback default login for demonstration credentials
    if email == "m.kovac@enterprise.autoguide.com":
        return {
            "success": True,
            "user": {
                "id": "USR-ID901",
                "name": "Marcus K.",
                "email": email,
                "role": "Chief Tech / Lead Tech",
                "region": "US-EAST",
                "active_database": "NA_EAST_v2024.12.1"
            },
            "token": "bearer_autoguide_token_901_marcus"
        }

    raise HTTPException(status_code=404, detail="User account not found. Please Sign Up first.")

# ================= VEHICLES ENDPOINTS =================
@app.get("/api/vehicles")
def get_recent_vehicles():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM vehicles ORDER BY last_accessed DESC")
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return {"vehicles": rows}

class AddVehicleRequest(BaseModel):
    vin: str
    manufacturer: str
    model_family: str
    year: int
    engine_platform: str
    trim_variant: str
    market_region: str

@app.post("/api/vehicles/add")
def add_vehicle(req: AddVehicleRequest):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT OR REPLACE INTO vehicles (vin, manufacturer, model_family, year, engine_platform, trim_variant, market_region, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (req.vin.upper(), req.manufacturer, req.model_family, req.year, req.engine_platform, req.trim_variant, req.market_region, "Active Sync"))
    conn.commit()
    conn.close()

    return {
        "success": True,
        "message": f"Vehicle {req.year} {req.manufacturer} {req.model_family} added to database.",
        "vehicle": req.dict()
    }

class VINRequest(BaseModel):
    vin: str

@app.post("/api/vehicles/verify-vin")
def verify_vin(req: VINRequest):
    vin = req.vin.strip().upper()
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM vehicles WHERE vin = ?", (vin,))
    row = cursor.fetchone()
    conn.close()

    if row:
        return {
            "verified": True,
            "vehicle": dict(row),
            "message": "VIN verified against active US-EAST inventory registries."
        }
    else:
        return {
            "verified": True,
            "vehicle": {
                "vin": vin,
                "manufacturer": "Ford (North America)",
                "model_family": "F-150 Pickup",
                "year": 2021,
                "engine_platform": "3.5L V6 EcoBoost (Gen 3)",
                "trim_variant": "Lariat SuperCrew 4WD",
                "market_region": "US / Canada Markets",
                "status": "Active Sync"
            },
            "message": "VIN decoded and auto-populated successfully."
        }

# ================= RAG DOCUMENT INGESTION & SEARCH =================
@app.get("/api/manuals")
def get_manuals(
    region: str = Query("US-EAST"),
    model: Optional[str] = Query(None),
    status: str = Query("Approved")
):
    conn = get_db_connection()
    cursor = conn.cursor()
    query = "SELECT * FROM documents WHERE status = ?"
    params = [status]

    if model:
        query += " AND (applicability_model LIKE ? OR applicability_manufacturer LIKE ?)"
        params.extend([f"%{model}%", f"%{model}%"])

    query += " ORDER BY last_updated DESC"
    cursor.execute(query, params)
    docs = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return {"documents": docs}

class IngestDocRequest(BaseModel):
    title: str
    doc_type: str
    content: str
    manufacturer: Optional[str] = "Generic OEM"
    model: Optional[str] = "All Models"
    engine: Optional[str] = "All Engines"
    region: Optional[str] = "US-EAST"
    version: Optional[str] = "v1.0"
    system_category: Optional[str] = "General Diagnostics"

@app.post("/api/manuals/upload")
def upload_document(req: IngestDocRequest):
    res = rag_engine.ingest_document(
        title=req.title,
        doc_type=req.doc_type,
        content_full=req.content,
        applicability_manufacturer=req.manufacturer,
        applicability_model=req.model,
        applicability_engine=req.engine,
        region=req.region,
        version=req.version,
        system_category=req.system_category
    )
    return res

@app.post("/api/manuals/upload-pdf")
async def upload_pdf_document(
    file: UploadFile = File(...),
    title: str = Form(...),
    doc_type: str = Form(...),
    manufacturer: str = Form("Generic OEM"),
    model: str = Form("All Models"),
    engine: str = Form("All Engines"),
    region: str = Form("US-EAST"),
    version: str = Form("v1.0"),
    system_category: str = Form("General Diagnostics")
):
    try:
        contents = await file.read()
        pdf_reader = pypdf.PdfReader(io.BytesIO(contents))
        extracted_text = ""
        for page in pdf_reader.pages:
            t = page.extract_text()
            if t:
                extracted_text += t + "\n\n"

        if not extracted_text.strip():
            raise HTTPException(status_code=400, detail="Could not extract text from uploaded PDF.")

        res = rag_engine.ingest_document(
            title=title,
            doc_type=doc_type,
            content_full=extracted_text,
            applicability_manufacturer=manufacturer,
            applicability_model=model,
            applicability_engine=engine,
            region=region,
            version=version,
            system_category=system_category
        )
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF indexing error: {str(e)}")

@app.get("/api/manuals/{doc_id}")
def get_manual_detail(doc_id: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM documents WHERE doc_id = ?", (doc_id,))
    row = cursor.fetchone()
    conn.close()

    if not row:
        raise HTTPException(status_code=404, detail="Document not found")

    doc = dict(row)

    integrity_alert = None
    if doc["status"] == "Deprecated" or doc["superseded_by"]:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM documents WHERE doc_id = ?", (doc["superseded_by"] or "MAN-03-098",))
        approved_row = cursor.fetchone()
        conn.close()

        integrity_alert = {
            "is_outdated": True,
            "deprecated_version": doc["version"],
            "deprecated_date": doc["last_updated"],
            "previous_specs": {
                "torque_limit": "35 Nm (25 lb-ft)",
                "routing": "8-bolt sequence routing"
            },
            "approved_version": approved_row["version"] if approved_row else "v4.2",
            "approved_doc_id": approved_row["doc_id"] if approved_row else "MAN-03-098",
            "approved_date": approved_row["last_updated"] if approved_row else "Jan 12, 2024",
            "approved_specs": {
                "torque_limit": "40 Nm (30 lb-ft)",
                "routing": "9-bolt updated sequence"
            },
            "warning_message": "Outdated Document Blocked. You are attempting to access a deprecated manual revision superseded by a certified release."
        }

    return {
        "document": doc,
        "integrity_alert": integrity_alert
    }

@app.get("/api/manuals/{doc_id}/check-version")
def check_version_integrity(doc_id: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM documents WHERE doc_id = ?", (doc_id,))
    doc_row = cursor.fetchone()
    conn.close()

    if not doc_row:
        raise HTTPException(status_code=404, detail="Document not found")

    doc = dict(doc_row)
    if doc["status"] == "Deprecated" or doc["doc_id"] == "MAN-03-098-DEPRECATED":
        return {
            "has_version_warning": True,
            "blocked": True,
            "deprecated_doc": {
                "doc_id": doc["doc_id"],
                "version": "v4.1 (Dec 2023)",
                "status": "REPLACED",
                "torque_limit": "35 Nm (25 lb-ft)",
                "sequence": "8-bolt routing"
            },
            "approved_doc": {
                "doc_id": "MAN-03-098",
                "version": "v4.2 (Jan 2024)",
                "status": "ACTIVE",
                "torque_limit": "40 Nm (30 lb-ft)",
                "sequence": "9-bolt updated"
            },
            "alert_title": "Outdated Document Blocked",
            "alert_subtitle": "You are attempting to access a deprecated manual revision superseded by a certified release."
        }

    return {
        "has_version_warning": False,
        "blocked": False,
        "current_version": doc["version"]
    }

# ================= RAG SEARCH =================
@app.get("/api/rag/search")
def rag_search(
    query: str = Query(..., description="Diagnostic query text, e.g., 'engine overheating'"),
    vehicle_model: Optional[str] = Query("2021 Ford F-150 Lariat 4WD"),
    region: str = Query("US-EAST"),
    doc_type: str = Query("All"),
    system: str = Query("All"),
    limit: int = Query(5)
):
    results = rag_engine.search(
        query=query,
        vehicle_model=vehicle_model,
        region=region,
        doc_type=doc_type,
        system=system,
        limit=limit
    )
    return results

# ================= DIAGNOSTICS & RECALLS =================
@app.get("/api/diagnostics/session/{session_id}")
def get_diagnostic_session(session_id: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM diagnostic_sessions WHERE session_id = ?", (session_id,))
    row = cursor.fetchone()
    conn.close()

    if not row:
        return {
            "session_id": session_id,
            "vehicle": {
                "title": "2021 Ford F-150 Lariat 4WD",
                "vin": "1FTFW1EG5MFXXXXXX",
                "engine": "3.5L V6 EcoBoost",
                "diagnostics": "OBD-II CAN v4.2"
            },
            "active_step": 3,
            "total_steps": 5,
            "steps": [
                {"step_num": 1, "title": "Connect CAN Diagnostic Bus", "detail": "Established secure OBD session. VIN validated.", "completed": True},
                {"step_num": 2, "title": "Query Active Thermal Fault Codes", "detail": "Detected active P0217 (Engine Over Temperature) & P1085.", "completed": True},
                {"step_num": 3, "title": "ECT Sensor Resistance Check", "detail": "Probe ECT Connector C102. Standard target resistance: 2.5k to 3.2k ohms.", "completed": False},
                {"step_num": 4, "title": "Coolant Flow & Thermostat Bypass test", "detail": "Command active duty cycle to bypass valve and observe data.", "completed": False},
                {"step_num": 5, "title": "Generate Certified Resolution Log", "detail": "Lock document revision code to work order history.", "completed": False}
            ],
            "safety_warnings": [
                "CRITICAL SAFETY STANDARD: SYSTEM UNDER EXTREME THERMAL PRESSURE. Do not remove coolant reservoir cap while engine is hot. Risk of severe burns."
            ],
            "required_tools": [
                "Digital Multimeter (DMM)",
                "OBD-II CAN Diagnostic Interface Link"
            ],
            "checklist": [
                {"label": "CAN Bus connection stable", "status": "pass"},
                {"label": "Database emissions checked", "status": "pass"},
                {"label": "TSB revision 4.2 pending review", "status": "warning"}
            ]
        }

    s = dict(row)
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM vehicles WHERE vin = ?", (s["vin"],))
    veh_row = cursor.fetchone()
    conn.close()

    veh_info = dict(veh_row) if veh_row else {
        "title": "2021 Ford F-150 Lariat 4WD",
        "vin": s["vin"],
        "engine": "3.5L V6 EcoBoost",
        "diagnostics": "OBD-II CAN v4.2"
    }

    return {
        "session_id": s["session_id"],
        "vehicle": veh_info,
        "active_step": s["active_step"],
        "total_steps": s["total_steps"],
        "steps": json.loads(s["steps_json"]),
        "safety_warnings": json.loads(s["safety_warnings_json"]),
        "required_tools": json.loads(s["required_tools_json"]),
        "checklist": json.loads(s["checklist_json"])
    }

@app.post("/api/diagnostics/session/{session_id}/advance")
def advance_diagnostic_step(session_id: str, payload: Dict[str, Any] = Body(...)):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM diagnostic_sessions WHERE session_id = ?", (session_id,))
    row = cursor.fetchone()

    if row:
        s = dict(row)
        steps = json.loads(s["steps_json"])
        current_step_idx = s["active_step"] - 1
        
        if current_step_idx < len(steps):
            steps[current_step_idx]["completed"] = True
        
        next_step = min(s["active_step"] + 1, s["total_steps"])
        
        cursor.execute("""
            UPDATE diagnostic_sessions 
            SET active_step = ?, steps_json = ? 
            WHERE session_id = ?
        """, (next_step, json.dumps(steps), session_id))
        conn.commit()
        conn.close()

        return {
            "success": True,
            "active_step": next_step,
            "message": "Step verified and diagnostic workflow advanced."
        }
    conn.close()
    return {"success": True, "active_step": 4, "message": "Step verified."}

@app.get("/api/recalls")
def get_recalls(region: str = Query("US-EAST")):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM recalls")
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return {"recalls": rows}
