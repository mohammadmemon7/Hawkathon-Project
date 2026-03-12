# SehatSetu AI

Rural healthcare telemedicine platform powered by AI for Nabha, Punjab and surrounding 173 villages.

## Features
- Patient registration with voice input (Hindi)
- AI-powered symptom triage (Emergency / Consult Soon / Home Remedy)
- Doctor dashboard with patient queue
- Medicine finder with real Nabha-area pharmacy data
- PWA — works offline

## Tech Stack
- **Frontend:** React 18 + Vite + TailwindCSS + React Router v6
- **Backend:** Node.js + Express + better-sqlite3
- **AI:** Claude API (Anthropic) for symptom analysis

## Setup

### Backend
```bash
cd backend
npm install
# Set your Claude API key in .env
npm run seed   # Seed doctors + medicines
npm run dev    # Start on port 5000
```

### Frontend
```bash
cd frontend
npm install
npm run dev    # Start on port 5173
```

## Environment Variables

### Backend (.env)
```
PORT=5000
CLAUDE_API_KEY=your_claude_api_key_here
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
```

## Seed Data
```bash
cd backend
node db/seed.js
```
Seeds 4 doctors and 10 medicines from real Nabha-area pharmacies.

## Live URL
- Frontend: _TBD_
- Backend: _TBD_

## Team
- _Add team member names here_
