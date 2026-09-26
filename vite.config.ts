import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from "path"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // NOTE: deliberately no `manualChunks` for sigma/graphology/elkjs.
    // Hoisting them into a named chunk makes Rollup treat it as shared by the
    // entry graph, which emits a <link rel="modulepreload"> and eagerly pulls
    // ~1.5MB on first paint -- exactly what the lazy route was avoiding.
    // YamlViz's route-level `lazy()` already keeps this stack out of the
    // initial load.
    chunkSizeWarningLimit: 1200,
  },
})
