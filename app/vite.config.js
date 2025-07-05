import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  server: {
    host: true,
    port: 80,
    allowedHosts: ["app.ergolux.io.localhost"],
    historyApiFallback: true,
  },
  resolve: {
    alias: {
      "@views": path.resolve(__dirname, "src/ui/views"),
    },
  },
  proxy: {
    "/api": {
      target: "http://app.ergolux.io.localhost",
      changeOrigin: true,
    },
  },
});
