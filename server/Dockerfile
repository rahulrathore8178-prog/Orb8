FROM node:24-alpine

WORKDIR /app

# Install dependencies first (better layer caching)
COPY package*.json ./
RUN npm ci --omit=dev

# Copy the rest of the backend code
COPY . .

ENV NODE_ENV=production
EXPOSE 5000

CMD ["node", "server.js"]