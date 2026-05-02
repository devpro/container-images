import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "dist",
    sourcemap: false, // disable in prod; enable if you ship source maps to a separate service
    rollupOptions: {
      output: {
        // Split vendor chunk for better caching
        manualChunks: {
          vendor: ["react", "react-dom"],
        },
      },
    },
    // Warn if any chunk exceeds 500 kB
    chunkSizeWarningLimit: 500,
  },
  server: {
    port: 5173,
    strictPort: true,
    host: true, // needed for Docker dev
  },
  preview: {
    port: 4173,
    strictPort: true,
    host: true,
  },
});
