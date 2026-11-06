# ConsentLog Enterprise

<div align="center">

![ConsentLog Banner](https://raw.githubusercontent.com/Git-huber2007/consentlog/main/docs/architecture-animated.svg)

**Intelligent Enterprise Consent & Preference Governance Platform**

*Cryptographic SHA-256 Chained Audit Trail · Real-Time Microservice Verification · GDPR Art. 17 DSAR Workflow · Webhook Event Dispatcher · Cookie Inventory Scanner*

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen?style=flat-square&logo=github)](https://github.com/Git-huber2007/consentlog)
[![Verification Suite](https://img.shields.io/badge/tests-19%2F19%20passed%20(100%25)-success?style=flat-square&logo=jest)](https://github.com/Git-huber2007/consentlog)
[![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](LICENSE)
[![Regulatory Compliance](https://img.shields.io/badge/compliance-GDPR%20|%20CCPA%20|%20DPDP-indigo?style=flat-square)](https://gdpr-info.eu/)
[![Audit Ledger](https://img.shields.io/badge/ledger-SHA--256%20Chained-black?style=flat-square&logo=hyperledger)](https://github.com/Git-huber2007/consentlog)
[![Node.js](https://img.shields.io/badge/node->=20.0.0-339933?style=flat-square&logo=node.js)](https://nodejs.org/)
[![React](https://img.shields.io/badge/react-18.x-61DAFB?style=flat-square&logo=react)](https://react.dev/)

[System Architecture](#-system-architecture) • [Core Capabilities](#-core-capabilities) • [API Reference](#-api-reference) • [Quick Start](#-quick-start) • [Compliance Matrix](#-compliance--security-matrix)

</div>

---

## 🏛️ System Architecture

ConsentLog is engineered as a zero-trust, multi-tenant privacy governance engine. Every consent state transition is recorded as an immutable block cryptographically chained to its predecessor with SHA-256 hashing.

```
                    ┌────────────────────────────────────────────────────────┐
                    │               CLIENTS & INTEGRATIONS                  │
                    │   React 18 SPA  ·  Mobile Apps  ·  External Services   │
                    └───────────────────────────┬────────────────────────────┘
                                                │ HTTPS / REST / Webhooks
                                                ▼
                    ┌────────────────────────────────────────────────────────┐
                    │                 SECURITY GATEWAY TIER                  │
                    │   Helmet · Rate Limiting · JWT Auth · API Key Auth     │
                    │   Express Mongo Sanitize · Role-Based Access Control   │
                    └───────────────────────────┬────────────────────────────┘
                                                │
                 ┌──────────────────────────────┴──────────────────────────────┐
                 ▼                                                             ▼
  ┌───────────────────────────────┐                             ┌───────────────────────────────┐
  │      GOVERNANCE ENGINE        │                             │    DISPATCH & AUDIT TIER      │
  │  · Preference Centre (5 Cats) │                             │  · SHA-256 Hash Chained Logs  │
  │  · Versioned Notices & Diffs  │                             │  · Mutex Sequencer Service    │
  │  · Retention & Expiration SLA │                             │  · HMAC-SHA256 Signed Hooks   │
  │  · DSAR Article 17 Erasure    │                             │  · Cryptographic Certificates │
  │  · Cookie & Tracker Inventory │                             │  · Microservice Status Engine │
  └──────────────┬────────────────┘                             └──────────────┬────────────────┘
                 │                                                             │
                 └──────────────────────────────┬──────────────────────────────┘
                                                │
                                                ▼
                    ┌────────────────────────────────────────────────────────┐
                    │                DATA PERSISTENCE LAYER                  │
                    │  MongoDB WiredTiger Engine · Embedded ReplSet Fallback │
                    │  Mongoose ODM Mutation Locks (Block PUT/PATCH/DELETE)  │
                    └────────────────────────────────────────────────────────┘
```

- **🚀 Interactive Topology Canvas**: [Launch Full-Screen Architecture Viewer](https://htmlpreview.github.io/?https://github.com/Git-huber2007/consentlog/blob/main/docs/index.html) *(Pan, zoom, and inspect every subsystem)*
- **📐 Archify Specification**: [`architecture/candidate.json`](architecture/candidate.json) *(Full component boundary schema)*
- **🌐 Standalone Canvas**: [`docs/index.html`](docs/index.html) *(Deployable natively via GitHub Pages)*

---

## 🌟 Core Capabilities

### 1. Tamper-Evident Append-Only Cryptographic Audit History
- **Zero Mutation Surface**: Audit logs cannot be updated or erased through application APIs; HTTP `PUT`, `PATCH`, and `DELETE` calls return `403 Forbidden` (`IMMUTABLE_AUDIT_VIOLATION`). Mongoose schema hooks enforce write-once integrity.
- **SHA-256 Hash Chaining**: Every log entry derives its deterministic signature from:
  $$\text{Block Hash} = \text{SHA256}(\text{Canonical Payload} + \text{Previous Block Hash} + \text{Sequence ID})$$
- **Automated Chain Verification**: Live endpoint (`POST /api/audit/verify`) validates chain continuity from Genesis (`0000...0000`) through Head block.
- **Data Subject Portability Passport**: Generates GDPR Art. 15/20 and DPDP Act Sec. 11 cryptographically sealed JSON and PDF audit passports.

### 2. Multi-Jurisdiction Consent Expiration & Retention Lifecycle
- **EDPB & CNIL SLA Engine**: Calculates real-time consent decay based on legal jurisdiction (e.g., 12 months for GDPR, 6 months for CNIL, 24 months for CCPA).
- **Proactive Expiration Alerts**: Visual countdown alerts users when consent validity approaches legal expiration windows.
- **Renewal Enforcement**: Flags expired categories to prevent automated processing until explicit re-authorization is provided.

### 3. Downstream Webhook Event Dispatcher
- **Decoupled Architecture**: Propagates real-time consent state changes to external stacks (HubSpot, Segment, Salesforce, CDP).
- **Cryptographic Delivery Signatures**: Dispatches `X-ConsentLog-Signature: sha256=<hmac>` headers generated with endpoint-specific secrets.
- **Event Scope**: Subscribes to `consent.granted`, `consent.withdrawn`, `consent.updated`, and `user.erased`.

### 4. Article 17 "Right to Erasure" (DSAR Workflow)
- **Immutable Ledger Anonymization**: Resolves the conflict between GDPR Article 17 erasure mandates and audit continuity.
- **Cryptographic Pseudonymization**: Converts identifying PII into irreversible tokens (`ANON-XXXXXX`, `erased-XXXX@consentlog.deleted`).
- **Chain Preservation**: Documents the erasure event in a terminal audit block while maintaining historical ledger validity.

### 5. First- & Third-Party Cookie Inventory Scanner
- **Tracker Catalog**: Categorizes scripts across Essential, Analytics, Marketing, and Functional classifications with host domain tracking.
- **Automated Domain Scanner**: Real-time HTTP scanner discovering cookies, tracker origins, and third-party script tags.
- **Regulatory Mapping**: Links inventory trackers directly to user preferences and GTM Consent Mode v2 variables.

### 6. External REST Verification API & Developer Keys
- **High-Throughput Microservice Check**: `GET /api/v1/consent/check` enables backend microservices to check consent status in under 10ms.
- **Cryptographic Verification Proof**: Returns `isAllowed: boolean` accompanied by the data subject's latest SHA-256 ledger proof block.
- **Key Lifecycle Management**: Role-based issuance of hashed API credentials (`cl_live_...`) with automatic tracking of last-used timestamps.

### 7. Version-Controlled Privacy Notices & Visual Diff Engine
- **Historical Notice Lineage**: Tracks legal notices (v1.0, v1.1, v2.0) with publication dates and summaries of changes.
- **Side-by-Side Clause Diffing**: Visual clause breakdown highlighting additions (`+`), modifications (`~`), and removals (`-`).
- **Non-Assumed Consent**: Publishing a new notice triggers an explicit review banner rather than assuming automated acceptance.

### 8. Cookie Banner Simulator & GTM Consent Mode v2 Embed SDK
- **Interactive Simulator**: Configurable preview supporting Bottom Sticky Bar, Floating Shield Badge, and Modal Dialog layouts.
- **Google Tag Manager Ready**: Drop-in snippets pre-configured for `ad_storage`, `analytics_storage`, and `personalization_storage`.
- **Universal Embed Tag**: Single-line integration script for external web applications.

---

## 🛠️ Technology Stack

| Domain | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React 18, Vite 6, Tailwind CSS | High-performance, accessible single-page application |
| **State & Router** | React Router v7, React Context | Declarative routing and authenticated session state |
| **Icons & Charts** | Lucide React, Recharts | Interactive telemetry visualizations and UI icons |
| **Backend Runtime** | Node.js 20+, Express 4.21 | REST API, webhook dispatcher, and microservice gateway |
| **Database & ODM** | MongoDB, Mongoose 8 | Multi-document ACID transactions with replica set support |
| **Embedded Database** | MongoMemoryReplSet | Zero-configuration local development & test replica set |
| **Security & Auth** | JWT, bcryptjs, Helmet, Express Rate Limit | Token validation, header hardening, rate throttling |
| **Data Validation** | Zod, Express Mongo Sanitize | Boundary input schema validation & NoSQL injection shield |
| **Cryptography** | Node.js `crypto` (SHA-256, HMAC) | Immutable audit hash chaining and webhook signing |

---

## 📡 API Reference

### Microservice External Verification (`/api/v1/consent`)

#### Verify Consent Status
```http
GET /api/v1/consent/check?email=user@company.com&category=marketing
```
**Headers:**
```http
X-API-Key: cl_live_xxxxxxxxxxxxxxxxxxxxxxxx
```
**Response (`200 OK`):**
```json
{
  "success": true,
  "dataSubject": {
    "id": "6aed581ed4a6fde9f4a62791",
    "email": "alex@enterprise.io",
    "jurisdiction": "GDPR (EU)",
    "organization": "Enterprise Global Corp"
  },
  "category": "marketing",
  "isAllowed": true,
  "status": "Granted",
  "noticeVersion": "2.0",
  "lastConsentUpdate": "2026-11-06T04:31:28.442Z",
  "latestAuditId": "AUD-000004-92AF1D",
  "latestAuditHash": "6f31a53f81c21390147a9a9f64bbb14190b5a2601177ec9bdddb1d27f78ffe28",
  "cryptographicProof": "SHA-256 Ledger Verified",
  "timestamp": "2026-11-06T10:45:00.000Z"
}
```

---

### Core Consent & Preference Endpoints (`/api/consent`, `/api/preferences`)

| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/preferences` | Retrieve user preferences across all 5 categories | User |
| `PUT` | `/api/preferences` | Update category preferences and append audit block | User |
| `PATCH` | `/api/preferences/:name` | Toggle single preference with transactional lock | User |
| `POST` | `/api/consent/withdraw` | Exercise formal Right to Withdraw consent | User |
| `GET` | `/api/consent/retention` | Get consent expiration countdown & retention SLA | User |
| `POST` | `/api/consent/dsar/request` | Submit Article 17 Right to Erasure request | User |
| `GET` | `/api/consent/dsar/my-requests` | View user's submitted DSAR requests | User |

---

### Audit & Cryptographic Ledger Endpoints (`/api/audit`)

| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/audit` | Retrieve paginated SHA-256 chained audit history | User |
| `POST` | `/api/audit/verify` | Recompute cryptographic chain from Genesis to Head | User / Admin |
| `GET` | `/api/audit/certificate` | Export cryptographic audit certificate receipt | User / Admin |
| `GET` | `/api/audit/dsar-passport` | Export GDPR Art. 15/20 cryptographically signed passport | User |

---

### Admin & Governance Endpoints (`/api/admin`)

| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/metrics` | System-wide consent metrics and distribution | Admin |
| `GET` | `/api/admin/webhooks` | List configured downstream webhook endpoints | Admin |
| `POST` | `/api/admin/webhooks` | Register new webhook endpoint with HMAC secret | Admin |
| `POST` | `/api/admin/webhooks/:id/test` | Trigger test ping payload to webhook target | Admin |
| `DELETE` | `/api/admin/webhooks/:id` | Remove webhook endpoint subscription | Admin |
| `GET` | `/api/admin/dsar/requests` | List pending Article 17 erasure requests | Admin |
| `POST` | `/api/admin/dsar/requests/:id/process` | Execute cryptographic pseudonymization & log event | Admin |
| `GET` | `/api/admin/cookies` | List cookie & tracker inventory registry | Admin |
| `POST` | `/api/admin/cookies/scan` | Trigger live domain tracker scan | Admin |
| `GET` | `/api/admin/api-keys` | List issued microservice API keys | Admin |
| `POST` | `/api/admin/api-keys` | Generate new authenticated API key (`cl_live_...`) | Admin |
| `DELETE` | `/api/admin/api-keys/:id` | Revoke microservice API key credential | Admin |

---

## 🚀 Quick Start

### Prerequisites
- **Node.js**: `v20.0.0` or higher
- **npm**: `v10.0.0` or higher
- **MongoDB**: Optional (An embedded multi-document replica set launches automatically if no local MongoDB instance is detected)

### 1. Clone & Install
```bash
git clone https://github.com/Git-huber2007/consentlog.git
cd consentlog
npm run install:all
```

### 2. Launch Development Environment
```bash
npm run dev
```
- **Frontend SPA**: `http://localhost:5173`
- **Backend API Gateway**: `http://localhost:5000`
- **Health Check**: `http://localhost:5000/api/health`

### 3. Build for Production
```bash
npm run build
```

---

## 🧪 Verification & Security Suite

The platform includes an automated 19-point integration and compliance test suite covering access control, cryptographic hash chains, immutability barriers, and new enterprise workflows.

```bash
npm test
```

### Verified Test Cases (19/19 Passing)
1. **Unauthorized Access**: Blocks unauthenticated requests with `HTTP 401`.
2. **Privacy by Default**: Validates onboarding registration baseline (all non-essential categories disabled).
3. **Password Security**: Tests bcrypt credential hashing and JWT token issuance.
4. **Essential Cookies Protection**: Rejects modification of essential cookies with `400 Bad Request`.
5. **Transactional Preference Updates**: Verifies multi-document ACID write consistency.
6. **Formal Consent Withdrawal**: Verifies Right to Withdraw without audit log loss.
7. **API-Level Immutability**: Confirms `PUT`, `PATCH`, and `DELETE` on `/api/audit` are rejected with `403 Forbidden`.
8. **ODM-Level Hook Guard**: Validates Mongoose pre-hooks block direct document mutation.
9. **Tenant & User Isolation**: Ensures cross-user audit record isolation.
10. **Cryptographic Chain Validation**: Validates SHA-256 block continuity across all records.
11. **Role-Based Access Control**: Prevents non-admin accounts from accessing administrative routes.
12. **Notice Diff Engine**: Computes precise line-by-line diffs between published notice versions.
13. **Notice Publishing**: Validates version lineage without automated assumption of consent.
14. **Explicit Re-Consent**: Tracks audit linkage upon user acceptance of revised notice terms.
15. **Consent Retention SLA**: Validates EDPB/CNIL countdowns and expiration calculations.
16. **Webhook Dispatcher**: Verifies endpoint registration and HMAC-SHA256 signature headers.
17. **Article 17 Erasure**: Confirms PII erasure, user pseudonymization, and audit block generation.
18. **Cookie Inventory**: Verifies registry categorization across regulatory groups.
19. **External Verification API**: Tests `GET /api/v1/consent/check` with API keys and cryptographic proof returns.

---

## 👥 Pre-Configured Test Credentials

| Role | Email | Password | Default Jurisdiction |
| :--- | :--- | :--- | :--- |
| **Chief Privacy Officer (Admin)** | `admin@consentlog.io` | `Password123!` | Global Governance HQ |
| **Enterprise User (GDPR)** | `alex@enterprise.io` | `Password123!` | GDPR (European Union) |
| **Healthcare User (DPDP)** | `priya@enterprise.io` | `Password123!` | DPDP Act (India) |
| **Financial User (CCPA)** | `marcus@enterprise.io` | `Password123!` | CCPA / CPRA (California) |

*(One-click demo account switching is also available directly on the login interface.)*

---

## 📋 Compliance & Security Matrix

| Regulatory Standard | Legal Mandate | ConsentLog Implementation |
| :--- | :--- | :--- |
| **GDPR Art. 7(1)** | Burden of Proof | SHA-256 chained audit ledger providing mathematical proof of consent conditions at any timestamp. |
| **GDPR Art. 7(3)** | Right to Withdraw | Single-click withdrawal mechanism as easily accessible as granting consent, instantly revoking tokens. |
| **GDPR Art. 15 & 20** | Access & Portability | Cryptographically sealed JSON and PDF DSAR passports containing full consent history. |
| **GDPR Art. 17** | Right to Erasure | Cryptographic anonymization to `ANON-XXXXXX` while preserving append-only audit continuity. |
| **EDPB Guidelines 05/2020** | Refresh & Expiration | Automated expiration scheduler calculating legal decay and alerting users prior to lapse. |
| **CCPA / CPRA § 1798.120** | Opt-Out of Sale / Share | Dedicated third-party data sharing toggle with immediate downstream webhook dispatch. |
| **DPDP Act 2023 Sec. 6** | Itemized Consent Notice | Multilingual notice versioning with side-by-side clause diffing and explicit re-consent gates. |
| **ISO/IEC 27001:2022** | Non-Repudiation (A.8.15) | Write-once append-only storage guards preventing database-level mutation of audit records. |

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
