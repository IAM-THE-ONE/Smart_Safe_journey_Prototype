# Smart_Safe_Journey_Prototype

**AI-Powered Smart Tourism Safety & Incident Response Platform**

SafeVoyage AI is a full-stack web application designed to improve tourist safety using AI, real-time monitoring, geolocation, and digital identity management.

---

## Credentials & Tokens Setup

Before running the app, you need to set up the following credentials in your `.env` files:

### 1. Google OAuth Client ID (for Google Sign-In)

**Files: `frontend/.env` and `backend/.env`**
```
# frontend/.env
VITE_GOOGLE_CLIENT_ID=your-client-id

# backend/.env
GOOGLE_CLIENT_ID=your-client-id
```

| Step | Action |
|------|--------|
| 1 | Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials) |
| 2 | Create a new project or select existing one |
| 3 | Go to **APIs & Services → Credentials** |
| 4 | Click **Create Credentials → OAuth 2.0 Client ID** |
| 5 | Choose **Web application** |
| 6 | Under **Authorized JavaScript origins**, add `http://localhost:5173` |
| 7 | Copy the **Client ID** and paste it in **both** `frontend/.env` and `backend/.env` |

### 2. Django Secret Key

**File: `backend/.env`**
```
SECRET_KEY=your-secret-key
```

Generate one with:
```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

### 3. Gemini API Key (for AI features: chatbot, risk analysis, incident summary)

**File: `backend/.env`**
```
GEMINI_API_KEY=your-gemini-api-key
```

| Step | Action |
|------|--------|
| 1 | Go to [Google AI Studio](https://makersuite.google.com/app/apikey) |
| 2 | Click **Get API Key** |
| 3 | Copy the key and paste it in `backend/.env` |

Without this, AI features fall back to rule-based responses.

### 4. Email SMTP (for password reset emails — optional in dev)

**File: `backend/.env`**
```
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
```

| Step | Action |
|------|--------|
| 1 | Use a Gmail account (or any SMTP provider) |
| 2 | Enable 2-factor authentication on the Gmail account |
| 3 | Generate an [App Password](https://myaccount.google.com/apppasswords) |
| 4 | Set `EMAIL_HOST_USER` to the Gmail address and `EMAIL_HOST_PASSWORD` to the App Password |

If left blank, the reset link appears directly in the frontend UI in development mode.

### 5. Database (SQLite by default — no setup needed)

For PostgreSQL, add to `backend/.env`:
```
DB_NAME=safevoyage
DB_USER=your-db-user
DB_PASSWORD=your-db-password
DB_HOST=localhost
DB_PORT=5432
```

### 6. Firebase Credentials (for legacy Firebase Auth)

**File: `backend/.env`**
```
FIREBASE_CREDENTIALS=firebase/serviceAccountKey.json
```

| Step | Action |
|------|--------|
| 1 | Go to [Firebase Console](https://console.firebase.google.com) |
| 2 | Create a project and enable Authentication (Email/Password + Google) |
| 3 | Go to **Project Settings → Service Accounts** |
| 4 | Click **Generate New Private Key** |
| 5 | Save the JSON file to `backend/firebase/serviceAccountKey.json` |

### 7. Google Maps API Key (optional — map uses OpenStreetMap by default)

```
GOOGLE_MAPS_API_KEY=your-maps-api-key
```

---

## Quick Start

### Prerequisites
- Python 3.12+
- Node.js 18+
- npm

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate it
venv\Scripts\activate  # Windows
# source venv/bin/activate  # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Create backend .env (copy example)
copy .env.example .env  # Windows
# Edit .env with your credentials (see table above)

# Run migrations
python manage.py migrate

# Seed demo data (users, zones, locations)
python manage.py seed_zones
python manage.py seed_locations

# Start backend
python manage.py runserver
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create frontend .env
copy .env.example .env
# Edit .env — paste your Google Client ID

# Start frontend
npm run dev
```

### Demo Accounts (seeded)
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@safevoyage.com | admin123 |
| Police | police@test.com | police123 |
| Tourist | tourist@test.com | tourist123 |

### Access
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000/api/
- **Admin Panel**: http://localhost:8000/admin/
- **API Docs**: http://localhost:8000/api/docs/

---

## Features

### For Tourists
- Registration & login (email + Google Sign-In)
- Digital Tourist ID with QR code generation
- Emergency contact management
- Trip tracking (start/end dates, destination)
- Live location sharing (optional)
- Emergency SOS button with geolocation
- Incident reporting (theft, medical, harassment, etc.)
- AI-powered risk analysis for current location
- AI chatbot for safety questions
- Safety score and recommendations
- View nearby police stations and hospitals
- Interactive map with safety zones
- Trip history and notifications

### For Police
- Dashboard with assigned cases and statistics
- View and respond to SOS alerts
- Accept and update incident case status
- View tourist profiles and digital IDs
- Navigate to incident locations
- Generate incident reports (CSV)

### For Tourism Department
- Manage tourist registrations
- Approve/review digital tourist IDs
- Manage risk zones (safe, restricted, high-risk)
- View analytics and statistics
- Export tourist reports (CSV)
- Manage notifications

### For Administrators
- Full system dashboard with analytics
- Charts (incident types, monthly trends, etc.)
- Manage all users, incidents, and zones
- View live map data
- Export reports
- System-wide notifications

### AI Features
- **Risk Analysis**: Location + time + crime data + incidents → safety score & risk level
- **AI Chatbot**: Ask questions about safety, lost documents, nearby services
- **Safety Tips**: Contextual safety recommendations
- **Incident Summary**: AI-generated summaries of incident reports
- **Gemini API integration** (configurable)

### Map & Geolocation
- Interactive Leaflet.js map with OpenStreetMap
- Live tourist locations
- Police location tracking
- Incident markers
- Safety zone circles (safe/restricted/high-risk)
- Nearby police stations and hospitals
- Search across tourists, incidents, and zones

---

## Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 18 | UI framework |
| TypeScript | Type safety |
| Tailwind CSS | Styling |
| React Router v6 | Routing |
| Leaflet.js / react-leaflet | Interactive maps |
| Chart.js / react-chartjs-2 | Charts and analytics |
| Lucide React | Icons |
| Axios | HTTP client |
| Vite | Build tool |

### Backend
| Technology | Purpose |
|---|---|
| Python 3.12 | Runtime |
| Django 5.0 | Web framework |
| Django REST Framework | REST API |
| PostgreSQL + PostGIS | Database |
| JWT (SimpleJWT) | Authentication |
| Firebase Admin SDK | Firebase integration |
| Google Generative AI (Gemini) | AI features |
| GeoPy / Shapely | Geospatial calculations |
| QR Code (Pillow) | QR code generation |
| Celery + Redis | Async tasks |
| Gunicorn | WSGI server |
| ReportLab / OpenPyXL | Report generation |
| drf-yasg / drf-spectacular | API docs |

### DevOps
| Technology | Purpose |
|---|---|
| Docker | Containerization |
| Docker Compose | Orchestration |
| Nginx | Reverse proxy |

---

## Project Structure

```
safevoyage-ai/
├── backend/
│   ├── safevoyage/           # Django project settings
│   ├── accounts/             # Auth, roles, JWT
│   ├── tourists/             # Profiles, digital ID, QR, trips
│   ├── incidents/            # Incident reporting, SOS
│   ├── geofencing/           # Safe/restricted/high-risk zones
│   ├── dashboard/            # Role-based dashboards
│   ├── ai/                   # Risk analysis, chatbot
│   ├── maps/                 # Map data, nearby places, search
│   ├── notifications/        # Push notifications
│   ├── reports/              # CSV/analytics reports
│   ├── manage.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/
│   │   │   ├── auth/         # Login, Register
│   │   │   ├── tourist/      # Dashboard, Profile, SOS, etc.
│   │   │   ├── police/       # Police dashboard
│   │   │   ├── admin/        # Admin dashboard
│   │   │   └── tourism/      # Tourism dashboard
│   │   ├── services/         # API client
│   │   ├── context/          # Auth, Theme context
│   │   ├── types/            # TypeScript definitions
│   │   └── hooks/            # Custom hooks
│   ├── package.json
│   └── vite.config.ts
├── firebase/
│   ├── firebase.json
│   ├── firestore.rules
│   └── storage.rules
├── docker/
│   └── nginx.conf
├── uploads/                  # Media uploads
├── docker-compose.yml
├── Dockerfile
├── .env.example
└── README.md
```

---

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register/` | Register new user |
| POST | `/api/auth/login/` | Login |
| POST | `/api/auth/firebase/` | Firebase auth |
| POST | `/api/auth/logout/` | Logout |
| GET | `/api/auth/me/` | Get current user |
| PATCH | `/api/auth/me/` | Update profile |
| POST | `/api/auth/change-password/` | Change password |

### Tourists
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/tourists/profile/` | Get tourist profile |
| PATCH | `/api/tourists/profile/update/` | Update profile |
| GET | `/api/tourists/digital-id/` | Get digital ID |
| GET | `/api/tourists/generate-qr/` | Generate QR code |
| POST | `/api/tourists/verify-qr/` | Verify QR (police/tourism) |
| GET | `/api/tourists/trip-history/` | Trip history |
| POST | `/api/tourists/live-location/` | Send live location |
| GET | `/api/tourists/nearby/` | Nearby tourists |

### Incidents
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/incidents/` | List incidents |
| POST | `/api/incidents/` | Create incident |
| GET | `/api/incidents/nearby/` | Nearby incidents |
| POST | `/api/incidents/sos/` | Trigger SOS |
| GET | `/api/incidents/sos/list/` | List SOS alerts |
| PATCH | `/api/incidents/sos/<id>/respond/` | Respond to SOS |

### Geofencing
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/geofencing/zones/` | List zones |
| POST | `/api/geofencing/zones/` | Create zone |
| POST | `/api/geofencing/check/` | Check location against zones |
| GET | `/api/geofencing/alerts/` | Get zone alerts |

### AI
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/ai/risk-analysis/` | Analyze location risk |
| GET | `/api/ai/safety-tips/` | Get safety tips |
| POST | `/api/ai/chatbot/` | Ask AI chatbot |
| POST | `/api/ai/incident-summary/` | Summarize incident |

### Maps
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/maps/data/` | Get all map data |
| GET | `/api/maps/nearby/` | Nearby police & hospitals |
| GET | `/api/maps/search/` | Search all entities |

Full API documentation is available at `/api/docs/` (Swagger) and `/api/redoc/` (ReDoc).

---

## User Roles & Permissions

| Role | Permissions |
|---|---|
| **Tourist** | View own profile, report incidents, trigger SOS, view own data |
| **Police** | View all incidents, respond to SOS, verify tourist IDs, manage cases |
| **Tourism Dept** | Manage registrations, approve IDs, manage zones, view analytics |
| **Admin** | Full system access, manage users, view all data, configure zones |

---

## Deployment

### Production Build

```bash
# Build and start production containers
docker compose -f docker-compose.prod.yml up --build
```

### Security Checklist

- [ ] Change `SECRET_KEY` to a strong random value
- [ ] Set `DEBUG=False`
- [ ] Configure `ALLOWED_HOSTS` with your domain
- [ ] Enable HTTPS with a reverse proxy
- [ ] Set strong database passwords
- [ ] Configure rate limiting
- [ ] Enable CSRF protection
- [ ] Use environment variables for all secrets
- [ ] Regularly update dependencies
- [ ] Set up database backups

---

