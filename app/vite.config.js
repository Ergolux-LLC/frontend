import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  root: __dirname,
  server: {
    host: true,
    port: 5173,
    allowedHosts: ["app.ergolux.io.localhost"],
    historyApiFallback: true,
    proxy: {
      "/api": {
        target: "http://app.ergolux.io.localhost",
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      "@views": path.resolve(__dirname, "src/content/views"),
      "@content": path.resolve(__dirname, "src/content/home"),
      "@pageMaker": path.resolve(__dirname, "src/packages/pageMaker"),
      "@api": path.resolve(__dirname, "src/api"),
    },
  },
  build: {
    rollupOptions: {
      input: path.resolve(__dirname, "main.js"),
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    include: ["**/*.{test,spec}.{js,ts,jsx,tsx}"],
    exclude: ["node_modules", "dist"],
  },
});
