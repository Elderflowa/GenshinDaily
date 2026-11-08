// Windows app: runs the sync server inside the app and shows the dashboard in its own window.
// Closing the window keeps it running in the tray so your phone can still sync.
const path = require('node:path')
const { pathToFileURL } = require('node:url')
const { app, BrowserWindow, Tray, Menu, ipcMain, dialog, nativeImage } = require('electron')

const PORT = 3050
let win = null
let tray = null
let quitting = false

if (!app.requestSingleInstanceLock()) app.quit()
app.on('second-instance', showWindow)

const autoStart = () => app.getLoginItemSettings().openAtLogin
const setAutoStart = on => app.setLoginItemSettings({ openAtLogin: on, args: ['--hidden'] })

function showWindow() {
  if (!win) return
  if (win.isMinimized()) win.restore()
  win.show()
  win.focus()
}

function createWindow() {
  win = new BrowserWindow({
    width: 960, height: 1000, minWidth: 380, minHeight: 500,
    backgroundColor: '#09090f', autoHideMenuBar: true, show: false,
    icon: path.join(__dirname, '..', 'build', 'icon.png'),
    webPreferences: { preload: path.join(__dirname, 'preload.cjs') },
  })
  win.loadURL(`http://localhost:${PORT}`)
  win.once('ready-to-show', () => { if (!process.argv.includes('--hidden')) win.show() })
  win.on('close', e => { if (!quitting) { e.preventDefault(); win.hide() } })
}

function createTray() {
  tray = new Tray(nativeImage.createFromPath(path.join(__dirname, 'tray.png')).resize({ width: 16, height: 16 }))
  tray.setToolTip('Genshin Daily')
  tray.on('click', showWindow)
  const menu = () => Menu.buildFromTemplate([
    { label: 'Open Genshin Daily', click: showWindow },
    { label: 'Start with Windows', type: 'checkbox', checked: autoStart(), click: item => { setAutoStart(item.checked); tray.setContextMenu(menu()) } },
    { type: 'separator' },
    { label: 'Quit', click: () => { quitting = true; app.quit() } },
  ])
  tray.setContextMenu(menu())
}

ipcMain.handle('autostart:get', autoStart)
ipcMain.handle('autostart:set', (_e, on) => { setAutoStart(Boolean(on)); return autoStart() })

app.whenReady().then(async () => {
  try {
    const { startServer } = await import(pathToFileURL(path.join(__dirname, '..', 'server.mjs')).href)
    await startServer({
      port: PORT,
      dist: path.join(__dirname, '..', 'dist'),
      dataFile: path.join(app.getPath('userData'), 'state.json'),
    })
  } catch (e) {
    dialog.showErrorBox('Genshin Daily', `Could not start on port ${PORT}. Is another copy (or Docker) already using it?\n\n${e.message}`)
    quitting = true
    return app.quit()
  }
  createWindow()
  createTray()
})

app.on('before-quit', () => { quitting = true })
app.on('window-all-closed', () => { /* stay in the tray */ })
