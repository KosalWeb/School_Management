const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    platform: process.platform,
    versions: {
        node: process.versions.node,
        electron: process.versions.electron,
    },
    license: {
        getStatus: () => ipcRenderer.invoke('license:status'),
        activate: (key, expiresAt) => ipcRenderer.invoke('license:activate', key, expiresAt),
        getMachineId: () => ipcRenderer.invoke('license:machineId'),
        onStatus: (cb) => {
            const handler = (_e, status) => cb(status);
            ipcRenderer.on('license:status', handler);
            return () => ipcRenderer.removeListener('license:status', handler);
        },
    },
});
