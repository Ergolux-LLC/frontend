FROM node:20

WORKDIR /app

COPY ../app/package.json ../app/package-lock.json ./
RUN npm install

COPY ../app .

CMD ["npx", "vite", "--host", "0.0.0.0", "--port", "5173"]