# MiniLedger — Personal Lending Tracker

**MiniLedger** is a personal lending tracker mobile application built with React Native (Expo), TypeScript, Node.js, Express, PostgreSQL, and Prisma ORM. It enables users to record loans lent to friends and family, track repayment statuses, highlight overdue balances, and monitor a consolidated real-time financial summary.

---

## 📸 Key Features

- **Phone Number Authentication & Mock OTP:** Passwordless login using mobile phone numbers. The server generates a 6-digit one-time password (OTP), prints it in a terminal banner, and hashes it before storage. Expired, reused, or incorrect OTP attempts are rejected.
- **JWT-Protected API:** All lending endpoints enforce secure token-based authentication with strict per-user data isolation.
- **Real-Time Financial Dashboard:**
  - **Total Lent:** Principal amount across all loans created.
  - **Total Repaid:** Principal amount associated with loans marked as fully repaid.
  - **Outstanding Amount:** Remaining unpaid balance (`Total Lent - Total Repaid`).
  - **Overdue Amount:** Outstanding loans whose due dates precede the current date, highlighted with warning styling.
- **Loan Lifecycle Management:**
  - Record loans with friend's name, amount (₹), and due date (with quick preset selectors: +7d, +15d, +30d, or past overdue dates).
  - Filter loans by **All**, **Outstanding**, **Overdue**, and **Repaid**.
  - One-click **Mark as Repaid** with a confirmation dialog. Repaid loans cannot be repaid again (enforcing idempotency and 409 conflict checks).
- **Receipt Photo Attachment (Bonus Feature):** Attach and view receipts or promissory notes with loan records.
- **Automated Testing Suite:** 35 comprehensive automated tests (unit tests for financial calculations, validation, OTP hashing, and end-to-end Supertest integration tests against live PostgreSQL).

---

## 🛠 Technology Stack

### Backend
- **Runtime:** Node.js (v20+)
- **Framework:** Express.js (TypeScript)
- **Database:** PostgreSQL (with Prisma ORM)
- **Authentication:** JSON Web Tokens (`jsonwebtoken`)
- **Validation:** Zod schemas
- **File Uploads:** Multer
- **Testing:** Vitest & Supertest

### Mobile App
- **Framework:** React Native with Expo (TypeScript)
- **Target Platforms:** Android, iOS, and Web preview
- **Storage:** `@react-native-async-storage/async-storage`
- **Validation:** Zod schemas
- **Media Picker:** `expo-image-picker`

---

## 📂 Repository Structure

```text
MiniLedger/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma          # Database schema (User, Loan, OtpChallenge)
│   ├── src/
│   │   ├── config/                # Environment variables and config
│   │   ├── middleware/            # Auth, rate limiting, error handling, file upload
│   │   ├── modules/
│   │   │   ├── auth/              # Phone login, OTP generation & verification
│   │   │   ├── loans/             # Loan CRUD, repayment, receipt handling
│   │   │   └── summary/           # Financial summary calculations
│   │   ├── utils/                 # Prisma singleton, OTP hasher, custom errors
│   │   ├── app.ts                 # Express app configuration & middleware
│   │   └── server.ts              # Server bootstrap and terminal banners
│   ├── tests/
│   │   ├── unit/                  # Unit tests (calculations, validation, OTP)
│   │   └── integration/           # Integration tests against PostgreSQL
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
├── mobile/
│   ├── src/
│   │   ├── components/            # Header, SummaryCards, LoanCard, RepayModal, ReceiptModal
│   │   ├── screens/               # LoginScreen, OtpScreen, DashboardScreen, AddLoanScreen
│   │   ├── services/              # API client, auth service, loans service
│   │   └── types/                 # Shared TypeScript interfaces
│   ├── tests/                     # Mobile client formatting & status tests
│   ├── App.tsx                    # Main application root and navigation controller
│   ├── app.json                   # Expo configuration
│   ├── package.json
│   └── tsconfig.json
└── README.md
```

---

## ⚙️ Prerequisites

1. **Node.js** (v18 or higher recommended; v20+ used)
2. **npm** (v9+)
3. **PostgreSQL** (either via standard local install, Docker, or using the repository's built-in zero-config database runner)

---

## 🚀 Quick Start & Setup Instructions

### 1. Database Setup

#### Option A: Zero-Config Built-in PostgreSQL (Recommended for Fast Local Evaluation)
The backend includes a zero-config PostgreSQL daemon:
```bash
cd backend
npm run db:start
```
This runs a PostgreSQL server locally on `localhost:5432` with data persisted to `backend/pgdata`.

#### Option B: Standard PostgreSQL / Docker
If you prefer running your own local PostgreSQL instance or Docker container:
```bash
docker run --name miniledger-postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:16
```
Ensure your database connection string matches your credentials in `backend/.env`.

---

### 2. Backend Setup & Startup

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   *Default `.env` configuration:*
   ```dotenv
   PORT=4000
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/postgres?sslmode=disable"
   JWT_SECRET="miniledger-super-secure-jwt-secret-key-2026-prd-ready"
   JWT_EXPIRES_IN="7d"
   OTP_EXPIRY_SECONDS=300
   NODE_ENV="development"
   ```

4. **Synchronize the database schema with Prisma:**
   ```bash
   npm run prisma:generate
   npm run prisma:push
   ```

5. **Start the development server:**
   ```bash
   npm run dev
   ```
   The backend API will start at: `http://localhost:4000/api`  
   Health check: `http://localhost:4000/api/health`

---

### 3. Mobile App Setup & Startup

1. **Open a new terminal window and navigate to `mobile`:**
   ```bash
   cd mobile
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the Expo application:**
   - **For Web Browser:**
     ```bash
     npm run web
     ```
     Open `http://localhost:8081` in your browser.
   - **For Android Emulator / Device:**
     ```bash
     npm run android
     ```
   - **For iOS Simulator / Expo Go:**
     ```bash
     npm run ios
     ```

---

## 🔑 Mock OTP Authentication Flow

1. On the login screen, enter any valid 10-digit Indian phone number (e.g., `9876543210`).
2. Click **Continue with Phone →**.
3. Inspect your **backend terminal window**. You will see a prominent visual banner:
   ```text
   ══════════════════════════════════════════════════════
   ║ 🔑 [DEV ONLY] MOCK OTP AUTHENTICATION CODE        ║
   ══════════════════════════════════════════════════════
   ║ Phone Number : +919876543210                      ║
   ║ OTP Code     : 382914 (valid for 300s)           ║
   ║ Notice       : Enter this code on the verify screen ║
   ══════════════════════════════════════════════════════
   ```
4. Enter the 6-digit code on the OTP screen and tap **Verify & Sign In ✓**.
5. Once authenticated, your JWT token is securely stored and the dashboard loads automatically.

---

## 🧪 Running Automated Tests

### Backend Tests (Unit + Integration against Live PostgreSQL)
```bash
cd backend
npm test
```
*Runs all 31 backend tests:*
- `tests/unit/validation.test.ts`: Phone normalization, amount precision, date formats.
- `tests/unit/otp.test.ts`: 6-digit generation, SHA-256 hashing, timing-safe checks.
- `tests/unit/calculations.test.ts`: Formula verifications matching Section 5 PRD rules.
- `tests/integration/api.test.ts`: End-to-end API tests covering auth, JWT protection, loan creation, user isolation, duplicate repayment rejection, and summary updates.

### Mobile App Tests
```bash
cd mobile
npm test
```
*Runs mobile utility and calculation tests verifying currency formatting and loan lifecycle presentation.*

---

## 📑 API Endpoint Documentation

All endpoints are prefixed with `/api`. Protected routes require `Authorization: Bearer <token>`.

### Authentication Endpoints

#### 1. Generate Mock OTP
- **Endpoint:** `POST /api/auth/send-otp`
- **Request Body:**
  ```json
  {
    "phoneNumber": "+919876543210"
  }
  ```
- **Response (`200 OK`):**
  ```json
  {
    "message": "OTP generated successfully",
    "expiresIn": 300
  }
  ```
  *(Note: The OTP is intentionally withheld from the response body and logged exclusively to the server terminal).*

#### 2. Verify OTP & Issue Token
- **Endpoint:** `POST /api/auth/verify-otp`
- **Request Body:**
  ```json
  {
    "phoneNumber": "+919876543210",
    "otp": "382914"
  }
  ```
- **Response (`200 OK`):**
  ```json
  {
    "accessToken": "eyJhbGciOi...",
    "tokenType": "Bearer",
    "user": {
      "id": "c7a840e6-a81d-403d-82d8-21d96b3d4f10",
      "phoneNumber": "+919876543210"
    }
  }
  ```

---

### Loan Endpoints (Authenticated)

#### 3. Create Loan
- **Endpoint:** `POST /api/loans`
- **Request Body:**
  ```json
  {
    "friendName": "Rahul Sharma",
    "amount": "5000.00",
    "dueDate": "2026-11-15",
    "receiptUrl": "/uploads/receipt-example.jpg"
  }
  ```
- **Response (`201 Created`):**
  ```json
  {
    "id": "e45b85a1-7788-466d-9781-897db2f16acb",
    "userId": "c7a840e6-a81d-403d-82d8-21d96b3d4f10",
    "friendName": "Rahul Sharma",
    "amount": "5000.00",
    "dueDate": "2026-11-15",
    "isRepaid": false,
    "repaidAt": null,
    "status": "outstanding",
    "isOverdue": false,
    "receiptUrl": "/uploads/receipt-example.jpg",
    "createdAt": "2026-10-22T17:30:00.000Z",
    "updatedAt": "2026-10-22T17:30:00.000Z"
  }
  ```

#### 4. List Loans
- **Endpoint:** `GET /api/loans?status=all`
- **Query Filters:** `status=all` | `status=outstanding` | `status=overdue` | `status=repaid`
- **Response (`200 OK`):** Array of serialized loans scoped strictly to the authenticated user.

#### 5. Mark Loan as Repaid
- **Endpoint:** `PATCH /api/loans/:id/repay`
- **Response (`200 OK`):** Returns the loan with `isRepaid: true`, `status: "repaid"`, and `repaidAt` timestamp.
- **Error (`409 Conflict`):** If the loan has already been marked as repaid.

#### 6. Summary Figures
- **Endpoint:** `GET /api/summary`
- **Response (`200 OK`):**
  ```json
  {
    "totalLent": "10000.00",
    "totalRepaid": "2000.00",
    "outstandingAmount": "8000.00",
    "overdueAmount": "5000.00",
    "currency": "INR"
  }
  ```

#### 7. Upload Receipt Photo (Bonus)
- **Endpoint:** `POST /api/loans/upload-receipt`
- **Form Data:** `receipt` (Image file: JPEG, PNG, WEBP, max 5MB)
- **Response (`201 Created`):**
  ```json
  {
    "receiptUrl": "/uploads/receipt-1729600000000-123456789.jpg"
  }
  ```

---

## 🛡️ Security & Reliability Architecture

- **Data Isolation:** Every database query filters by `userId` extracted directly from the verified JWT payload. Users cannot read, modify, or repay another user's loan entries.
- **One-Time Expiring OTPs:** OTPs are hashed using SHA-256 with a unique salt. They expire after 300 seconds, support a maximum of 5 incorrect attempts before lockout, and are invalidated immediately upon first successful use.
- **Rate Limiting:** Protects the authentication endpoints against brute-force attacks via `express-rate-limit`.
- **Accurate Financial Calculations:** All monetary figures use PostgreSQL `NUMERIC(12,2)` rather than floating-point values to eliminate rounding inaccuracies.
- **Consistent Overdue Evaluation:** Overdue status is determined using a consistent server calendar date rule (`dueDate < today`). Loans due today are considered outstanding, not overdue. Repaid loans are never classified as overdue.

---

## 📹 Demonstration Flow (Walkthrough)

1. **Start Backend & Database:**  
   Backend starts up with PostgreSQL database synced.
2. **Launch Application:**  
   The application displays the MiniLedger sign-in screen.
3. **Phone Authentication:**  
   Enter phone number `9876543210` → Backend terminal prints the mock OTP → Enter OTP on mobile screen → Dashboard opens.
4. **Create Overdue Loan:**  
   Add a loan to "Rahul" for ₹5,000 with a past due date. The entry is highlighted with a crimson border, warning badge, and increases Total Lent (₹5,000) and Overdue Amount (₹5,000).
5. **Create Active Loan:**  
   Add a loan to "Priya" for ₹3,000 with a future due date. Total Lent becomes ₹8,000; Outstanding becomes ₹8,000; Overdue remains ₹5,000.
6. **Repay Loan:**  
   Tap **Mark as Repaid** on Rahul's loan and confirm in dialog. Rahul's loan changes to emerald "Repaid". Summary updates in real time: Total Lent = ₹8,000, Total Repaid = ₹5,000, Outstanding = ₹3,000, Overdue = ₹0.00.
7. **Session Persistence:**  
   Refresh/reopen the app; user remains authenticated and data persists in PostgreSQL.

---

## 📄 License
ISC
