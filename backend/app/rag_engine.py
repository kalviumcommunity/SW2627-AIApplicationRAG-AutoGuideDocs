import json
import os
import uuid
import datetime
from typing import List, Dict, Any, Optional

import chromadb
from dotenv import load_dotenv
from google import genai
from google.genai import types

from app.database import get_db_connection


load_dotenv()


class AutoGuideRAGEngine:
    """
    AutoGuide RAG engine.

    Stage 1:
    - Documents are stored in SQLite.
    - Document chunks are embedded using Gemini.
    - Embeddings are stored in ChromaDB.
    - Queries are embedded using Gemini.
    - ChromaDB performs semantic retrieval.
    """

    def __init__(self):
        api_key = os.getenv("GEMINI_API_KEY")

        if not api_key:
            raise RuntimeError(
                "GEMINI_API_KEY is missing. "
                "Add it to backend/.env"
            )

        self.client = genai.Client(api_key=api_key)

        self.embedding_model = "gemini-embedding-001"

        chroma_path = os.path.join(
            os.path.dirname(os.path.dirname(__file__)),
            "chroma_db"
        )

        self.chroma_client = chromadb.PersistentClient(
            path=chroma_path
        )

        self.collection = self.chroma_client.get_or_create_collection(
            name="autoguide_documents"
        )

        self.chunks_cache = []

    # ---------------------------------------------------------
    # EMBEDDINGS
    # ---------------------------------------------------------

    def _embed_documents(self, texts: List[str]) -> List[List[float]]:
        """
        Create embeddings for document chunks.
        """

        if not texts:
            return []

        result = self.client.models.embed_content(
            model=self.embedding_model,
            contents=texts,
            config=types.EmbedContentConfig(
                task_type="RETRIEVAL_DOCUMENT",
                output_dimensionality=768
            )
        )

        return [
            embedding.values
            for embedding in result.embeddings
        ]

    def _embed_query(self, query: str) -> List[float]:
        """
        Create an embedding for a technician's search query.
        """

        result = self.client.models.embed_content(
            model=self.embedding_model,
            contents=query,
            config=types.EmbedContentConfig(
                task_type="RETRIEVAL_QUERY",
                output_dimensionality=768
            )
        )

        return result.embeddings[0].values

    # ---------------------------------------------------------
    # DATABASE → CHROMADB
    # ---------------------------------------------------------

    def _load_chunks_from_database(self):
        """
        Read document chunks from SQLite.
        """

        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT
                c.chunk_id,
                c.doc_id,
                c.chunk_index,
                c.section_title,
                c.content,
                c.metadata_json,

                d.doc_type,
                d.title AS doc_title,
                d.version,
                d.superseded_by,
                d.status,
                d.region,
                d.applicability_manufacturer,
                d.applicability_model,
                d.applicability_engine,
                d.last_updated,
                d.system_category

            FROM document_chunks c

            JOIN documents d
                ON c.doc_id = d.doc_id
        """)

        rows = cursor.fetchall()
        conn.close()

        chunks = []

        for row in rows:

            metadata = json.loads(row["metadata_json"])

            chunk = {
                "chunk_id": row["chunk_id"],
                "doc_id": row["doc_id"],
                "chunk_index": row["chunk_index"],
                "section_title": row["section_title"],
                "content": row["content"],

                "doc_type": row["doc_type"],
                "doc_title": row["doc_title"],
                "version": row["version"],
                "superseded_by": row["superseded_by"],
                "status": row["status"],
                "region": row["region"],

                "manufacturer": row["applicability_manufacturer"],
                "model": row["applicability_model"],
                "engine": row["applicability_engine"],

                "last_updated": row["last_updated"],
                "system_category": row["system_category"],

                "metadata": metadata
            }

            chunks.append(chunk)

        return chunks

    # ---------------------------------------------------------
    # BUILD VECTOR INDEX
    # ---------------------------------------------------------

    def _build_index(self):

        chunks = self._load_chunks_from_database()

        self.chunks_cache = chunks

        if not chunks:
            return

        ids = []
        documents = []
        metadatas = []

        for chunk in chunks:

            ids.append(chunk["chunk_id"])

            documents.append(
                chunk["content"]
            )

            metadata = {
                "doc_id": chunk["doc_id"],
                "doc_type": chunk["doc_type"],
                "doc_title": chunk["doc_title"],
                "version": chunk["version"],
                "status": chunk["status"],
                "region": chunk["region"],
                "manufacturer": chunk["manufacturer"] or "",
                "model": chunk["model"] or "",
                "engine": chunk["engine"] or "",
                "system_category": chunk["system_category"] or "",
                "section_title": chunk["section_title"]
            }

            metadatas.append(metadata)

        print(
            f"Creating embeddings for {len(documents)} document chunks..."
        )

        embeddings = self._embed_documents(documents)

        # Remove previous collection contents.
        # This keeps the index synchronized with SQLite.
        existing = self.collection.get()

        if existing["ids"]:
            self.collection.delete(
                ids=existing["ids"]
            )

        self.collection.add(
            ids=ids,
            documents=documents,
            embeddings=embeddings,
            metadatas=metadatas
        )

        print(
            f"ChromaDB index created with {len(ids)} chunks."
        )

    def refresh_index(self):
        self._build_index()

    # ---------------------------------------------------------
    # DOCUMENT INGESTION
    # ---------------------------------------------------------

    def ingest_document(
        self,
        title: str,
        doc_type: str,
        content_full: str,
        applicability_manufacturer: str = "Generic OEM",
        applicability_model: str = "All Models",
        applicability_engine: str = "All Engines",
        region: str = "US-EAST",
        version: str = "v1.0",
        system_category: str = "General Diagnostics"
    ) -> Dict[str, Any]:

        doc_id = f"MAN-{uuid.uuid4().hex[:6].upper()}"

        last_updated = datetime.datetime.now().strftime(
            "%b %d, %Y"
        )

        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("""
            INSERT INTO documents (
                doc_id,
                doc_type,
                title,
                applicability_manufacturer,
                applicability_model,
                applicability_engine,
                region,
                version,
                superseded_by,
                status,
                last_updated,
                content_full,
                system_category
            )

            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            doc_id,
            doc_type,
            title,
            applicability_manufacturer,
            applicability_model,
            applicability_engine,
            region,
            version,
            None,
            "Approved",
            last_updated,
            content_full,
            system_category
        ))

        # Simple initial chunking.
        raw_chunks = [
            c.strip()
            for c in content_full.split("\n\n")
            if c.strip()
        ]

        if not raw_chunks:
            raw_chunks = [content_full]

        for idx, chunk_text in enumerate(raw_chunks):

            sec_title = (
                chunk_text
                .split("\n")[0]
                .replace("#", "")
                .strip()[:100]
            )

            chunk_id = (
                f"{doc_id}-chunk-{idx}"
            )

            metadata = {
                "doc_id": doc_id,
                "title": title,
                "doc_type": doc_type,
                "version": version,
                "status": "Approved",
                "region": region,
                "applicability": (
                    f"{applicability_manufacturer} "
                    f"{applicability_model} "
                    f"({applicability_engine})"
                )
            }

            cursor.execute("""
                INSERT INTO document_chunks (
                    chunk_id,
                    doc_id,
                    chunk_index,
                    section_title,
                    content,
                    metadata_json
                )

                VALUES (?, ?, ?, ?, ?, ?)
            """, (
                chunk_id,
                doc_id,
                idx,
                sec_title,
                chunk_text,
                json.dumps(metadata)
            ))

        conn.commit()
        conn.close()

        # Rebuild semantic index.
        self.refresh_index()

        return {
            "success": True,
            "doc_id": doc_id,
            "chunks_count": len(raw_chunks),
            "title": title,
            "message": (
                "Document successfully indexed "
                "into AutoGuide semantic RAG database."
            )
        }

    # ---------------------------------------------------------
    # SEARCH
    # ---------------------------------------------------------

    def search(
        self,
        query: str,
        vehicle_model: Optional[str] = None,
        region: Optional[str] = "US-EAST",
        doc_type: Optional[str] = "All",
        system: Optional[str] = "All",
        limit: int = 5
    ) -> Dict[str, Any]:

        if not self.chunks_cache:
            self.refresh_index()

        if not self.chunks_cache:
            return {
                "matches": [],
                "ai_summary": {
                    "headline": "No indexed data",
                    "summary_bullets": []
                },
                "active_recalls": []
            }

        query_embedding = self._embed_query(query)

        # Chroma metadata filtering.
        where_conditions = []

        if region:
            where_conditions.append({
                "$or": [
                    {"region": region},
                    {"region": "Global"}
                ]
            })

        if doc_type and doc_type != "All":
            where_conditions.append({
                "doc_type": {
                    "$eq": doc_type
                }
            })

        if system and system != "All":
            where_conditions.append({
                "system_category": {
                    "$eq": system
                }
            })

        # Chroma only needs a where clause if filters exist.
        where = None

        if len(where_conditions) == 1:
            where = where_conditions[0]

        elif len(where_conditions) > 1:
            where = {
                "$and": where_conditions
            }

        results = self.collection.query(
            query_embeddings=[query_embedding],
            n_results=limit,
            where=where,
            include=[
                "documents",
                "metadatas",
                "distances"
            ]
        )

        matches = []

        result_documents = results.get("documents", [[]])[0]
        result_metadatas = results.get("metadatas", [[]])[0]
        result_distances = results.get("distances", [[]])[0]

        for i, content in enumerate(result_documents):

            metadata = result_metadatas[i]
            distance = result_distances[i]

            # Convert distance to a simple relevance score.
            relevance = max(
                0.0,
                1.0 - float(distance)
            )

            # Vehicle model filtering / boosting.
            model_matches = True

            if vehicle_model:

                stored_model = (
                    metadata.get("model") or ""
                ).lower()

                requested_model = (
                    vehicle_model.lower()
                )

                model_matches = (
                    requested_model in stored_model
                    or stored_model in requested_model
                    or stored_model == ""
                )

            if not model_matches:
                continue

            matches.append({
                "doc_id": metadata.get("doc_id"),
                "doc_type": metadata.get("doc_type"),
                "title": metadata.get("doc_title"),
                "version": metadata.get("version"),
                "status": metadata.get("status"),
                "region": metadata.get("region"),
                "applicability": (
                    f"{metadata.get('manufacturer', '')} "
                    f"{metadata.get('model', '')} "
                    f"({metadata.get('engine', '')})"
                ).strip(),
                "chunks": [
                    {
                        "section": metadata.get(
                            "section_title"
                        ),
                        "content": content,
                        "score": round(
                            relevance,
                            4
                        )
                    }
                ],
                "relevance_score": round(
                    relevance,
                    4
                )
            })

        ai_summary = self._build_retrieval_summary(
            query,
            matches,
            region,
            vehicle_model
        )

        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute(
            """
            SELECT *
            FROM recalls
            WHERE region = ?
               OR region LIKE '%Global%'
               OR region LIKE '%US%'
            """,
            (region,)
        )

        recalls_rows = [
            dict(row)
            for row in cursor.fetchall()
        ]

        conn.close()

        return {
            "query": query,
            "region": region,
            "vehicle_model": vehicle_model,
            "total_matches": len(matches),
            "matches": matches,
            "ai_summary": ai_summary,
            "active_recalls": recalls_rows
        }

    # ---------------------------------------------------------
    # TEMPORARY SUMMARY
    # ---------------------------------------------------------

    def _build_retrieval_summary(
        self,
        query: str,
        matches: List[Dict[str, Any]],
        region: str,
        vehicle_model: Optional[str]
    ) -> Dict[str, Any]:

        if not matches:
            return {
                "headline": (
                    "No specific OEM document found "
                    "for this query."
                ),
                "verification_status": "UNVERIFIED",
                "summary_bullets": [
                    "Try verifying the vehicle configuration.",
                    "No sufficiently relevant document "
                    "was retrieved."
                ],
                "citations": []
            }

        bullets = []
        citations = []

        for match in matches[:3]:

            citations.append(
                f"{match['title']} "
                f"({match['doc_id']} "
                f"{match['version']})"
            )

            for chunk in match["chunks"]:

                lines = [
                    line.strip("- ")
                    .strip("* ")
                    .strip("# ")
                    for line in chunk["content"].split("\n")
                    if line.strip()
                    and not line.startswith("#")
                ]

                bullets.extend(
                    lines[:2]
                )

        unique_bullets = list(
            dict.fromkeys(bullets)
        )[:5]

        deprecated = any(
            match["status"] == "Deprecated"
            for match in matches
        )

        return {
            "headline": (
                f"Retrieved guidance for "
                f"'{query}'"
            ),
            "target_model": (
                vehicle_model
                or matches[0]["applicability"]
            ),
            "verification_status": (
                "OEM CERTIFIED"
                if not deprecated
                else "ATTENTION: DEPRECATED DOCUMENT"
            ),
            "deprecated_warning": deprecated,
            "summary_bullets": unique_bullets,
            "citations": citations,
            "recommended_action": (
                "Review the retrieved OEM documentation "
                "before proceeding."
            )
        }


rag_engine = AutoGuideRAGEngine()