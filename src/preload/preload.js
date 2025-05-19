const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'electron',
  {
    ipcRenderer: {
      invoke: (channel, ...args) => {
        // whitelist channels
        const validChannels = [
          'select-image',
          'select-video',
          'get-journal',
          'get-all-journals',
          'create-journal',
          'update-journal',
          'delete-journal',
          'auto-save-journal'
        ];
        if (validChannels.includes(channel)) {
          return ipcRenderer.invoke(channel, ...args);
        }
        throw new Error(`Invalid channel: ${channel}`);
      },
      on: (channel, func) => {
        const validChannels = ['journal-updated'];
        if (validChannels.includes(channel)) {
          ipcRenderer.on(channel, (event, ...args) => func(...args));
        }
      },
      once: (channel, func) => {
        const validChannels = ['journal-updated'];
        if (validChannels.includes(channel)) {
          ipcRenderer.once(channel, (event, ...args) => func(...args));
        }
      },
      removeListener: (channel, func) => {
        const validChannels = ['journal-updated'];
        if (validChannels.includes(channel)) {
          ipcRenderer.removeListener(channel, func);
        }
      }
    }
  }
); 