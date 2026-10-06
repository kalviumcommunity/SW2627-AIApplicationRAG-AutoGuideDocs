# AutoGuide

AutoGuide is a vehicle-aware automotive diagnostics and technical documentation platform built for service technicians.

It uses Retrieval-Augmented Generation (RAG) to retrieve relevant information from approved automotive manuals, service bulletins, diagnostic guides, and recall documents based on the specific vehicle and region.

## Problem

Automotive repair information is often spread across different manuals, service bulletins, recall notices, and regional documents. This can lead to technicians receiving inconsistent or outdated guidance.

AutoGuide provides a single, vehicle-specific source of technical information.

## Features

- Technician login and registration
- Vehicle search and VIN verification
- Vehicle-specific technical documentation
- Semantic RAG search
- Automotive repair manuals and service bulletins
- OEM recall information
- Diagnostic workflows and troubleshooting steps
- Document version checking
- Outdated document warnings
- PDF document ingestion and indexing
- Source-grounded search results
- Region and vehicle-specific filtering

## RAG Pipeline

AutoGuide uses RAG to retrieve relevant information instead of relying only on a language model's memory.

```text
Technician Query
       ↓
Vehicle + Region Context
       ↓
Gemini Embeddings
       ↓
ChromaDB Vector Search
       ↓
Relevant Document Chunks
       ↓
Grounded Diagnostic Information
```

frontend url:  https://sw2627-aiapplicationrag-autoguidedocs-1.onrender.com/
backend url: https://sw2627-aiapplicationrag-autoguidedocs.onrender.com/
