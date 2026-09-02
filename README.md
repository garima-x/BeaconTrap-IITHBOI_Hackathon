# BeaconTrap

**AI-powered Android malware & banking-fraud forensics platform** — built for the **PSB Cybersecurity, Fraud & AI Hackathon 2026**, in collaboration with **IIT Hyderabad** and **Bank of India**.

🏆 **Finalist — Cybershield Hackathon, IIT Hyderabad × Bank of India (2026)**

🔗 **Live Demo:** [beacon-trap-frontend.vercel.app](https://beacon-trap-frontend.vercel.app)
📄 **Full Project Report:** [`BeaconTrap PSB IITH Report.docx`](./BeaconTrap%20PSB%20IITH%20Report.docx)

---

## What it does

BeaconTrap automates the investigation of suspicious Android APKs distributed through WhatsApp, SMS, and phishing links — the primary vector for banking trojans, OTP interceptors, and credential-harvesting malware targeting Indian bank customers. It takes an APK from upload to a fully explained, evidence-backed fraud report with minimal human intervention.

- **Static + Dynamic Analysis** — DEX decompilation, permission risk profiling, sandboxed runtime behavior monitoring
- **GenAI Multi-Agent Intelligence Core** (LangGraph) — de-obfuscation, MITRE ATT&CK mapping, network intel, GRC compliance, and risk-scoring agents working in sequence
- **Explainable Risk Scoring** — a transparent, weighted Threat Index (0–100) with factor-level evidence attribution, not a black-box verdict
- **Multi-Persona RBAC Reporting** — the same investigation rendered five different ways: Security Analyst, Bank Officer, Legal Auditor, Citizen/Public advisory, and Sys Admin
- **Multilingual Advisories** — reports and customer-facing alerts in English, Hindi, Telugu, Tamil, Kannada, and Malayalam
- **Blockchain-Backed Evidence Integrity** — SHA-256 hashes of every investigation report anchored on-chain for tamper-evident, auditable chain of custody

## What's actually implemented vs. designed

This project is honest about the line between architecture and working code — see [`AUDIT.md`](./AUDIT.md) for the full ground-truth checklist.

| Component | Status |
|---|---|
| Blockchain evidence anchoring | ✅ **Live.** `EvidenceAnchor.sol` deployed on Ethereum Sepolia at [`0xd9aa91a39248916D946C75Abf875F2b1660a8732`](https://sepolia.etherscan.io/address/0xd9aa91a39248916D946C75Abf875F2b1660a8732). Client-side signing via MetaMask — the backend never holds a private key. |
| Frontend (SOC dashboard, upload center, case workspace, 5 role-based views) | ✅ Live on Vercel |
| Relational data layer | ✅ Supabase (Postgres) with Row-Level Security, 9-table schema |
| Static & dynamic analysis workers, GenAI agent pipeline | 🛠️ Fully specified, partially implemented — actively in progress |

## Architecture

Five-layer decoupled async pipeline: **Client → API Gateway → Analysis Pipeline (RabbitMQ/Celery) → GenAI Multi-Agent Orchestrator (LangGraph) → Data Tier (PostgreSQL, Neo4j, Redis, MinIO)**. See the full report for diagrams and data-flow tables.

## Tech Stack

`FastAPI` `Celery + RabbitMQ` `Redis` `JADX / Androguard / Semgrep` `Frida / mitmproxy / gVisor` `LangGraph` `Solidity (Ethereum Sepolia)` `ethers.js + MetaMask` `Supabase (PostgreSQL)` `Neo4j` `MinIO` `Next.js + TypeScript` `shadcn/ui` `Recharts / D3.js / Sigma.js`

## Repository Structure

```
/backend      — FastAPI services, agent orchestration
/contracts    — EvidenceAnchor.sol (Solidity, Sepolia)
/frontend     — Next.js + TypeScript client
/workers      — Celery static & dynamic analysis workers
/docker       — Docker Compose deployment
AUDIT.md      — ground-truth tracker: design intent vs. working code
```

## Team

Built by **K S Harshitaa, Kim Mathur, Garima Sharma,** and **Dixha Bharti** — Manipal Institute of Technology, Bengaluru.

---

*This repository documents an active, evolving hackathon build. See [`AUDIT.md`](./AUDIT.md) and the Stage 2 progress report for the current implementation status of each component.*
