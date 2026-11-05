# ConsentLog – Intelligent Consent & Preference Management Platform

**ConsentLog** is an enterprise-grade, full-stack privacy and consent governance platform. It provides centralized cookie and preference management, version-controlled privacy notices with side-by-side clause diffing, and a tamper-evident, append-only cryptographic audit history backed by SHA-256 hash chaining.

---

## 🏛️ System Architecture

[![ConsentLog System Architecture](docs/architecture-animated.svg)](https://htmlpreview.github.io/?https://github.com/Git-huber2007/consentlog/blob/main/docs/index.html)

*Click the diagram above to launch the interactive viewer with pan, zoom, search, and component inspection.*

- **🚀 Interactive Viewer**: [Open Full-Screen Canvas](https://htmlpreview.github.io/?https://github.com/Git-huber2007/consentlog/blob/main/docs/index.html) *(Pan, zoom, and inspect every tier)*
- **📄 Standalone Canvas**: [`docs/index.html`](docs/index.html) *(Open locally or publish via GitHub Pages)*
- **📐 Archify Specification**: [`architecture/candidate.json`](architecture/candidate.json) *(Typed component & boundary model)*
- **🌐 GitHub Pages Hosting**: Enable in repository **Settings → Pages → Branch: `main` / Folder: `/docs`** for native hosting at `https://git-huber2007.github.io/consentlog/`

<details>
<summary><b>🔍 Architectural Tiers & Component Topology</b></summary>

| Tier | Component | Responsibilities & Protocols |
| :--- | :--- | :--- |
| **1. Frontend Web Tier** | Browser Client | Desktop & mobile clients communicating via HTTP/2 TLS |
| | React 18 SPA | Vite 6 build, Tailwind CSS design system, React Router v7 navigation |
| | Client State | AuthContext JWT token cache, ToastProvider notifications, Notice renewal checks |
| **2. Security & Gateway** | API Gateway | Express v4 reverse proxy on `:5000` with Helmet security headers & CORS origin isolation |
| | Security Guards | JWT authentication, bcryptjs password hashing, Express Rate Limiter (500 req/15m) |
| | Input Sanitization | Mongo-sanitize for NoSQL injection prevention, Zod strict boundary schema validation |
| **3. Business Logic & Ledger** | Controllers | Preference manager, notice side-by-side diff engine, DSAR compliance export |
| | Sequencer Service | Mutex-locked append-only queue enforcing non-blocking sequential block creation |
| | Hash Chain Service | Deterministic SHA-256 hash chaining (`eventHash = SHA256(canonicalPayload + prevHash)`) |
| **4. Persistence & Storage** | Mongoose ODM | Schema enforcement, document models (`User`, `Preference`, `ConsentLog`, `PrivacyNotice`) |
| | Hook Guard | Pre-save and pre-remove hooks blocking `updateOne`, `deleteOne`, and `findOneAndUpdate` |
| | MongoDB Engine | WiredTiger storage engine with ACID multi-document transactions and replica set support |

</details>

---

## 🌟 Core Capabilities

### 1. Interactive Preference Centre
- **5 Granular Categories**:
  - **Essential Cookies**: Strictly necessary session security and authentication *(always active)*.
  - **Analytics Cookies**: First-party telemetry with IP truncation and zero PII.
  - **Marketing Cookies**: Campaign attribution and engagement measurement.
  - **Personalization**: Theme settings, regulatory presets, and UI localization.
  - **Third-Party Data Sharing**: Regulated telemetry governed by Standard Contractual Clauses (SCCs).
- **Consent Operations**: Individual toggles, **Accept All**, **Reject Optional**, and formal **Right-to-Withdraw**.
- **Live Summary Metrics**: Real-time counters for Total, Enabled, Disabled, and Withdrawn preferences.

### 2. Tamper-Evident Append-Only Audit History
- **Zero Mutation Surface**: HTTP `PUT`, `PATCH`, and `DELETE` endpoints return `403 Forbidden` (`IMMUTABLE_AUDIT_VIOLATION`), with Mongoose ODM pre-hooks enforcing write-once integrity.
- **SHA-256 Hash Chaining**: Every audit entry stores a deterministic hash derived from its sequential block number, previous block hash, and canonical payload.
- **Live Integrity Verification**: Recomputes the cryptographic chain from Genesis (`0000...0000`) to Head via `POST /api/audit/verify`.
- **DSAR Compliance Export**: Generate GDPR Art. 15 / 20 and DPDP Act Sec. 11 cryptographically signed export passports via `GET /api/audit/dsar-passport`.

### 3. Version-Controlled Privacy Notices & Diff Engine
- **Notice Lineage**: Tracks published versions (v1.0, v1.1, v2.0) with effective dates and change summaries.
- **Side-by-Side Clause Diffing**: Visual comparison of additions (`+`), modifications (`~`), and removals (`-`).
- **Non-Assumed Consent**: Publishing a new notice triggers an explicit review banner rather than assuming automated acceptance.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, Tailwind CSS, React Router v7, Axios, Lucide React, Recharts |
| **Backend** | Node.js, Express 4.21, REST API, MongoDB, Mongoose 8 (with automatic Embedded Replica Set fallback) |
| **Security** | JWT Authentication, `bcryptjs`, Zod, Role-Based Access Control (`user` / `admin`), Helmet, Rate Limiting, Mongo Sanitize |

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm run install:all
```

### 2. Run the Application
```bash
npm run dev
```
- **Frontend**: `http://localhost:5173`
- **Backend API**: `http://localhost:5000`
- **Database**: Automatically connects to local MongoDB or launches an embedded persistent replica set with ACID transaction support.



*(One-click account switching is available directly on the login page.)*

---

## 🧪 Verification & Security Suite

Run the 14-point automated test suite:
```bash
npm test
```
Verifies unauthorized request blocking, essential cookie protection, transactional preference updates, formal consent withdrawal, HTTP & ODM immutability, SHA-256 hash chain integrity, RBAC isolation, notice version diffing, and explicit acceptance tracking.
