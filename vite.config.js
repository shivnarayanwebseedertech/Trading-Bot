import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
// vite.config.js
export default {
  server: {
    watch: {
      ignored: ["**/logs/**", "**/tmp/**"],
    },
  },
};
