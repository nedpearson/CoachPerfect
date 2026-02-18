# Coach Perfect Mobile — Offline-First PWA with Local WiFi Sync

## What This Is

A complete Progressive Web App (PWA) for Coach Perfect coaching platform that:

- **Installs via QR code** — scan from dashboard, instantly installs on any phone
- **Works 100% offline** — all data stored in IndexedDB, service worker caches the app shell
- **Syncs on same WiFi** — WebSocket-based peer sync when devices are on the same network
- **Zero cloud dependency** — everything runs locally until you choose to push to cloud

## Quick Start

```bash
npm install
npm start
```

Then open:
- **Dashboard** (desktop): `http://localhost:3000/dashboard.html`
- **Mobile app** (phone): Scan QR code from dashboard, or visit `http://<your-ip>:3000`

## Architecture

```
┌──────────────────────────────────────────┐
│           DESKTOP DASHBOARD              │
│   http://your-ip:3000/dashboard.html     │
│                                          │
│   ┌──────────┐    ┌──────────────────┐   │
│   │ QR Code  │    │ Connected Devices│   │
│   │ (Install)│    │ Sync Status      │   │
│   └──────────┘    │ Activity Log     │   │
│                   └──────────────────┘   │
└──────────────┬───────────────────────────┘
               │ WebSocket (ws://ip:3579)
               │
    ┌──────────┴──────────┐
    │    SYNC SERVER      │
    │    (Node.js)        │
    │    Port 3579        │
    │    In-memory store  │
    └──────────┬──────────┘
               │
     ┌─────────┼─────────┐
     │         │         │
  ┌──┴──┐  ┌──┴──┐  ┌──┴──┐
  │Phone│  │Phone│  │Phone│
  │ PWA │  │ PWA │  │ PWA │
  │     │  │     │  │     │
  │IndexDB│ │IndexDB│ │IndexDB│
  └─────┘  └─────┘  └─────┘
```

## Files

```
coachperfect-mobile/
├── server.js              # HTTP server + WebSocket sync server
├── package.json
├── public/
│   ├── index.html         # Mobile PWA (full app)
│   ├── dashboard.html     # Desktop dashboard with QR codes
│   ├── sw.js              # Service worker (offline caching)
│   ├── manifest.json      # PWA manifest (installability)
│   ├── icon-192.png       # App icon
│   └── icon-512.png       # App icon (large)
├── scripts/
│   └── generate-icons.js  # Icon generation script
└── README.md
```

## How It Works

### Installation Flow
1. Start server on your computer (`npm start`)
2. Open `http://localhost:3000/dashboard.html` in your browser
3. QR code auto-generates with your local IP address
4. Scan QR code with phone → opens mobile app in browser
5. Phone prompts "Add to Home Screen" → installs as native app
6. App is now fully cached — works without WiFi

### Offline-First Data Model
- All data stored in **IndexedDB** on each device
- Changes queue in `syncQueue` store with timestamps
- When WebSocket connection is available, queue flushes
- Conflict resolution: last-write-wins based on `updatedAt`

### WiFi Sync Protocol
- Server runs WebSocket on port 3579
- Devices send `HELLO` with their device ID on connect
- Changes broadcast to all connected peers
- Full state sync available on demand
- Auto-reconnect every 5 seconds when connection drops

### Data Stores (IndexedDB)

| Store | Contents |
|-------|----------|
| `clients` | Client profiles, BHS, company info |
| `tasks` | Action items with status, priority, due dates |
| `wins` | Win journal entries |
| `sessions` | Session records with dates, notes |
| `diagnostics` | Diagnostic responses and scores |
| `notes` | Session notes, voice note transcriptions |
| `pulseCheckins` | Weekly pulse check-in data |
| `syncQueue` | Pending changes waiting to sync |
| `meta` | App metadata, settings |

## Mobile App Features

- **Business Health Score** — big hero number with trend
- **Quick Actions** — voice note, add task, log win, pulse check
- **Streak Tracker** — weekly check-in streak with fire emoji
- **Session Prep** — AI-generated brief for next session
- **Task Management** — tap to complete, priority sorting
- **Win Journal** — quick capture with timestamps
- **Client List** — all clients with BHS and trends
- **Sync Settings** — device info, pending changes, force sync

## Dashboard Features

- **Dual QR Codes** — one for coach install, one for client sharing
- **Connected Devices** — see all synced devices in real-time
- **Sync Activity Log** — timestamp of every sync event
- **Device Stats** — records synced, sync count, last seen

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | HTTP server port |
| `WS_PORT` | `3579` | WebSocket sync port |

## Production Deployment

For production, you'd add:
1. **TLS/SSL** — HTTPS required for PWA install prompt on non-localhost
2. **Cloud sync** — Replace/supplement local WebSocket with cloud API
3. **Auth** — JWT tokens for device authentication
4. **Data encryption** — Encrypt IndexedDB contents at rest
5. **Push notifications** — Web Push API for task reminders

## Browser Support

| Browser | Install | Offline | Sync |
|---------|---------|---------|------|
| Chrome (Android) | ✅ | ✅ | ✅ |
| Safari (iOS 16.4+) | ✅ | ✅ | ✅ |
| Firefox (Android) | ✅ | ✅ | ✅ |
| Edge | ✅ | ✅ | ✅ |
| Chrome (Desktop) | ✅ | ✅ | ✅ |
| Safari (macOS) | ⚠️ Partial | ✅ | ✅ |
