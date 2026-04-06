FROM node:18-alpine
WORKDIR /app
COPY demos-esm/package*.json ./
RUN npm install
COPY demos-esm/ .
RUN npm run build
EXPOSE 3000
CMD ["node", "server.js"]