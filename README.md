# KING Multi-Tenant CRM Web Application

A production-grade, multi-tenant CRM web client built with **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, and **TanStack Query**.

Designed with a formal, editorial **"financial ledger meets modern SaaS"** aesthetic:
- **Typography**: Editorial serif titles (`Newsreader`), clean UI sans (`IBM Plex Sans`), and tabular numerals (`IBM Plex Mono`).
- **Surfaces**: Hairline 1px borders, small radii (2px to 6px), flat cards, and uppercase micro-labels.
- **Accents**: Restrained warm antique brass accent paired with muted semantic status tones.
- **Theme Support**: Custom warm paper-like light theme and deep ink charcoal dark theme with WCAG AA compliance.

---

## 1. Prerequisites
- **Node.js**: v18.17+ (v20+ recommended)
- **Package Manager**: `pnpm` (or `npm`, `yarn`)
- **Backend**: KING Central Platform backend running on `http://localhost:8000`

---

## 2. Quick Setup & Run

### Step 1: Install Dependencies
```bash
cd projects
pnpm install
```

### Step 2: Configure Environment Variables
Copy the `.env.local.example` file to `.env.local`:
```bash
cp .env.local.example .env.local
```
Ensure `NEXT_PUBLIC_API_BASE_URL` points to your running FastAPI backend:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1/crm
```

### Step 3: Run the Development Server
```bash
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser.

### Step 4: Build for Production
```bash
pnpm build
pnpm start
```

---

## 3. Pre-Seeded Default Super Admin Credentials

You can sign in immediately using the platform auto-seeded account:
- **Email**: `superadmin@crmplatform.com`
- **Password**: `SuperAdmin@CRM2026!`
- **Role**: `SUPER_ADMIN`

*(The login screen also provides a convenient "Auto-fill Super Admin" button).*

---

## 4. Role-Based Navigation & Permissions

| View / Feature | Platform Super Admin (`SUPER_ADMIN`) | Organization Admin (`ORG_ADMIN`) | Organization User (`ORG_USER`) |
| :--- | :---: | :---: | :---: |
| **Organizations Directory** | ✅ Full control & 1-Mo Trial creation | ❌ Restricted | ❌ Restricted |
| **Extend Subscriptions** | ✅ Full control | ❌ Restricted | ❌ Restricted |
| **Platform Analytics** | ✅ Platform-wide | ❌ Restricted | ❌ Restricted |
| **Ledger Dashboard** | ❌ (Platform scope) | ✅ Own organization KPIs | ✅ Own organization KPIs |
| **Leads & 1-Click Deal Conversion** | ❌ (Platform scope) | ✅ Full access | ✅ Full access |
| **Deals Kanban (Drag-and-Drop)** | ❌ (Platform scope) | ✅ Full access | ✅ Full access |
| **Contacts Address Book** | ❌ (Platform scope) | ✅ Full access | ✅ Full access |
| **Financial Transactions** | ❌ (Platform scope) | ✅ Full access | ✅ Full access |
| **Team & Seating Capacity** | ❌ (Platform scope) | ✅ User seating & limits | ❌ Restricted |

---

## 5. Backend CORS Settings

The FastAPI backend includes `CORSMiddleware` in `app/main.py`. Ensure your frontend origin (`http://localhost:3000` by default) is listed in `settings.CORS_ALLOWED_ORIGINS`:

```python
# app/core/config.py
CORS_ALLOWED_ORIGINS: List[str] = [
    "http://localhost:3000",
    "http://localhost:8000",
]
```
If hosting on a remote domain or production Vercel/Netlify URL, update `CORS_ALLOWED_ORIGINS` in your backend `.env`:
```env
CORS_ALLOWED_ORIGINS=["https://crm.yourdomain.com", "http://localhost:3000"]
```
