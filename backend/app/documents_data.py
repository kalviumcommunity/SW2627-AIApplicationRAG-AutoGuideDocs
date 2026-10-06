import json
import uuid
from app.database import get_db_connection, hash_password

SEED_USERS = [
    {
        "id": "USR-ID901",
        "name": "Marcus K.",
        "email": "m.kovac@enterprise.autoguide.com",
        "password_hash": hash_password("password123"),
        "role": "Chief Tech / Lead Tech",
        "region": "US-EAST",
        "active_database": "NA_EAST_v2024.12.1"
    },
    {
        "id": "USR-ID902",
        "name": "Alex Rivera",
        "email": "alex.rivera@enterprise.autoguide.com",
        "password_hash": hash_password("password123"),
        "role": "Senior Diagnostics Specialist",
        "region": "US-EAST",
        "active_database": "NA_EAST_v2024.12.1"
    }
]

SEED_VEHICLES = [
    {
        "vin": "1FTFW1EG5MFXXXXXX",
        "manufacturer": "Ford (North America)",
        "model_family": "F-150 Pickup",
        "year": 2021,
        "engine_platform": "3.5L V6 EcoBoost (Gen 3)",
        "trim_variant": "Lariat SuperCrew 4WD",
        "market_region": "US / Canada Markets",
        "status": "Active Sync"
    },
    {
        "vin": "5YJYGDEE8PFXXXXXX",
        "manufacturer": "Tesla",
        "model_family": "Model Y",
        "year": 2023,
        "engine_platform": "Dual Motor EV",
        "trim_variant": "Long Range AWD",
        "market_region": "Global West",
        "status": "In Review"
    },
    {
        "vin": "JTDEPFAE7KJXXXXXX",
        "manufacturer": "Toyota",
        "model_family": "RAV4 Hybrid",
        "year": 2019,
        "engine_platform": "2.5L I4 Hybrid",
        "trim_variant": "XLE AWD",
        "market_region": "Japan / Asia Import",
        "status": "Archived"
    }
]

SEED_DOCUMENTS = [
    {
        "doc_id": "MAN-03-098",
        "doc_type": "TECHNICAL MANUAL",
        "title": "Cylinder Head Bolt Torque Specifications & Assembly Sequence",
        "applicability_manufacturer": "Ford (North America)",
        "applicability_model": "F-150 Pickup",
        "applicability_engine": "3.5L V6 EcoBoost",
        "region": "US-EAST",
        "version": "v4.2",
        "superseded_by": None,
        "status": "Approved",
        "last_updated": "Jan 12, 2024",
        "system_category": "Engine Mechanical (51-01)",
        "content_full": """# Cylinder Head Bolt Torque Specifications & Assembly Sequence
Document ID: MAN-03-098 | Version: v4.2 (Jan 2024) | Region: US-EAST | OEM Authority: Ford OEM v4.2

## 01. Specifications & Clearances
All cylinder head retention fasteners must be tightened in the exact numerical sequence outlined below. Reusing old head bolts is strictly prohibited due to critical torque-to-yield material deformation limits.

## 02. Fastener Assembly Sequences
WARNING: MANDATORY TORQUE-TO-YIELD AUDIT
Fasteners are one-time use only. Torque sequences outside of certified parameters will void regional drivetrain warranty scopes.
Follow 9-bolt revised routing pattern for 3.5L V6 EcoBoost Gen 3 blocks.

## 03. Torque Targets & Formulas
Multi-Stage Sequence Steps:
- Stage 1: Torque all cylinder head bolts in numerical sequence (1-9) to 40 Nm (30 lb-ft).
- Stage 2: Additional rotation sequence. Rotate all bolts in sequence a further 90 degrees.
- Stage 3: Final validation check. Confirm breakaway thresholds exceed 65 Nm (48 lb-ft).

## 04. Post-Assembly Verification
Conduct leak-down pressure test at 15 PSI for 20 minutes before installing valve cover assemblies."""
    },
    {
        "doc_id": "MAN-03-098-DEPRECATED",
        "doc_type": "TECHNICAL MANUAL",
        "title": "Cylinder Head Bolt Torque Specifications (Deprecated v4.1)",
        "applicability_manufacturer": "Ford (North America)",
        "applicability_model": "F-150 Pickup",
        "applicability_engine": "3.5L V6 EcoBoost",
        "region": "US-EAST",
        "version": "v4.1",
        "superseded_by": "MAN-03-098",
        "status": "Deprecated",
        "last_updated": "Dec 15, 2023",
        "system_category": "Engine Mechanical (51-01)",
        "content_full": """# Cylinder Head Bolt Torque Specifications (DEPRECATED REVISION)
Document ID: MAN-03-098-DEPRECATED | Version: v4.1 (Dec 2023) | Status: REPLACED

Previous Stage 1 Target Limit: 35 Nm (25 lb-ft) with 8-bolt routing sequence.
NOTICE: This revision was superseded by v4.2 in Jan 2024 due to potential head gasket seal degradation under sustained thermal load."""
    },
    {
        "doc_id": "TSB-22-0305",
        "doc_type": "SERVICE BULLETIN (TSB)",
        "title": "Engine Overheating Under Heavy Payload or Towing Conditions",
        "applicability_manufacturer": "Ford (North America)",
        "applicability_model": "F-150 Pickup",
        "applicability_engine": "3.5L V6 EcoBoost",
        "region": "US-EAST",
        "version": "v2.1",
        "superseded_by": None,
        "status": "Approved",
        "last_updated": "Oct 12, 2024",
        "system_category": "Engine Cooling (53-03)",
        "content_full": """# Service Bulletin TSB-22-0305: Engine Overheating Under Heavy Payload
Applies to select Gen 3 3.5L EcoBoost platforms. Thermal bypass valve replacement sequence and updated radiator fan control module software flashing procedures.

## Diagnostic Symptoms & Fault Codes
- Active Fault Code P0217 (Engine Over-Temperature Condition)
- Engine coolant temperature exceeding 230°F (110°C) during sustained 4000+ lbs towing.

## Action & Corrective Procedure
1. Inspect electronic thermostat bypass valve duty cycle on pin C102.
2. Verify ECT sensor resistance between 2.5k and 3.2k ohms at ambient temperature.
3. Replace thermal bypass valve assembly (Part # FL-9021-A) if resistance deviates > 10%.
4. Reprogram PCM fan control module using Ford FDRS software build v2024.10 or higher."""
    },
    {
        "doc_id": "MAN-03-095",
        "doc_type": "TECHNICAL MANUAL",
        "title": "Coolant Pump Disassembly, Inspection & Installation Sequence",
        "applicability_manufacturer": "Ford (North America)",
        "applicability_model": "F-150 Pickup",
        "applicability_engine": "3.5L V6 EcoBoost",
        "region": "US-EAST",
        "version": "v4.2",
        "superseded_by": None,
        "status": "Approved",
        "last_updated": "Jan 04, 2024",
        "system_category": "Engine Cooling (53-03)",
        "content_full": """# Coolant Pump Disassembly, Inspection & Installation Sequence
Standard OEM certified procedures for main coolant loop disassembly, gasket replacement, and precision torque sequences for housing retention bolts.

## Torque Specifications
- Pump Housing Bolts (M6): 10 Nm (89 lb-in) in star pattern.
- Pulley Attachment Bolts: 24 Nm (18 lb-ft).

## System Drain & Refill
Utilize vacuum refill tool kit to prevent air pockets in secondary heater core circuit. Refill only with Motorcraft Yellow Approved Coolant."""
    },
    {
        "doc_id": "MAN-03-034",
        "doc_type": "TECHNICAL MANUAL",
        "title": "Thermostat Bypass Valve Diagnostics & Active Duty Cycle Testing",
        "applicability_manufacturer": "Ford (North America)",
        "applicability_model": "F-150 Pickup",
        "applicability_engine": "3.5L V6 EcoBoost",
        "region": "US-EAST",
        "version": "v3.0",
        "superseded_by": None,
        "status": "Approved",
        "last_updated": "Feb 18, 2024",
        "system_category": "Engine Cooling (53-03)",
        "content_full": """# Thermostat Bypass Valve Diagnostics & Active Duty Cycle Testing
Live diagnostics criteria for verifying command duty cycles of the electronic thermostat using external OBD scanner interfaces. Includes resistance tables and PWM signal response graphs."""
    },
    {
        "doc_id": "MAN-10R80-FLUID",
        "doc_type": "TECHNICAL MANUAL",
        "title": "10R80 Automatic Transmission Fluid Drain & Refill Procedure",
        "applicability_manufacturer": "Ford (North America)",
        "applicability_model": "F-150 Pickup",
        "applicability_engine": "3.5L V6 EcoBoost",
        "region": "US-EAST",
        "version": "v3.1",
        "superseded_by": None,
        "status": "Approved",
        "last_updated": "Nov 20, 2023",
        "system_category": "Drivetrain & Transmission (21-04)",
        "content_full": """# 10R80 Automatic Transmission Fluid Drain & Refill Procedure
Approved procedure for checking ULV transmission fluid levels at operating temperature (206°F - 215°F). Check fluid dipstick indicator level 3-5 with vehicle level on lift."""
    },
    {
        "doc_id": "MAN-TIMING-CHAIN",
        "doc_type": "TECHNICAL MANUAL",
        "title": "Primary Timing Chain Routing and Camshaft Phasing Alignments",
        "applicability_manufacturer": "Ford (North America)",
        "applicability_model": "F-150 Pickup",
        "applicability_engine": "3.5L V6 EcoBoost",
        "region": "US-EAST",
        "version": "v2.0",
        "superseded_by": None,
        "status": "Approved",
        "last_updated": "Aug 14, 2023",
        "system_category": "Engine Timing (51-04)",
        "content_full": """# Primary Timing Chain Routing and Camshaft Phasing Alignments
Align colored link timing marks on primary chain with crankshaft sprocket and VCT intake/exhaust camshaft phasers at top dead center (TDC) Cylinder 1."""
    }
]

SEED_RECALLS = [
    {
        "recall_id": "REC-23V-012",
        "nhtsa_id": "NHTSA RECALL #23V-012",
        "title": "Safety Critical: Fuel Pump Impeller Failure",
        "manufacturer": "Ford (North America)",
        "models": "Ford F-150, Expedition, Lincoln Navigator (2020-2022)",
        "region": "US-EAST Only",
        "severity": "URGENT SAFETY HAZARD",
        "description": "Fuel pump low pressure module impeller may deform causing engine stall while driving. Dealer must replace fuel pump assembly free of charge.",
        "status": "1 Active",
        "publication_date": "Jan 18, 2024"
    },
    {
        "recall_id": "REC-24V-088",
        "nhtsa_id": "NHTSA HAZARD FM-24012",
        "title": "Brake Master Cylinder Fluid Leak",
        "manufacturer": "Ford (North America)",
        "models": "2021 Ford F-150 Lariat 4WD",
        "region": "US / CA (Region Restricted)",
        "severity": "CRITICAL HAZARD",
        "description": "Loss of braking assist due to seal leakage. Ensure field pressure verification routing FM-24012 is followed strictly before releasing vehicle.",
        "status": "Active Hazard",
        "publication_date": "Feb 02, 2024"
    },
    {
        "recall_id": "TSB-ADAS-2024",
        "nhtsa_id": "SERVICE UPDATE (TSB)",
        "title": "ADAS Sensor Recalibration Required",
        "manufacturer": "Global",
        "models": "All ADAS equipped 2021-2024 models",
        "region": "Global v2",
        "severity": "SERVICE ADVISORY",
        "description": "Required software patching routine post windshield replacement or front bumper removal to maintain lane keep alignment.",
        "status": "Mandatory Calibration",
        "publication_date": "Mar 10, 2024"
    }
]

SEED_DIAGNOSTIC_SESSIONS = [
    {
        "session_id": "DIAG-F150-2021-001",
        "vin": "1FTFW1EG5MFXXXXXX",
        "technician_name": "Marcus K. (ID901) Lead Tech",
        "active_step": 3,
        "total_steps": 5,
        "status": "3/5 Steps Active",
        "steps_json": json.dumps([
            {
                "step_num": 1,
                "title": "Connect CAN Diagnostic Bus",
                "detail": "Established secure OBD session. VIN 1FTFW1EG5MFXXXXXX validated.",
                "completed": True
            },
            {
                "step_num": 2,
                "title": "Query Active Thermal Fault Codes",
                "detail": "Detected active P0217 (Engine Over Temperature) & P1085.",
                "completed": True
            },
            {
                "step_num": 3,
                "title": "ECT Sensor Resistance Check",
                "detail": "Probe ECT Connector C102. Standard target resistance: 2.5k to 3.2k ohms.",
                "completed": False
            },
            {
                "step_num": 4,
                "title": "Coolant Flow & Thermostat Bypass test",
                "detail": "Command active duty cycle to bypass valve and observe data.",
                "completed": False
            },
            {
                "step_num": 5,
                "title": "Generate Certified Resolution Log",
                "detail": "Lock document revision code to work order history.",
                "completed": False
            }
        ]),
        "checklist_json": json.dumps([
            {"label": "CAN Bus connection stable", "status": "pass"},
            {"label": "Database emissions checked", "status": "pass"},
            {"label": "TSB revision 4.2 pending review", "status": "warning"}
        ]),
        "safety_warnings_json": json.dumps([
            "CRITICAL SAFETY STANDARD: SYSTEM UNDER EXTREME THERMAL PRESSURE. Do not remove coolant reservoir cap while engine is hot. Risk of severe burns."
        ]),
        "required_tools_json": json.dumps([
            "Digital Multimeter (DMM)",
            "OBD-II CAN Diagnostic Interface Link"
        ])
    }
]

def seed_database():
    conn = get_db_connection()
    cursor = conn.cursor()

    # Seed users
    for u in SEED_USERS:
        cursor.execute("""
        INSERT OR IGNORE INTO users (id, name, email, password_hash, role, region, active_database)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (u["id"], u["name"], u["email"], u["password_hash"], u["role"], u["region"], u["active_database"]))

    # Seed vehicles
    for v in SEED_VEHICLES:
        cursor.execute("""
        INSERT OR REPLACE INTO vehicles (vin, manufacturer, model_family, year, engine_platform, trim_variant, market_region, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (v["vin"], v["manufacturer"], v["model_family"], v["year"], v["engine_platform"], v["trim_variant"], v["market_region"], v["status"]))

    # Seed documents
    for d in SEED_DOCUMENTS:
        cursor.execute("""
        INSERT OR REPLACE INTO documents (doc_id, doc_type, title, applicability_manufacturer, applicability_model, applicability_engine, region, version, superseded_by, status, last_updated, content_full, system_category)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (d["doc_id"], d["doc_type"], d["title"], d["applicability_manufacturer"], d["applicability_model"], d["applicability_engine"], d["region"], d["version"], d["superseded_by"], d["status"], d["last_updated"], d["content_full"], d["system_category"]))

        lines = d["content_full"].split("\n\n")
        for idx, chunk in enumerate(lines):
            if chunk.strip():
                sec_title = chunk.split("\n")[0].replace("#", "").strip()
                chunk_id = f"{d['doc_id']}-chunk-{idx}"
                metadata = {
                    "doc_id": d["doc_id"],
                    "title": d["title"],
                    "doc_type": d["doc_type"],
                    "version": d["version"],
                    "status": d["status"],
                    "region": d["region"],
                    "applicability": f"{d['applicability_manufacturer']} {d['applicability_model']} ({d['applicability_engine']})",
                    "superseded_by": d["superseded_by"]
                }
                cursor.execute("""
                INSERT OR REPLACE INTO document_chunks (chunk_id, doc_id, chunk_index, section_title, content, metadata_json)
                VALUES (?, ?, ?, ?, ?, ?)
                """, (chunk_id, d["doc_id"], idx, sec_title, chunk, json.dumps(metadata)))

    # Seed Recalls
    for r in SEED_RECALLS:
        cursor.execute("""
        INSERT OR REPLACE INTO recalls (recall_id, nhtsa_id, title, manufacturer, models, region, severity, description, status, publication_date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (r["recall_id"], r["nhtsa_id"], r["title"], r["manufacturer"], r["models"], r["region"], r["severity"], r["description"], r["status"], r["publication_date"]))

    # Seed Diagnostic Sessions
    for s in SEED_DIAGNOSTIC_SESSIONS:
        cursor.execute("""
        INSERT OR REPLACE INTO diagnostic_sessions (session_id, vin, technician_name, active_step, total_steps, steps_json, status, checklist_json, safety_warnings_json, required_tools_json)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (s["session_id"], s["vin"], s["technician_name"], s["active_step"], s["total_steps"], s["steps_json"], s["status"], s["checklist_json"], s["safety_warnings_json"], s["required_tools_json"]))

    conn.commit()
    conn.close()
