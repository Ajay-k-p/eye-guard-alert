import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },

  plugins: [
    react(),
    // componentTagger(), // optional – keep if you use lovable
  ],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  /**
   * 🔴 REQUIRED FOR MEDIAPIPE ON VERCEL
   */
  optimizeDeps: {
    exclude: [
      "@mediapipe/face_mesh",
      "@mediapipe/camera_utils",
      "@mediapipe/drawing_utils",
    ],
  },
}));
