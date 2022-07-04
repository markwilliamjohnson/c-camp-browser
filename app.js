const electron = require("electron");
const prompt = require('electron-prompt');
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
mykey = ""

app.whenReady().then(() => { 
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
    mainWindow.maximize();
    if (showing==false)
    {
    load_tabs()
    showing = true
    }
  });
});

function load_tabs()
{
console.log ("reading file!")
if (fs.existsSync(path.join(app.getPath("userData"), "/pages.csv"))) {
  myfile = fs.readFileSync (path.join(app.getPath("userData"), "/pages.csv"), "utf-8")
  console.log (myfile)
  mainWindow.webContents.send("fromMainSend", myfile);
}
else
{
  fs.copyFile(path.join(__dirname, "/pages.csv"), path.join(app.getPath("userData"), "/pages.csv"), (err) => {
    if (err) throw err;
    console.log('source.txt was copied to destination.txt');
  });
  myfile = fs.readFileSync (path.join(__dirname, "/pages.csv"), "utf-8")
  console.log (myfile)
  mainWindow.webContents.send("fromMainSend", myfile);
}
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
  // console.log ("writing tab change data" + data)
  fs.appendFileSync(path.join(app.getPath("userData"), "/usertrace.csv"), data)
  g_data = data
  }
});


ipcMain.on("toMain", (event, args) => 
{
  mykey = ""
  if (fs.existsSync(path.join(app.getPath("userData"), "/openaikey.txt"))) {
    mykey = fs.readFileSync (path.join(app.getPath("userData"), "/openaikey.txt"), "utf-8")
    openOpenAIWindow()
  }
  else
  {
    prompt({
      title: 'Enter OpenAI Key',
      label: 'OpenAI API Key:',
      value: '',
      inputAttrs: {
          type: 'text'
      },
      type: 'input'
  })
  .then((r) => {
      if(r === null) {
          console.log('user cancelled');
      } else {
          console.log('result', r);
          mykey = r
          if (r!="")
          {
          fs.writeFileSync (path.join(app.getPath("userData"), "/openaikey.txt"), mykey)
          openOpenAIWindow()
          }
      }
  })
  .catch(console.error);
  }

}
);

function openOpenAIWindow ()
{
  // Load a remote URL
metacurriculum = new electron.BrowserWindow({
  modal:true,
  webPreferences: {
    show: true,
    modal: true,
    nodeIntegration: false,
    webSecurity: false,
    allowDisplayingInsecureContent: true,
    allowRunningInsecureContent: true,
    enableRemoteModule: false, // turn off remote
    preload: path.join(__dirname, "preload.js") 
  }
})

metacurriculum.loadURL("file://" + __dirname + "/metacurriculum.html");
metacurriculum.setAlwaysOnTop(true, 'screen');
}

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
  fs.writeFileSync(path.join(app.getPath("userData"), "/mynotes.txt"), data)
  console.log ("mypath: " + path.join(app.getPath("userData"), "/mynotes.txt"))
});

ipcMain.on ("SignalNote", (event, args) =>
{

  if (fs.existsSync(path.join(app.getPath("userData"), "/mynotes.txt"))) {
    myfile = fs.readFileSync (path.join(app.getPath("userData"), "/mynotes.txt"), "utf-8")
    NotesWin.webContents.send("fromMainNotes", myfile);
    }
})

async function openaigen (myprompt)
{
    const configuration = new Configuration({
      apiKey: mykey
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
