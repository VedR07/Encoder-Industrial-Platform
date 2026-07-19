FROM node:18-alpine

WORKDIR /app

COPY package.json ./
# If package-lock.json exists, npm ci is preferred, but npm install is safer if missing
RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
