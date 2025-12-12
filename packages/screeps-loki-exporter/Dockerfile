FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production

# Copy package files and install production dependencies only
COPY package*.json ./
RUN npm ci --omit=dev

# Copy pre-built application
COPY dist ./dist

CMD ["node", "dist/index.js"]
