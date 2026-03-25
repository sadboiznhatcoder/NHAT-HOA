import { contextBridge } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  // Add backend bridge functions here if need arise
});
