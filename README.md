# 🏥 MedFlow — Clinic Management Web App

**MedFlow** is a modern web application for clinic management.  
It includes a public landing page presenting the MedFlow service, and a private Super Admin login page that connects to a backend API.

Each clinic will later have its own space (accessible by subdomain), but the base app already includes:
- 🌐 Landing page with MedFlow presentation
- 🔐 Super Admin login (connected to the backend)
- ⚛️ React + TailwindCSS + Vite setup with routing

---

## 🧠 Tech Stack

- **Frontend:** React + Vite  
- **Styling:** TailwindCSS  
- **Routing:** React Router DOM  
- **Backend API:** Django (separate repository)

➡️ Backend repository: [MedFlow Backend](https://github.com/DorraBenMimoun/MedFlowBackend)

---

## ⚙️ Getting Started

### 1️⃣ Clone the repository
```bash
git clone https://github.com/Mondherlol/MedFlow.git
cd MedFlow
```

### 2️⃣ Install dependencies
```bash
npm install
```

### 3️⃣ Start the development server
```bash
npm run dev
```

The app will be available at:
```
http://localhost:5173
```

---

## 🧪 Testing subdomains locally

You can test the multi-clinic setup using **lvh.me**, which points all subdomains to `127.0.0.1`.

Example:
```
http://clinic1.lvh.me:5173
```

---

## 📂 Project Structure

```
MedFlow/
├─ src/
│  ├─ pages/        → Landing & Users pages
│  ├─ components/   → Navbar, Footer, etc.
│  ├─ tenant.js     → Handles subdomain detection
│  └─ App.jsx       → Routes & structure
├─ index.html
├─ tailwind.config.js
└─ package.json
```

---

## 🧾 Available Pages

| Route | Description |
|-------|--------------|
| `/` | Landing page presenting MedFlow |
| `/__superadmin/login` | Super Admin login (connects to backend) |

---

## 🧑‍💻 Development Notes

- Make sure the **backend server** is running on port `9000` before testing the app.

---


> _MedFlow — Simplify clinic management with a clean and modern web interface._
