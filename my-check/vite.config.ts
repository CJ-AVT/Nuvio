import { nuvio } from "@nuvio/vite-plugin";import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), nuvio()], optimizeDeps: { exclude: ["@nuvio/overlay"] }
});
