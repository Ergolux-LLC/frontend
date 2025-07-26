# newest stable tag at 2025‑07‑25
FROM node:22-slim

WORKDIR /app

# --- copy only the manifests first so layer caching works
COPY ../app/package.json ../app/package-lock.json ./

# --- install deps for the *container’s* CPU/OS
RUN npm ci --include=optional --no-audit --loglevel=error

# --- bring in the rest of the source (but never host node_modules, thanks to .dockerignore)
COPY ../app .

EXPOSE 5173
CMD ["npx", "vite", "--host", "0.0.0.0", "--port", "5173"]
