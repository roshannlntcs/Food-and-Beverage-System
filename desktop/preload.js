const { contextBridge } = require('electron');

const BACKEND_PORT = Number(process.env.BACKEND_PORT || 4870);

contextBridge.exposeInMainWorld('desktop', {
  isDesktop: true,
  backendOrigin: `http://127.0.0.1:${BACKEND_PORT}`,
});
