# Okta User Lifecycle Orchestrator

A comprehensive, full-stack identity and user lifecycle management dashboard integrated with the Okta Users API.

---

## 🌟 Overview

The **Okta User Lifecycle Orchestrator** simplifies identity administration, user provisioning, role-based lifecycle transitions, and compliance auditing across your enterprise directory.

### Key Capabilities:
- **Dual Role Segregation**: Dedicated interactive portals for **Administrators** and **Normal Users**.
- **User Lifecycle Operations**: Real-time CRUD operations, activation, deactivation, suspension, and deletion.
- **Enterprise Dashboard**: Top metric KPI cards, advanced search and status/role filters, paginated table, and action logs.
- **Live Audit Trail**: Automated logging for every lifecycle event with timestamps and user details.
- **CSV Directory Export**: One-click download of the complete user directory in standard CSV format.

---

## 🏗️ Architecture & Tech Stack

- **Backend**: Python 3.10+, Flask, Flask-CORS, Requests, Python-Dotenv
- **Frontend**: React 18, Vite, Lucide Icons, Custom Okta Design System (Vanilla CSS)
- **API Integration**: Okta Users API v1 (`/api/v1/users`, `/api/v1/logs`)

---

## 🚀 Quickstart Guide

### 1. Prerequisites
- Python 3.10 or higher
- Node.js 18 or higher & npm

### 2. Backend Setup
```bash
cd backend
python -m venv venv
# On Windows
venv\Scripts\activate
# On Linux/macOS
source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
# Configure your OKTA_DOMAIN and OKTA_TOKEN in .env

python app.py
```
*Backend server runs on `http://127.0.0.1:5000`.*

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
*Frontend dev server runs on `http://localhost:5173`.*

---

## 🛡️ License

MIT License.
