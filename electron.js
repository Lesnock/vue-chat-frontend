const { app, BrowserWindow } = require('electron')
const isDev = require('electron-is-dev')

function createWindow() {
  const win = new BrowserWindow({
    width: 1024,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
    }
  })

  win.loadURL(
    isDev ?
      'http://localhost:8080' :
      `file:///${__dirname}/build/index.html`
  )
}

app.on('ready', createWindow)
