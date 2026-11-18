const { contextBridge, ipcRenderer } = require('electron')

// Only exists in the Windows app, so the page can show the "Start with Windows" option there.
contextBridge.exposeInMainWorld('desktop', {
  getAutoStart: () => ipcRenderer.invoke('autostart:get'),
  setAutoStart: on => ipcRenderer.invoke('autostart:set', on),
  onTestNotification: (callback) => {
    ipcRenderer.on('test-notification:receive', (_e, payload) => callback(payload))
    return () => ipcRenderer.removeListener('test-notification:receive', callback)
  },
})
