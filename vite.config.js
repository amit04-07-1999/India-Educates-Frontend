import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from "fs";

// https://vitejs.dev/config/
export default defineConfig({
  base: "/",
  plugins: [react()],
  optimizeDeps: {
    include: ["fabric"],
  },
  server: {
    host: "192.168.1.24",
    port: 3000,
    https: {
      key: fs.readFileSync("../BACKEND/certificates/key.pem"),
      cert: fs.readFileSync("../BACKEND/certificates/cert.pem"),
    },
  },
});
