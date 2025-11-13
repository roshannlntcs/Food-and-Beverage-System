const path = require('path');
const fs = require('fs');
const http = require('http');
const crypto = require('crypto');
const { fork } = require('child_process');
const { app, BrowserWindow, dialog } = require('electron');

const isDev = !app.isPackaged;
const BACKEND_PORT = Number(process.env.BACKEND_PORT || 4870);
const BACKEND_ORIGIN = `http://127.0.0.1:${BACKEND_PORT}`;
const MANAGED_BACKEND = process.env.DESKTOP_EXTERNAL_API !== 'true';

let mainWindow;
let backendProcess;
let isQuitting = false;

function resolveBackendDir() {
  if (isDev) {
    return path.resolve(__dirname, '..', 'backend');
  }
  return path.join(process.resourcesPath, 'backend');
}

function getStorageDir() {
  const storageDir = path.join(app.getPath('userData'), 'storage');
  if (!fs.existsSync(storageDir)) {
    fs.mkdirSync(storageDir, { recursive: true });
  }
  return storageDir;
}

function getDbVersionToken(bundledDb) {
  try {
    const stats = fs.statSync(bundledDb);
    return `${app.getVersion() || 'dev'}:${stats.size}:${stats.mtimeMs}`;
  } catch (_err) {
    return `${app.getVersion() || 'dev'}:fallback`;
  }
}

function resolveDatabasePath(backendDir) {
  const bundledDb = path.join(backendDir, 'prisma', 'dev.db');

  if (isDev) {
    return bundledDb;
  }

  const storageDir = getStorageDir();

  const runtimeDb = path.join(storageDir, 'pos.db');
  const versionFile = path.join(storageDir, 'pos-db-version.json');
  const currentToken = getDbVersionToken(bundledDb);

  let storedToken = null;
  if (fs.existsSync(versionFile)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(versionFile, 'utf8'));
      storedToken = parsed?.token || null;
    } catch (_err) {
      storedToken = null;
    }
  }

  if (!fs.existsSync(runtimeDb) || storedToken !== currentToken) {
    fs.copyFileSync(bundledDb, runtimeDb);
    fs.writeFileSync(versionFile, JSON.stringify({ token: currentToken }), 'utf8');
  }

  return runtimeDb;
}

function resolveJwtSecret() {
  if (process.env.JWT_SECRET) {
    return process.env.JWT_SECRET;
  }

  if (isDev) {
    return 'dev_secret_change_me';
  }

  const storageDir = getStorageDir();
  const secretFile = path.join(storageDir, 'jwt-secret.txt');

  if (fs.existsSync(secretFile)) {
    try {
      return fs.readFileSync(secretFile, 'utf8');
    } catch (_err) {
      // continue to recreate below
    }
  }

  const secret = crypto.randomBytes(48).toString('hex');
  fs.writeFileSync(secretFile, secret, { encoding: 'utf8', mode: 0o600 });
  return secret;
}

function sqliteUrlFromPath(filePath) {
  const normalized = filePath.replace(/\\/g, '/');
  return `file:${normalized}`;
}

function startBackend(backendDir) {
  if (!MANAGED_BACKEND || backendProcess) {
    return;
  }

  const serverEntry = path.join(backendDir, 'src', 'server.js');
  if (!fs.existsSync(serverEntry)) {
    throw new Error(`Unable to locate backend entry at ${serverEntry}`);
  }

  const databaseFile = resolveDatabasePath(backendDir);
  const jwtSecret = resolveJwtSecret();
  const env = {
    ...process.env,
    NODE_ENV: isDev ? 'development' : 'production',
    PORT: BACKEND_PORT,
    DATABASE_URL: sqliteUrlFromPath(databaseFile),
    JWT_SECRET: jwtSecret,
    COOKIE_SECURE: isDev ? 'false' : 'false',
    DESKTOP_BUILD: 'true',
  };

  backendProcess = fork(serverEntry, [], {
    cwd: backendDir,
    env,
    stdio: 'inherit',
  });

  backendProcess.on('exit', (code, signal) => {
    backendProcess = null;
    if (!isQuitting) {
      dialog.showErrorBox(
        'Food & Beverage POS',
        `The local API process exited unexpectedly (code: ${code ?? 'unknown'}, signal: ${signal ?? 'n/a'}).`
      );
      app.quit();
    }
  });

  backendProcess.on('error', (err) => {
    dialog.showErrorBox('Food & Beverage POS', `Failed to start local API: ${err.message}`);
    app.quit();
  });
}

function stopBackend() {
  if (backendProcess) {
    backendProcess.removeAllListeners('exit');
    backendProcess.kill('SIGTERM');
    backendProcess = null;
  }
}

function waitForBackend(retries = 60, delayMs = 250) {
  return new Promise((resolve, reject) => {
    const attempt = (remaining) => {
      const req = http
        .get(`${BACKEND_ORIGIN}/health`, (res) => {
          res.resume();
          if (res.statusCode === 200) {
            resolve();
          } else if (remaining <= 0) {
            reject(new Error(`API responded with status ${res.statusCode}`));
          } else {
            setTimeout(() => attempt(remaining - 1), delayMs);
          }
        })
        .on('error', () => {
          if (remaining <= 0) {
            reject(new Error('Timed out waiting for local API to start.'));
          } else {
            setTimeout(() => attempt(remaining - 1), delayMs);
          }
        });

      req.end();
    };

    attempt(retries);
  });
}

async function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    backgroundColor: '#0b1120',
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      sandbox: false,
    },
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  const devServerUrl = process.env.REACT_DEV_SERVER_URL;
  if (isDev && devServerUrl) {
    await mainWindow.loadURL(devServerUrl);
    mainWindow.webContents.openDevTools({ mode: 'detach' });
    return;
  }

  const indexPath = path.join(__dirname, 'app', 'index.html');
  if (!fs.existsSync(indexPath)) {
    throw new Error(
      'Unable to find desktop/app/index.html. Please run "npm run build:frontend" from the desktop folder.'
    );
  }

  await mainWindow.loadFile(indexPath);
}

async function boot() {
  try {
    const backendDir = resolveBackendDir();
    startBackend(backendDir);
    await waitForBackend();
    await createMainWindow();
  } catch (err) {
    dialog.showErrorBox('Food & Beverage POS', err.message);
    app.quit();
  }
}

app.whenReady().then(boot);

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow().catch((err) => {
      dialog.showErrorBox('Food & Beverage POS', err.message);
    });
  }
});

app.on('before-quit', () => {
  isQuitting = true;
  stopBackend();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
