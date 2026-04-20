FROM node:20-bookworm-slim

WORKDIR /app

COPY package.json /app/package.json
COPY package-lock.json /app/package-lock.json
RUN npm ci --omit=dev

COPY index.html /app/index.html
COPY add.html /app/add.html
COPY script.js /app/script.js
COPY style.css /app/style.css
COPY server.js /app/server.js

RUN mkdir -p /app/data /app/uploads

EXPOSE 3000

CMD ["npm", "start"]
