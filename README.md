# ⚡ Shortify — URL Shortener

A modern, fully local URL shortener with QR code generation, click analytics, and a clean dark UI. No backend, no database, no cloud — runs entirely in the browser using localStorage.

---

## 🚀 Features

- 🔗 **URL Shortening** — Generate short links instantly with custom or auto-generated codes
- 📱 **QR Code Generation** — Auto-generates a QR code for every shortened link
- 📊 **Click Analytics** — Track total clicks, device type (mobile/desktop), and location per link
- 🔐 **Local Authentication** — Signup/login stored in localStorage, no backend needed
- 🗑️ **Link Management** — Create, view, copy, download, and delete your links
- 💾 **Persistent Storage** — All data saved in browser localStorage, survives page refresh
- ⚡ **Zero Dependencies on Cloud** — No Supabase, no Firebase, no external APIs

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite |
| Styling | Tailwind CSS + Radix UI |
| Routing | React Router DOM |
| QR Code | react-qrcode-logo |
| Charts | Recharts |
| Storage | Browser localStorage |
| Auth | localStorage-based session |
| Icons | Lucide React |
| Fonts | Clash Display + Space Grotesk |

---

## 📦 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm

### Installation

```bash
# Clone the repository
git clone https://github.com/nag97/URL-SHORTENER.git

# Navigate to project directory
cd URL-SHORTENER

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── create-link.jsx  # Dialog for creating new short links
│   ├── link-card.jsx    # Dashboard link card component
│   ├── header.jsx       # Navigation header
│   ├── device-stats.jsx # Device analytics chart
│   └── location-stats.jsx # Location analytics chart
├── pages/               # Route pages
│   ├── landing.jsx      # Home/landing page
│   ├── auth.jsx         # Login & signup page
│   ├── dashboard.jsx    # User dashboard
│   ├── link.jsx         # Individual link details & analytics
│   └── redirect-link.jsx # Short URL redirect handler
├── db/                  # Data layer (localStorage-based)
│   ├── apiAuth.js       # Auth API wrapper
│   ├── apiUrls.js       # URL API wrapper
│   └── apiClicks.js     # Clicks/analytics API
├── lib/                 # Core logic
│   ├── localAuth.js     # Local authentication logic
│   └── localUrls.js     # Local URL storage logic
├── hooks/
│   └── use-fetch.js     # Custom async data fetching hook
├── context.jsx          # Global auth/user state context
└── layouts/
    └── app-layout.jsx   # Main app layout wrapper
```

---

## 🔄 App Flow

```
Landing Page
    │
    ▼
Enter Long URL → Click "Shorten Link"
    │
    ▼
Auth Page (Login / Signup)
    │
    ▼
Dashboard → Create Link Dialog
    │   • Fill title + URL + optional custom code
    │   • QR code auto-generates as you type
    │
    ▼
Link Created → Appears on Dashboard
    │
    ▼
Click Link Card → Link Details Page
    │   • View short URL, original URL, QR code
    │   • Copy, download QR, delete
    │   • Analytics: clicks, device, location
    │
    ▼
Visit Short URL (localhost:5173/:shortCode)
    │
    ▼
Redirect to Original URL + Click Tracked
```

---

## 💾 localStorage Schema

| Key | Description |
|-----|-------------|
| `users` | Array of registered user objects `{ id, email, password }` |
| `currentUser` | Currently logged in user object |
| `urls` | Array of shortened URL objects |
| `clicks` | Array of click event objects |

### URL Object Structure
```json
{
  "id": "1234567890",
  "userId": "user_id",
  "title": "My Link",
  "originalUrl": "https://very-long-url.com",
  "shortCode": "abc123",
  "createdAt": "2026-03-15T00:00:00.000Z",
  "clicks": 0,
  "qr": "data:image/png;base64,..."
}
```

### Click Object Structure
```json
{
  "id": "1234567890",
  "url_id": "url_id",
  "device": "mobile",
  "country": "Unknown",
  "createdAt": "2026-03-15T00:00:00.000Z"
}
```

---

## ⚠️ Limitations

- Data is stored in the **browser's localStorage** — clearing browser data will erase all links
- Links only work on the **same device and browser** they were created on
- Short URLs only redirect when the app is running locally (`localhost:5173`)
- No real geolocation — country is stored as "Unknown" (no IP lookup)
- Passwords are stored in plain text in localStorage (not for production use)

---

## 🗺️ Roadmap

- [ ] Add Express.js backend with SQLite for persistent storage
- [ ] Real geolocation via IP API
- [ ] Password hashing
- [ ] Link expiry dates
- [ ] Custom domain support
- [ ] Export analytics as CSV

---

## 🙏 Credits

- Original project inspired by [RoadsideCoder](https://www.youtube.com/@RoadsideCoder)
- Refactored to fully local storage by [@nag97](https://github.com/nag97)
- UI redesigned as **Shortify** — dark theme with green accents

---

## 📄 License

MIT License — free to use and modify.
