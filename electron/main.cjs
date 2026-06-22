const { app, BrowserWindow, ipcMain } = require('electron');
const { spawn } = require('child_process');
const path = require('path');
const { checkLicense, activate, getMachineId } = require('./license.cjs');

let mainWindow;
let serverProcess;

const backendPath = app.isPackaged
    ? path.join(process.resourcesPath, 'backend', 'server.js')
    : path.join(__dirname, '..', 'backend', 'server.js');

const backendCwd = app.isPackaged
    ? path.join(process.resourcesPath, 'backend')
    : path.join(__dirname, '..', 'backend');

const frontendPort = process.env.PORT || 3456;

function startBackend() {
    return new Promise((resolve, reject) => {
        serverProcess = spawn('node', [backendPath], {
            cwd: backendCwd,
            env: {
                ...process.env,
                APP_PORT: String(frontendPort),
                NODE_ENV: 'production',
            },
            stdio: ['ignore', 'pipe', 'pipe'],
        });

        serverProcess.stdout.on('data', (data) => {
            const msg = data.toString();
            console.log('[backend]', msg.trim());
            if (msg.includes('Server running')) {
                resolve(frontendPort);
            }
        });

        serverProcess.stderr.on('data', (data) => {
            console.error('[backend:err]', data.toString().trim());
        });

        serverProcess.on('error', (err) => {
            console.error('[backend] Failed to start:', err);
            reject(err);
        });

        serverProcess.on('exit', (code) => {
            console.log('[backend] exited with code', code);
        });

        setTimeout(() => resolve(frontendPort), 15000);
    });
}

function createWindow(port) {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        minWidth: 1024,
        minHeight: 600,
        title: 'School Management',
        icon: path.join(__dirname, '..', 'frontend', 'public', 'vite.svg'),
        webPreferences: {
            preload: path.join(__dirname, 'preload.cjs'),
            nodeIntegration: false,
            contextIsolation: true,
        },
    });

    mainWindow.loadURL(`http://localhost:${port}`);

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

ipcMain.handle('license:status', () => checkLicense(app));
ipcMain.handle('license:activate', (_e, key, expiresAt) => activate(app, key, expiresAt));
ipcMain.handle('license:machineId', () => getMachineId());

app.whenReady().then(async () => {
    try {
        const port = await startBackend();
        const license = checkLicense(app);
        console.log(`Backend ready on port ${port}, license:`, license.status);
        createWindow(port);
        mainWindow.webContents.on('did-finish-load', () => {
            mainWindow.webContents.send('license:status', license);
        });
    } catch (err) {
        console.error('Failed to start backend:', err);
        app.quit();
    }
});

app.on('window-all-closed', () => {
    if (serverProcess) {
        serverProcess.kill();
        serverProcess = null;
    }
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        app.quit();
    }
});

app.on('will-quit', () => {
    if (serverProcess) {
        serverProcess.kill();
        serverProcess = null;
    }
});
