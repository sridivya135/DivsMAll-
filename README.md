# Div's Mall — Shopping Mall Management System

A full-stack implementation of the attached PRD: **React + Django REST Framework + MySQL**, with JWT authentication, role-based access, transactional order processing, automatic stock updates, and printable invoices.

---

## 1. What is implemented

| PRD area | Status | Notes |
| --- | --- | --- |
| Product CRUD | ✅ | Add, view, search (ID/name/category/brand), update, **soft delete** |
| Customer management | ✅ | Register, view, search, update |
| Orders | ✅ | Multi-product orders, backend-calculated totals, stock validation |
| Stock management | ✅ | Row-locked, atomic stock decrement; inactive products cannot be ordered |
| Billing | ✅ | JSON invoice + printable/downloadable HTML (`?export=html`) |
| Dashboard | ✅ | Counts, today's revenue, recent orders, low stock, sales/category/status summaries |
| Auth & roles | ✅ | JWT access/refresh, refresh blacklist on logout, admin/staff permissions |
| MySQL | ✅ | Default backend; SQLite supported for local dev/tests |
| Security | ✅ | Hashed passwords, env-based secrets, CORS allowlist, throttling, validated uploads, security headers |

### Key design decisions
- **Registration is admin-only.** The PRD lists a `/api/auth/register/` endpoint, but public self-registration would let anyone create staff accounts. Administrators create users and assign roles.
- **Staff can view/search products but cannot create, edit, or delete them.** Staff can register customers, place orders, view orders, and generate bills.
- **Soft delete** (`is_active = False`) keeps historical orders consistent. Product names are unique case-insensitively.
- **Order totals, discount/tax handling, and stock writes happen only in the backend** inside a single `transaction.atomic()` block with `select_for_update()` row locks.
- Order items snapshot product name and unit price, so later catalogue changes never rewrite history.

---

## 2. Project structure

```
.
├── backend/
│   ├── config/                 # settings, urls, wsgi, asgi
│   ├── apps/
│   │   ├── common/             # pagination, permissions, error handling
│   │   ├── users/              # custom user, JWT auth, roles
│   │   ├── products/           # catalogue, soft delete, search
│   │   ├── customers/          # customer records
│   │   ├── orders/             # order models, transactional service, API
│   │   ├── billing/            # invoice builder + HTML template
│   │   └── dashboard/          # summary endpoint
│   ├── templates/billing/      # printable invoice template
│   ├── manage.py
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   └── src/
│       ├── components/         # layout, nav, tables, forms, dialogs
│       ├── context/            # AuthContext
│       ├── pages/              # Login, Dashboard, Products, Customers, Orders, Bill…
│       ├── services/api.js     # axios client + all endpoint helpers
│       └── utils/format.js
├── docker-compose.yml          # optional local MySQL
└── README.md
```

---

## 3. Quick start (Windows commands shown; macOS/Linux are equivalent)

### 3.1 Backend

```powershell
cd backend
py -3.12 -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
Copy-Item .env.example .env        # already provided for local dev (SQLite)
.\.venv\Scripts\python.exe manage.py migrate
.\.venv\Scripts\python.exe manage.py seed_demo
.\.venv\Scripts\python.exe manage.py runserver
```

The included `backend/.env` uses **SQLite** and debug mode so the app runs immediately. Demo logins after seeding:

- `admin` / `DemoPass123!` — full access
- `staff` / `DemoPass123!` — sales/order access

Generate a strong secret for any non-local deployment:

```powershell
.\.venv\Scripts\python.exe -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

### 3.2 Frontend

```powershell
cd frontend
npm install
npm run dev
```

Open <http://localhost:5173>. `frontend/.env` points at `http://127.0.0.1:8000/api`; alternatively set `VITE_API_BASE_URL=/api` and use the Vite proxy configured in `vite.config.js`.

### 3.3 Using MySQL instead of SQLite

```powershell
docker compose up -d mysql
```

Then in `backend/.env`:

```dotenv
USE_SQLITE=false
DB_NAME=divs_mall
DB_USER=divs_user
DB_PASSWORD=divs_password
DB_HOST=127.0.0.1
DB_PORT=3306
```

Re-run `manage.py migrate` and `manage.py seed_demo`. MySQL 8+ is recommended (the schema uses `utf8mb4` and case-insensitive unique indexes).

---

## 4. API reference

All endpoints except login/health require `Authorization: Bearer <access_token>`.

| Method | Endpoint | Access | Purpose |
| --- | --- | --- | --- |
| POST | `/api/auth/login/` | Public | Username/email + password → access & refresh tokens |
| POST | `/api/auth/logout/` | Auth | Blacklist a refresh token |
| POST | `/api/auth/register/` | Admin | Create an admin/staff account |
| GET / PATCH | `/api/auth/me/` | Auth | Read/update own profile (no role escalation) |
| GET / POST | `/api/products/` | Auth / Admin | List/search / create |
| GET / PUT / DELETE | `/api/products/{id}/` | Auth / Admin | Detail / update / soft delete |
| GET / POST | `/api/customers/` | Auth / Staff | List/search / register |
| GET / PUT | `/api/customers/{id}/` | Auth / Staff | Detail / update |
| GET / POST | `/api/orders/` | Auth / Staff | List/filter / place order |
| GET | `/api/orders/{id}/` | Auth / Staff | Order detail with items |
| GET | `/api/orders/{id}/bill/` | Auth / Staff | Invoice JSON; add `?export=html` for print-ready HTML |
| GET | `/api/dashboard/` | Auth / Staff | Dashboard summary |

Useful query parameters: `search`, `category`, `brand`, `min_price`, `max_price`, `include_inactive=true`, `status`, `payment_status`, `date_from`, `date_to`, `ordering`, `page`, `page_size` (max 100).

Example order payload:

```json
{
  "customer": 1,
  "items": [{ "product": 1, "quantity": 2 }, { "product": 3, "quantity": 1 }],
  "discount": "100.00",
  "tax": "90.00",
  "payment_status": "paid"
}
```

Error messages follow the PRD, e.g. `Product not found.`, `Customer not found.`, `Quantity must be greater than 0.`, `Insufficient stock available.`, `Invalid username or password.`

---

## 5. Tests

```powershell
cd backend
.\.venv\Scripts\python.exe manage.py test -v 2
```

The suite covers authentication/permissions, product validation and soft deletion, search, transactional stock handling, totals, bill generation, and PRD error messages. Tests automatically use SQLite.

Frontend production build:

```powershell
cd frontend
npm run build
```

---

## 6. Security notes

- Passwords are hashed with Django's PBKDF2 hasher; no plain-text credentials in code.
- Secrets and database credentials come from environment variables (`.env` is gitignored).
- JWT refresh tokens are rotated and blacklisted on logout; access tokens expire after 60 minutes.
- All mutations validate server-side; role permissions are enforced on every protected endpoint (UI hiding is only cosmetic).
- Orders use database transactions and row locks so stock can never go negative or be sold twice.
- Django ORM prevents SQL injection; React escapes rendered content; uploaded images are type/size checked.
- CORS is limited to configured origins; login is rate-limited; security headers (nosniff, referrer policy, frame denial, optional HSTS/SSL redirect) are configured.
- Access/refresh tokens are kept in `localStorage` (simple SPA setup). For higher XSS resilience, migrate to httpOnly, secure, SameSite cookies and add CSRF protection.
- In production set `DJANGO_DEBUG=false`, a strong `DJANGO_SECRET_KEY`, correct `DJANGO_ALLOWED_HOSTS`, `SECURE_SSL_REDIRECT=true`, `COOKIE_SECURE=true`, and serve static files with a proper WSGI server (e.g. gunicorn/uwsgi).

---

## 7. Roadmap (PRD Phase 3)

PDF-native invoices, sales charts, low-stock alerts/notifications, dedicated categories table, and payment tracking can be added on top of the current schema without breaking existing APIs.
