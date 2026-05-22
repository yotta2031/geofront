FROM node:22-alpine
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install --omit=dev
COPY dist ./dist
COPY .env.example .env.example
ENV NODE_ENV=production
EXPOSE 3001
CMD ["node", "dist/index.js"]
