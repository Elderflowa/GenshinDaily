<p align="center">
  <img src="https://raw.githubusercontent.com/Elderflowa/GenshinDaily/main/build/icon.png" alt="Traveler's Guide Icon" width="72" height="72" />
</p>

<h1 align="center">Traveler's Guide</h1>

<p align="center">
  <b>A sleek checklist dashboard for Genshin Impact dailies, weeklies, monthlies — with live events, current banners, and PC↔phone sync.</b>
</p>

<p align="center">
  <a href="https://hub.docker.com/r/elderflowa/genshin-daily"><img src="https://img.shields.io/docker/v/elderflowa/genshin-daily?label=docker&logo=docker&color=2496ED" alt="Docker Image" /></a>
  <a href="https://github.com/Elderflowa/GenshinDaily/actions/workflows/build-windows.yml"><img src="https://img.shields.io/github/actions/workflow/status/Elderflowa/GenshinDaily/build-windows.yml?label=windows%20build&logo=github" alt="Windows Build" /></a>
  <a href="https://github.com/Elderflowa/GenshinDaily/actions/workflows/build-ipa.yml"><img src="https://img.shields.io/github/actions/workflow/status/Elderflowa/GenshinDaily/build-ipa.yml?label=ipa%20build&logo=github" alt="iOS Build" /></a>
</p>

<p align="center"><i>Personal fan project — not affiliated with Hoyoverse / miHoYo</i></p>

---

## Screenshots

| Desktop (wide) | Mobile / Narrow |
|:---:|:---:|
| ![Desktop](https://raw.githubusercontent.com/Elderflowa/GenshinDaily/main/docs/screenshot-wide.png) | ![Mobile](https://raw.githubusercontent.com/Elderflowa/GenshinDaily/main/docs/screenshot-narrow.png) |

---

## Features

- **Three tabs** — Today (dailies + daily bosses), Weekly & Monthly, Events & Banners
- **Auto-reset** at 04:00 server time (Europe / America / Asia — configurable)
- **Timers** for Serenitea Pot plants (2d 22h) and Crystal Fly traps (7d)
- **Live data** — active events & current banners from `api.ennead.cc`
- **Material icons** auto-fetched from genshin-db-api (cached locally)
- **PC ↔ Phone sync** — last-write-wins via local Node server (Docker volume or Windows app data)
- **Runs anywhere** — Docker, Windows installer (.exe), iOS sideload (.ipa)

---

## Quick Start (Docker)

```bash
# 1. Clone
git clone https://github.com/Elderflowa/GenshinDaily
cd GenshinDaily

# 2. Run
docker compose up -d
# Opens at http://localhost:3050
```

> **Windows**: just double-click `start.bat` — it builds and opens the page for you.

---

## Installers (GitHub Actions)

| Platform | How to get it |
|----------|---------------|
| **Windows** | Actions → **Build Windows** → Run workflow → Download `TravelersGuide-Windows.zip` → run `TravelersGuide-Setup-v<version>.exe` |
| **iOS (.ipa)** | Actions → **Build IPA** → Run workflow → Download `TravelersGuide-ipa.zip` → install via **AltStore** or **Sideloadly** |

> The Windows app runs the sync server internally and minimizes to tray — your phone stays synced even when the window is closed.

---

## AltStore / Feather Source

Add this source in AltStore or Feather for automatic updates:

```
https://raw.githubusercontent.com/Elderflowa/GenshinDaily/main/source.json
```

The `source.json` is auto-generated on each release with the correct version, IPA size, and download URL.

---

## Sync (PC ↔ Phone)

- Docker: state lives in a named volume (`genshin-data`)
- Windows app: state at `%APPDATA%\Traveler's Guide\state.json`
- Phone app polls every 5s + on wake/online; newest timestamp per key wins
- Default phone target: `http://192.168.0.50:3050` — change in **Events & Banners → Sync**

---

## Configuration

| Setting | Location |
|---------|----------|
| Game server (reset timezone) | `SERVER` in `src/lib.js` — `Europe` \| `America` \| `Asia` |
| Checklist items, bosses, icons | `src/tasks.jsx` |
| Port | `docker-compose.yml` (left side of `3050:3000`) |

Edit → rebuild → done.

---

## Dev Mode (no Docker)

```bash
npm install
npm run dev        # Vite on :5173
npm run desktop    # Electron + Vite (live reload)
```

---

## Tech Stack

- **Frontend**: React 18 + Vite, CSS custom properties, Poppins font
- **Sync Server**: Node.js (`server.mjs`) — static files + `/api/state` (JSON, timestamped)
- **Desktop**: Electron 33 (window + tray + auto-start)
- **Mobile**: Capacitor 7 (iOS)
- **Container**: Multi-stage Dockerfile (Node 22 Alpine)

---

## Disclaimer

This is a personal fan project for Genshin Impact. Not affiliated with, endorsed by, or connected to Hoyoverse / miHoYo / COGNOSPHERE. All game assets, names, and trademarks belong to their respective owners.