import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: "/",
  build: {
    // Increase chunk limit to avoid warnings
    chunkSizeWarningLimit: 1000, 
    rollupOptions: {
      output: {
        // This stops the builder from crashing by splitting 
        // the heavy Monaco Editor into its own separate chunk
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("monaco-editor")) {
              return "monaco";
            }
            return "vendor";
          }
        },
      },
    },
  },
  server: {
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "require-corp",
    },
  },
});