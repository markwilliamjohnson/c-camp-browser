const {
    contextBridge,
    ipcRenderer
  } = require("electron");
  
  // Expose protected methods that allow the renderer process to use
  // the ipcRenderer without exposing the entire object
  contextBridge.exposeInMainWorld(
    "api", {
        send: (channel, data) => {
            // whitelist channels
            let validChannels = ["toMain", "toMainSend", "changeTab", "toMainData", "toMainAI", "toMain2", "toMain3", "fromMainNotes", "toMainNotes" ,"SignalNote"];
            if (validChannels.includes(channel)) {
                ipcRenderer.send(channel, data);
            }
        },
        receive: (channel, func) => {
            let validChannels = ["fromMain", "changeTab","fromMainSend", "toMainData","fromMainAI", "toMain4", "fromMainNotes","toMainNotes", "SignalNote"];
            if (validChannels.includes(channel)) {
                // Deliberately strip event as it includes `sender` 
                ipcRenderer.on(channel, (event, ...args) => func(...args));
            }
        }
    }
  );