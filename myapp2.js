// In the main process.
const { app, BrowserView, BrowserWindow } = require('electron')

app.whenReady().then(() => {
  const win = new BrowserWindow({ width: 800, height: 600 })
  
  const view = new BrowserView()
  win.addBrowserView(view)
  view.setBounds({ x: 0, y: 0, width: 300, height: 300 })
  view.webContents.loadURL('https://electronjs.org')
  const view2 = new BrowserView()
  win.addBrowserView(view2)
  view2.setBounds({ x: 300, y: 0, width: 300, height: 300 })
  view2.webContents.loadURL('https://www.bbc.co.uk')
  const view3 = new BrowserView()
  win.addBrowserView(view3)
  view3.setBounds({ x: 0, y:300, width: 300, height: 300 })
  view3.webContents.loadURL('https://www.facebook.com')
})