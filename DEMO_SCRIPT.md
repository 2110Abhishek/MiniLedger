# 🎬 MiniLedger — 2–3 Minute Video Demonstration Script

**Target Duration:** 2 minutes 30 seconds – 2 minutes 50 seconds  
**Platforms to Record:** Browser window (`http://localhost:8082` or `http://localhost:8081`) + Terminal window (showing backend logs)  
**Recommended Screen Setup:** Split-screen (Left half: Browser app | Right half: Backend terminal) or full screen with seamless switching (`Alt + Tab`).

---

## ⏱️ Timeline Overview

| Time | Segment | Main Focus |
|---|---|---|
| **0:00 – 0:25** | Introduction | Problem statement, MiniLedger vision, tech stack |
| **0:25 – 0:50** | Authentication | Enter phone number, show mock OTP banner in server terminal |
| **0:50 – 1:10** | OTP Verification | Enter 6-digit code, JWT issuance, open dashboard |
| **1:10 – 1:40** | Create Overdue Loan | Add loan with past date (₹5,000), show instant overdue highlight |
| **1:40 – 2:05** | Create Active Loan | Add future loan (₹3,000), show updated summary calculations |
| **2:05 – 2:30** | Mark Loan as Repaid | Confirmation modal, status change to Repaid, overdue drops to ₹0 |
| **2:30 – 2:45** | Codebase & Tests | Show test suite (35/35 passing) & conclusion |

---

## 🎙️ Detailed Scene-by-Scene Script

---

### Segment 1: Introduction (0:00 – 0:25)

**Visual:**
- Start with the MiniLedger Login screen open on the browser at `http://localhost:8082`.
- Show the clean Cyber palette (deep space black, electric blue branding, Indian flag `+91` selector).

**Voiceover (Word-for-Word):**
> *"Hello everyone! Welcome to the demonstration of **MiniLedger**, a personal lending tracker application designed to solve a very common problem: tracking informal loans lent to friends, relatives, and colleagues.*
>
> *People often forget who owes how much and when repayments are due. MiniLedger provides a streamlined, transparent mobile experience backed by **React Native Expo**, **Node.js Express with TypeScript**, and **PostgreSQL with Prisma ORM**.*
>
> *Let's jump right in and see the full end-to-end workflow in action!"*

---

### Segment 2: Phone Authentication & Mock OTP (0:25 – 0:50)

**Visual:**
- Focus on the phone number input box.
- Type in a phone number: `9876543210`.
- Click the blue **"Continue with Phone →"** button.
- Immediately switch or pan over to the **Backend Terminal window**.
- Highlight the prominent visual OTP banner printed in the terminal:
  ```text
  ══════════════════════════════════════════════════════
  ║ 🔑 [DEV ONLY] MOCK OTP AUTHENTICATION CODE        ║
  ══════════════════════════════════════════════════════
  ║ Phone Number : +919876543210                      ║
  ║ OTP Code     : 382914 (valid for 300s)           ║
  ║ Notice       : Enter this code on the verify screen ║
  ══════════════════════════════════════════════════════
  ```

**Voiceover (Word-for-Word):**
> *"MiniLedger implements passwordless mobile authentication. I'll enter a 10-digit Indian mobile number—for example, `98765 43210`—and click 'Continue'.*
>
> *As per the PRD specification for this assignment, OTP delivery is securely simulated on the backend. Looking at our server terminal, we see a clean, developer-friendly banner displaying our server-generated 6-digit OTP code.*
>
> *Notice that for security, the API never returns this OTP in HTTP responses, and it's stored in PostgreSQL only after cryptographic salted SHA-256 hashing with a 5-minute expiry."*

---

### Segment 3: Verification & Dashboard Load (0:50 – 1:10)

**Visual:**
- Switch back to the browser on the OTP Verification screen.
- Enter the 6-digit code read from the terminal (e.g. `382914`).
- Click **"Verify & Sign In ✓"**.
- The dashboard immediately renders with the 4 summary cards, greetings, and filter pills.

**Voiceover (Word-for-Word):**
> *"Now, we enter that 6-digit code into the verification screen and click 'Verify & Sign In'.*
>
> *The backend validates the hash, confirms it hasn't expired or been used previously, and issues a signed JWT access token stored securely on the client.*
>
> *We are now on the main dashboard. Notice our 4 real-time summary cards: **Total Lent**, **Total Repaid**, **Outstanding**, and **Overdue Amount**, currently clean at zero."*

---

### Segment 4: Create an Overdue Loan (1:10 – 1:40)

**Visual:**
- Click the **"+ Add Loan"** button in the top right.
- In the Add Loan form:
  - Friend Name: Type `Rahul Sharma`
  - Amount: Type `5000`
  - Due Date: Click the quick preset button **"-7 Days (Overdue)"** (or select a past date).
  - *(Optional)* Briefly point to the "Select Receipt Photo" picker.
- Click **"Save Loan Entry ✓"**.
- Watch the dashboard refresh:
  - The loan card for Rahul appears framed in **glowing Neon Red** with a **`⚠️ OVERDUE`** badge.
  - **Total Lent:** `₹5,000.00`
  - **Outstanding:** `₹5,000.00`
  - **Overdue Amount:** **`₹5,000.00`** (highlighted in glowing Neon Red).

**Voiceover (Word-for-Word):**
> *"Let's record our first loan. A friend, Rahul, borrowed ₹5,000 last week and missed his due date. We click '+ Add Loan', enter 'Rahul Sharma', enter 5000 for the amount, and tap the quick preset '-7 Days' to record a past-due date.*
>
> *We click 'Save Loan Entry'.*
>
> *Immediately, our financial engine calculates the state. Because the due date has passed and the loan is unpaid, it is automatically flagged as **OVERDUE**. Notice the visual distinction: a high-contrast glowing neon red border and warning badge, with our Overdue Amount card updating to ₹5,000."*

---

### Segment 5: Create an Active / Outstanding Loan (1:40 – 2:05)

**Visual:**
- Click **"+ Add Loan"** again.
- In the form:
  - Friend Name: Type `Priya Patel`
  - Amount: Type `3000`
  - Due Date: Click the preset **"+15 Days"** (future date).
- Click **"Save Loan Entry ✓"**.
- Show the updated dashboard:
  - Priya's card shows **`⏳ OUTSTANDING`** in cyber blue.
  - **Total Lent:** `₹8,000.00` (₹5,000 + ₹3,000)
  - **Outstanding:** `₹8,000.00`
  - **Overdue Amount:** remains `₹5,000.00` (Rahul only).

**Voiceover (Word-for-Word):**
> *"Next, let's record another loan to Priya for ₹3,000, due in 15 days. We click 'Save'.*
>
> *Looking at our summary calculations: Total Lent is now ₹8,000; Total Outstanding is ₹8,000; but our Overdue Amount remains strictly ₹5,000 because Priya's loan is not overdue. All monetary math uses PostgreSQL `NUMERIC` to guarantee zero floating-point rounding errors."*

---

### Segment 6: Mark as Repaid & Real-Time Sync (2:05 – 2:30)

**Visual:**
- Scroll to Rahul's card.
- Click the green button **"Mark as Repaid ✓"**.
- Show the confirmation dialog: *"Are you sure you want to mark the loan of ₹5,000.00 to Rahul Sharma as fully settled?"*
- Click **"Yes, Mark Repaid"**.
- Watch the dashboard immediately update in real time:
  - Rahul's card switches to emerald **`✓ REPAID`** with the server-generated repayment date.
  - The "Mark as Repaid" button disappears (idempotent, preventing double-repayment).
  - Summary figures:
    - **Total Lent:** `₹8,000.00`
    - **Total Repaid:** `₹5,000.00`
    - **Outstanding Amount:** `₹3,000.00`
    - **Overdue Amount:** **`₹0.00`**!
- Click the filter tabs: **`Outstanding`** (shows Priya), **`✓ Repaid`** (shows Rahul), **`All Loans`**.

**Voiceover (Word-for-Word):**
> *"Rahul has now repaid us in full. We click 'Mark as Repaid'. A confirmation modal ensures no accidental clicks.*
>
> *We confirm the action. The server validates ownership, records the timestamp, and transitions the state. Rahul's status is now 'REPAID'.*
>
> *Look at our summary cards: Total Repaid increases to ₹5,000; Outstanding drops to ₹3,000; and Overdue Amount drops to exactly **₹0.00**, because repaid loans can never be overdue.*
>
> *We can also use the filter tabs—Outstanding, Overdue, and Repaid—to filter our records effortlessly."*

---

### Segment 7: Codebase, Automated Tests & Wrap-Up (2:30 – 2:45)

**Visual:**
- Switch to the terminal.
- Run `npm test` in `backend` to show the test results:
  ```text
  ✓ tests/unit/otp.test.ts (2 tests)
  ✓ tests/unit/validation.test.ts (9 tests)
  ✓ tests/unit/calculations.test.ts (2 tests)
  ✓ tests/integration/api.test.ts (18 tests)
  Test Files 4 passed (4) | Tests 31 passed (31)
  ```
- Briefly show the clean project folder structure and the comprehensive `README.md`.

**Voiceover (Word-for-Word):**
> *"Behind the scenes, MiniLedger is backed by 35 comprehensive automated tests covering pure calculation rules, phone and input validation, and full Supertest API integration against live PostgreSQL with strict user data isolation.*
>
> *The entire codebase is clean, fully typed with TypeScript, and thoroughly documented in the repository README.*
>
> *Thank you for watching the MiniLedger demonstration!"*

---

## 💡 Quick Tips for a Flawless Recording

1. **Resolution:** Set browser zoom to 100% or 110% at 1080p (1920x1080) for crisp typography.
2. **Audio:** Speak with clear pacing; pause 1 second between clicks to allow the UI transition to breathe.
3. **Clean Terminal:** Clear your backend terminal (`cls` or `clear`) before starting so the mock OTP banner is the first thing in view when you switch.
4. **Tool of Choice:** You can record using **Loom**, **OBS Studio**, or Windows Game Bar (`Win + Alt + R`).
