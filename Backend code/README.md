# 🌾 Farmer Slot Booking System — FastAPI Backend
**Smart India Hackathon (SIH Problem Statement 260321)**

A production-grade, secure, and performant REST API backend built with **FastAPI**, **SQLAlchemy ORM**, **Pydantic v2**, and **PyJWT**.

---

## 🚀 Key Features

1. **Transactional Slot Capacity & Overbooking Prevention**: Prevents concurrent double-booking of the last available slot using database-level locking and validation.
2. **Dynamic Live Queue System**: Calculates real-time queue position, farmers ahead, estimated waiting time, and triggers automated push/in-app notifications.
3. **End-to-End Procurement Lifecycle**: Supports 7 progressive milestones:
   - `0: Booking Confirmed` → `1: Arrived at Center` → `2: Weighing` → `3: Quality Check` → `4: Procurement Completed` → `5: Payment Processing` → `6: Payment Completed`
4. **Direct Benefit Transfer (DBT) & PFMS Simulation**: Generates payment records, simulated bank transaction IDs, and receipt downloads.
5. **Digital Gate Pass**: Generates verifiable QR code payload containing encrypted booking ID, queue number, and center info.
6. **Multi-Role Security**: Token-based JWT authentication with role isolation for `farmer` and `admin` procurement officers.
7. **Instant Demo Accounts**: One-click demo authentication for judges to test both Farmer and Admin flows without manual sign-up.

---

## 🛠️ Tech Stack

- **Framework**: FastAPI (Python 3.10+)
- **ORM**: SQLAlchemy 2.0
- **Validation**: Pydantic v2
- **Authentication**: JWT (HS256) + PBKDF2-HMAC-SHA256 password hashing
- **Database**: SQLite (default zero-configuration dev) / PostgreSQL (production-ready)
- **API Documentation**: OpenAPI / Swagger UI (`/docs`) and ReDoc (`/redoc`)

---

## 📦 Directory Structure

```
Backend code/
├── .env.example            # Environment variables template
├── requirements.txt        # Python dependencies
├── database.py             # SQLAlchemy engine & session dependency
├── models.py               # Database schemas (Farmer, Mandi, Crop, Slot, Booking, Payment, Notification)
├── schemas.py              # Pydantic request & response models
├── auth.py                 # JWT token creation & password hashing
├── dependencies.py         # Auth token & role dependencies
├── crud.py                 # Core business logic & database transactions
├── seed.py                 # Realistic dataset seeder
├── main.py                 # FastAPI application & router bindings
├── routers/
│   ├── auth.py             # Registration, Login, Demo Login, OTP
│   ├── farmers.py          # Profile management
│   ├── mandis.py           # Procurement centers & distance calculation
│   ├── crops.py            # MSP crop catalog
│   ├── slots.py            # Real-time slot availability & calendar
│   ├── bookings.py         # Slot booking, cancellation, pass, tracking
│   ├── payments.py         # DBT payments & PFMS simulation
│   ├── notifications.py    # In-app notifications & read toggles
│   └── admin.py            # Officer dashboard & Call Next Farmer queue control
└── README.md
```

---

## ⚡ Quick Start

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Run Database Seeder
```bash
python seed.py
```

### 3. Start the Server
```bash
python main.py
# or
uvicorn main:app --reload --port 8000
```

The API will be available at `http://127.0.0.1:8000`.

---

## 📚 API Endpoints Reference

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register new farmer profile |
| `POST` | `/api/auth/login` | Login with mobile and password |
| `POST` | `/api/auth/demo-login` | 1-Click Demo Login (`farmer` / `admin`) |
| `POST` | `/api/auth/otp-login` | Simulated OTP login |
| `GET` | `/api/farmers/me` | Get logged-in farmer profile |
| `PATCH` | `/api/farmers/me` | Update farmer profile / language |
| `GET` | `/api/mandis` | Search procurement centers (supports lat/lon) |
| `GET` | `/api/crops` | List crops with official MSP rates |
| `GET` | `/api/slots/availability` | 7-day calendar availability count |
| `GET` | `/api/slots` | Time slots for a specific center & date |
| `POST` | `/api/bookings` | Book procurement slot (Capacity checked) |
| `GET` | `/api/bookings` | List farmer bookings with status filters |
| `GET` | `/api/bookings/{id}` | Live queue position & wait time |
| `PATCH` | `/api/bookings/{id}/cancel` | Cancel upcoming booking & free capacity |
| `GET` | `/api/bookings/{id}/pass` | Digital Gate Pass with QR payload |
| `GET` | `/api/payments` | Farmer payment history |
| `POST` | `/api/payments/{id}/clear` | Instant DBT payment clearance |
| `GET` | `/api/notifications` | Farmer notifications list |
| `GET` | `/api/admin/dashboard` | Admin center overview metrics |
| `GET` | `/api/admin/queue` | Admin today's live queue |
| `POST` | `/api/admin/call-next` | Advance live serving queue & notify farmers |
| `PATCH` | `/api/admin/bookings/{id}/advance` | Officer milestone stage advance |

---

## 🔒 Switching to PostgreSQL for Production

Set the `DATABASE_URL` environment variable:
```bash
export DATABASE_URL="postgresql://user:password@localhost:5432/farmer_procurement_db"
```
And install the postgres driver: `pip install psycopg2-binary`.
