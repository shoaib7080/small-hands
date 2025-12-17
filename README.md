# Small Hands - Disaster Relief & Aid Platform 🤝

**Current Version:** v1.0.1  
**Status:** Production Stable

## 📖 Project Overview
Small Hands is a real-time MERN stack application designed to bridge the gap between citizens in distress and verified NGOs. It features live geospatial tracking, role-based access control, and a gamified reputation system.

---

## 🛡️ Security Architecture
We have implemented a multi-layered security approach to ensure data integrity and platform trust.

### 1. Authentication & Authorization
* **JWT Implementation:** Stateless authentication using JSON Web Tokens stored in LocalStorage (scheduled migration to httpOnly cookies in v2).
* **Bcrypt Hashing:** All passwords are salted and hashed (12 rounds) before storage.
* **Role-Based Middleware (`protect`, `restrictTo`):** * Strict middleware ensuring `reporters` cannot access NGO routes.
    * `admin` routes are isolated and require specific database flags.

### 2. Operational Security (Logic Locks)
* **Verification Gate:** NGOs cannot access the Live Console or claim cases until their `verification_status` is manually approved by an Admin.
* **Status Locking:**
    * Only the NGO that *claimed* a report can *resolve* it.
    * Users cannot edit reports once they are claimed.
* **Backend Validation:** All critical actions (Claim, Resolve) perform server-side checks for the user's verification status, preventing API bypass attacks via Postman/cURL.

### 3. Data Safety
* **Environment Variables:** All secrets (`MONGO_URI`, `JWT_SECRET`, `CLOUDINARY_KEYS`) are isolated in `.env` and never committed to version control.
* **CORS Whitelisting:** The backend only accepts requests from the specific Production Client URL.

---

## ⚡ Feature Specification

### 1. The Citizen Interface (Reporter)
* **Smart Login:** Single login form detects user role automatically (Reporter/NGO/Admin).
* **Geospatial Reporting:** Users can drop pins on a Leaflet map to report needs.
* **Evidence Upload:** Integration with **Cloudinary** for storing proof images.
* **Gamification:** * **Karma Points:** Awarded automatically when an NGO resolves their report.
    * **Badges:** Visual indicators of user reliability.

### 2. The NGO Console
* **Live Operations Map:** * Real-time "Red Pin" drops via **Socket.io** (no refresh needed).
    * Visual distinction between Open (Red) and Claimed (Green) cases.
* **Mobile-First Design:** Custom "Map vs List" toggle for field operations on mobile devices.
* **Resolution Workflow:** NGOs must upload "Proof of Work" photos to close a case and earn Impact Score.

### 3. The Super Admin Panel ("God Mode")
* **Dashboard Stats:** Live counters for Pending NGOs, Total Incidents, and Success Rates.
* **NGO Verification:** Workflow to view license docs and Approve/Reject organizations.
* **Manual Onboarding:** Admins can bypass verification to manually create trusted NGO accounts.
* **Content Moderation:** Ability to "Drill Down" into user history and ban spammers or delete offensive reports.

---

## 🛠️ Technical Stack & Dependencies

### Frontend (`/client`)
* **Core:** React.js (Vite), React Router v6
* **Styling:** Tailwind CSS v4 (with custom Leaflet overrides)
* **Mapping:** React-Leaflet, Leaflet CSS
* **State/Data:** Axios (Interceptors for Token Injection), SWR/UseEffect patterns
* **Forms:** React Hook Form + Zod (Schema Validation)

### Backend (`/server`)
* **Core:** Node.js, Express.js
* **Database:** MongoDB Atlas (Mongoose ODM)
* **Real-Time:** Socket.io (CORS configured for Prod)
* **Storage:** Multer + Cloudinary Storage Engine

---

## 🚀 Deployment Pipeline

### Production URLs
* **Frontend:** [Add Your Vercel Link Here]
* **Backend:** [Add Your Render Link Here]

### Environment Setup
The application requires the following variables in production:
```env
# Backend
PORT=5000
MONGO_URI=mongodb+srv://...
JWT_SECRET=complex_string
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
CLIENT_URL=[https://your-frontend.vercel.app](https://your-frontend.vercel.app)
📜 Version History
v1.0.1 - Fixed mobile map rendering issues and Leaflet/Tailwind CSS conflicts.

v1.0.0 - Initial Release (MVP).

🔮 Future Roadmap (v2.0)
SMS Authentication: OTP login for higher citizen accessibility.

Crowdfunding Module: Direct donation links for specific cases.

PWA Support: Offline capabilities for low-network zones.

# Frontend
VITE_API_URL=[https://your-backend.onrender.com/api](https://your-backend.onrender.com/api)
