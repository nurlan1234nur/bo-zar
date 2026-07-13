import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig(({ command }) => ({
  plugins: [react()],
  // Required in this workspace sandbox: Vite dev's dependency optimizer follows pnpm
  // symlink parents and hits directories outside the readable project tree.
  optimizeDeps:
    command === "serve"
      ? {
          disabled: true,
          include: [],
          noDiscovery: true,
        }
      : {
          include: [],
          noDiscovery: true,
        },
}));
