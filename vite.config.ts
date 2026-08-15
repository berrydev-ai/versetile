import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

// `npm run dev` binds to 0.0.0.0 (see the --host flag in package.json) so the dev
// server is reachable from a phone on the same wifi. Note that this alone does NOT
// unlock the microphone: getUserMedia needs a secure context, which means https or
// localhost. http://192.168.x.x is neither. Real-device Looper testing goes through
// the deployed Netlify URL, not the LAN dev server.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    port: 5173,
  },
  build: {
    outDir: "dist",
    sourcemap: true,
  },
});
