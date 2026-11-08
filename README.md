# Genshin Daily

A small browser dashboard with your daily, weekly and monthly Genshin checklists, active events and the current banners. It runs in one Docker container and is served at **http://localhost:3050**.

Your progress is saved in your browser and also on the server in a Docker volume, so the PC page and the phone app stay in sync (see Sync below).

## Setup on Windows (first time)

1. **Install Docker Desktop** from https://www.docker.com/products/docker-desktop/
   - Keep "Use WSL 2 instead of Hyper-V" ticked in the installer, then restart Windows when asked.
   - If it complains about virtualization, enable *Intel VT-x / AMD-V (SVM)* in your BIOS.
2. **Open Docker Desktop** and accept the terms. Wait until the bottom-left says **Engine running**. You can skip signing in.
3. **Unzip this folder** somewhere permanent, for example `C:\Apps\genshin-daily`.
4. **Double-click `start.bat`.** The first build takes a minute or two. Your browser opens at http://localhost:3050 when it finishes.

Run `start.bat` again whenever you change something in `src/` and want to rebuild.

## Day to day

- Docker Desktop → Settings → General → tick **Start Docker Desktop when you sign in**. The container comes back up by itself (`restart: unless-stopped`), so you only need to open http://localhost:3050.
- Stop it: Docker Desktop → Containers → press the stop button, or run `docker compose down` in this folder.
- Remove it completely: `docker compose down --rmi all`.

## Settings you may want to change

| What | Where |
| --- | --- |
| Your game server (Europe / America / Asia) for the 04:00 reset times | `SERVER` at the top of `src/lib.js` |
| Tasks, bosses, icons | `src/tasks.jsx` (daily bosses are the list at the top, with the item name used for the icon lookup) |
| Port | `docker-compose.yml`, the number left of the colon |

After editing, run `start.bat` again.

## Troubleshooting

- **"Docker is not running"**: open Docker Desktop and wait for "Engine running".
- **Port already in use**: change `3050` in `docker-compose.yml`, and in `start.bat`.
- **Banners are empty**: they come from the public api.ennead.cc service. Reload later; the last successful result is reused.

## iPhone app (.ipa for sideloading)

An .ipa can only be built on a Mac, so GitHub builds it for you for free. You never touch Xcode.

1. Make a free account at https://github.com and create a **new repository** (private is fine).
2. Upload this folder's files to the repo: on the repo page choose **Add file → Upload files**, drag everything in (except `build-ipa.yml`), and commit.
3. Add the build recipe. GitHub needs it in a hidden folder, so do this part in the browser: **Add file → Create new file**, type exactly `.github/workflows/build-ipa.yml` as the file name (typing the slashes creates the folders), open `build-ipa.yml` from this folder in Notepad, copy everything into the editor, and commit.
   Then open the **Actions** tab → **Build IPA** → **Run workflow**. It takes about 10 minutes.
4. Open the finished run and download **GenshinDaily-ipa** at the bottom. Unzip it to get `GenshinDaily.ipa`.
5. Install it with **AltStore** (https://altstore.io) or **Sideloadly** (https://sideloadly.io) using your Apple ID. Free Apple IDs expire apps after 7 days, and AltStore can refresh them automatically over Wi-Fi.

The app is self-contained: it needs no PC running. Checkmarks are stored on the phone and are separate from the PC version.
If you change `src/` or `tasks.jsx`, upload the changed files and run the workflow again to get a new .ipa.

## Windows app (instead of Docker)

GitHub builds a normal Windows installer for you, same as the iPhone app:

1. In your repo, create `.github/workflows/build-exe.yml` and paste in the contents of `build-exe.yml` from this folder.
2. **Actions → Build Windows app → Run workflow**. Download **GenshinDaily-Windows** when it finishes and unzip it.
3. Run `GenshinDaily-Setup.exe`. Windows SmartScreen will warn because the app isn't code-signed: **More info → Run anyway**.

The app opens its own window. Closing the window keeps it running in the tray (bottom right) so your phone can still sync; right-click the tray icon → **Quit** to stop it. To start it when Windows starts, tick **Start with Windows** under **Events & Banners → Sync** (it only appears in this app) or in the tray menu. Allow it through Windows Firewall on private networks when asked, so the phone can reach it.

It uses the same address and sync as the Docker version (port 3050), so don't run both at once. Docker still works if you prefer it.

## Sync between PC and phone

The container keeps your checkmarks and timers in a Docker volume. The PC page and the iPhone app both read and write them every few seconds, newest change wins.

- It works while the PC is on and the phone is on the same Wi-Fi. If the PC can't be reached, the phone keeps working on its own and catches up later.
- The phone app talks to `http://192.168.0.50:3050` by default. Change it in the app under **Events & Banners → Sync**. Give the PC a fixed address in your router (DHCP reservation) so it never changes.
- Allow Docker through Windows Firewall on private networks when asked, and tap **Allow** for local network access the first time the app opens.
- `.github/workflows/build-ipa.yml` changed: copy the new `build-ipa.yml` into it again, then rebuild the IPA.

## Development without Docker

```
npm install
npm run dev
```
