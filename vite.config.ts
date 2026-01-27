import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    // Prevent "Invalid hook call" by ensuring a single React copy is used
    // across dependencies (React Query, Embla wrappers, etc.).
    dedupe: ["react", "react-dom"],
  },
  optimizeDeps: {
    // Helps Vite prebundle these consistently (avoids duplicate React instances in dev).
    include: ["react", "react-dom"],
  },
}));
