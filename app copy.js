const electron = require("electron");
showing = false;

g_noteswin = false
const {
  BrowserWindow,
  BrowserView,
  ipcMain,
  Menu
} = require("electron");
const { Configuration, OpenAIApi } = require("openai");

const app = electron.app;
app.commandLine.appendSwitch('js-flags', '--max-old-space-size=4096');
const path = require("path");
const fs = require("fs");
require('v8-compile-cache');
mainWindow = null;
metacurriculum = null;

app.on("ready", function () {
  mainWindow = new electron.BrowserWindow({
    webPreferences: {
      webviewTag: true,
      enableRemoteModule: false, // turn off remote
      preload: path.join(__dirname, "preload.js") 
    }
  }
  
  );

  mainWindow.loadURL("file://" + __dirname + "/electron-tabs.html");
  // document.getElementById ("tab1")
  mainWindow.on("ready-to-show", function () {
    mainWindow.show();
    mainWindow.focus();
    // mainWindow.maximize();
    // if (showing==false)
    // {
    // load_tabs()
    // showing = true
    // }
    const view1 = new BrowserView({
    webPreferences: {
      nodeIntegration:false,
      show: true,
      enableRemoteModule: false, // turn off remote
    }}
  )
  mainWindow.setBrowserView(view1)
  view1.setBounds({ x: 0, y: 0, width: 300, height: 300 })
  view1.webContents.loadURL('https://electronjs.org')
  
  });


  // const view2 = new BrowserView()
  // mainWindow.setBrowserView(view2)
  // view2.setBounds({ x: 700, y: 0, width: 300, height: 300 })
  // view2.webContents.loadURL('https://google.com')

  // const view3 = new BrowserView()
  // mainWindow.setBrowserView(view3)
  // view3.setBounds({ x: 400, y: 300, width: 300, height: 300 })
  // view3.webContents.loadURL('https://bbc.co.uk')

});

function load_tabs()
{
console.log ("reading file!")
  myfile = fs.readFileSync (path.join(__dirname, "/pages.csv"), "utf-8")
  console.log (myfile)
  mainWindow.webContents.send("fromMainSend", myfile);
}

ipcMain.on ("toMainAI", (event, args) =>
{
  console.log (args)
    openaigen(args)
    .then((data) => { metacurriculum.webContents.send("fromMainAI", data)})
    .then(() => { console.log('are no data returned')});
})
g_data = ""
ipcMain.on("toMainData", (event, data) => 
{
  if (g_data != data)
  {
  console.log ("writing tab change data" + data)
  fs.appendFileSync(path.join(__dirname, "/writingdata.csv"), data)
  g_data = data
  }
});


ipcMain.on("toMain", (event, args) => 
{
// Load a remote URL
metacurriculum = new electron.BrowserWindow({
  modal:true,
  webPreferences: {
    show: true,
    modal: true,
    enableRemoteModule: false, // turn off remote
    preload: path.join(__dirname, "preload.js") 
  }
})
metacurriculum.loadURL("file://" + __dirname + "/metacurriculum.html");
metacurriculum.setAlwaysOnTop(true, 'screen');
});

ipcMain.on("toMain2", (event, args) => 
{
// Load a remote URL
AIWin = new electron.BrowserWindow({
  webPreferences: {
    show: true,
    enableRemoteModule: false, // turn off remote
    nodeIntegration: true,
    contextIsolation: false,
    preload: path.join(__dirname, "preload.js")
  }
})

AIWin.loadURL ("file://" + __dirname + "/examples/mnist/index.html");
AIWin.setAlwaysOnTop(true, 'screen');
});

ipcMain.on("toMain3", (event, args) => 
{
 if (g_noteswin == false)
{// Load a remote URL
NotesWin = new electron.BrowserWindow({
  webPreferences: {
    show: true,
    enableRemoteModule: false, // turn off remote
    nodeIntegration: true,
    contextIsolation: true,
    preload: path.join(__dirname, "preload.js")
  }
}
)
NotesWin.on('close', function() { //   <---- Catch close event
g_noteswin = false;
});

NotesWin.loadURL ("file://" + __dirname + "/reader.html");
NotesWin.setAlwaysOnTop(true, 'screen');
g_noteswin = true
}

});


ipcMain.on ("toMainNotes", (event, data) =>
{
  console.log ("asdf saving notes")
  fs.writeFileSync(path.join(__dirname, "/questions.txt"), data)
});

ipcMain.on ("SignalNote", (event, args) =>
{

  myfile = fs.readFileSync (path.join(__dirname, "/questions.txt"), "utf-8")
  NotesWin.webContents.send("fromMainNotes", myfile);

})

async function openaigen (myprompt)
{
  
    const configuration = new Configuration({
      apiKey: "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",
    });
    const openai = new OpenAIApi(configuration);
    responses = []
    output = ""
    for (t=0;t<3;t++){
    const completion = await openai.createCompletion({
      model:"davinci",
      temperature:0.7,
      max_tokens:100,
      top_p:1.0,
      frequency_penalty:0.2,
      presence_penalty:0.0,    
      prompt: myprompt
    });
    output = output + "<div><input name='group1' type=radio id='" + t + "' onclick='setselect()'><label for='" + t + "'><b>Option " + (t+1) + ":</b>..." + completion.data.choices[0].text + "</label></input></div><p>"
  }
    console.log (output)
    return (output)
  }
