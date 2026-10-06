import sqlite3
import json
import os
import hashlib
import uuid
from typing import Dict, Any, List, Optional

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "autoguide.db")

def hash_password(password: str) -> str:
    salt = "autoguide_enterprise_salt_2026"
    return hashlib.sha256((salt + password).encode("utf-8")).hexdigest()

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()

    # Users Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'Technician',
        region TEXT NOT NULL DEFAULT 'US-EAST',
        active_database TEXT NOT NULL DEFAULT 'NA_EAST_v2024.12.1',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # Vehicles Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS vehicles (
        vin TEXT PRIMARY KEY,
        manufacturer TEXT NOT NULL,
        model_family TEXT NOT NULL,
        year INTEGER NOT NULL,
        engine_platform TEXT NOT NULL,
        trim_variant TEXT NOT NULL,
        market_region TEXT NOT NULL,
        status TEXT NOT NULL,
        last_accessed TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # Documents Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS documents (
        doc_id TEXT PRIMARY KEY,
        doc_type TEXT NOT NULL,
        title TEXT NOT NULL,
        applicability_manufacturer TEXT,
        applicability_model TEXT,
        applicability_engine TEXT,
        region TEXT NOT NULL,
        version TEXT NOT NULL,
        superseded_by TEXT,
        status TEXT NOT NULL,
        last_updated TEXT NOT NULL,
        content_full TEXT NOT NULL,
        system_category TEXT NOT NULL
    )
    """)

    # Document Chunks Table for RAG Vector Indexing
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS document_chunks (
        chunk_id TEXT PRIMARY KEY,
        doc_id TEXT NOT NULL,
        chunk_index INTEGER NOT NULL,
        section_title TEXT NOT NULL,
        content TEXT NOT NULL,
        metadata_json TEXT NOT NULL,
        FOREIGN KEY (doc_id) REFERENCES documents (doc_id) ON DELETE CASCADE
    )
    """)

    # Recalls Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS recalls (
        recall_id TEXT PRIMARY KEY,
        nhtsa_id TEXT NOT NULL,
        title TEXT NOT NULL,
        manufacturer TEXT NOT NULL,
        models TEXT NOT NULL,
        region TEXT NOT NULL,
        severity TEXT NOT NULL,
        description TEXT NOT NULL,
        status TEXT NOT NULL,
        publication_date TEXT NOT NULL
    )
    """)

    # Diagnostic Sessions Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS diagnostic_sessions (
        session_id TEXT PRIMARY KEY,
        vin TEXT NOT NULL,
        technician_name TEXT NOT NULL,
        active_step INTEGER NOT NULL,
        total_steps INTEGER NOT NULL,
        steps_json TEXT NOT NULL,
        status TEXT NOT NULL,
        checklist_json TEXT NOT NULL,
        safety_warnings_json TEXT NOT NULL,
        required_tools_json TEXT NOT NULL
    )
    """)

    # Version Audit Logs
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS version_audits (
        audit_id INTEGER PRIMARY KEY AUTOINCREMENT,
        doc_id TEXT NOT NULL,
        attempted_version TEXT NOT NULL,
        approved_version TEXT NOT NULL,
        technician TEXT NOT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        outcome TEXT NOT NULL,
        details TEXT NOT NULL
    )
    """)

    conn.commit()
    conn.close()
