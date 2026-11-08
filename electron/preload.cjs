const { contextBridge, ipcRenderer } = require('electron')

// Only exists in the Windows app, so the page can show the "Start with Windows" option there.
contextBridge.exposeInMainWorld('desktop', {
  getAutoStart: () => ipcRenderer.invoke('autostart:get'),
  setAutoStart: on => ipcRenderer.invoke('autostart:set', on),
})
