import { defineConfig } from "vite";

export default defineConfig({
  server: {
    port: 3002, // Forces Vite to use 3002 inside the container
    strictPort: true, // Ensures it doesn’t switch to another port
    host: "0.0.0.0", // Makes it accessible from Docker
  },
});
