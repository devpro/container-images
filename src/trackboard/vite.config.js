import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      // In dev, forward /api calls to the Express server on port 3000
      "/api": { target: "http://localhost:3000", changeOrigin: true },
      "/healthz": { target: "http://localhost:3000", changeOrigin: true },
    },
  },
  build: {
    outDir: "dist",
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: { vendor: ["react", "react-dom"] },
      },
    },
  },
});
