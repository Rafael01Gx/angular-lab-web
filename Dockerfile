FROM node:22-slim  AS builder

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install --quiet --no-fund --log-level=error

COPY . .
RUN npm run build:ssr

FROM node:22-alpine AS production

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/dist/angular-lab-web /usr/src/app/dist/angular-lab-web

COPY --from=builder /usr/src/app/package*.json ./

RUN npm install --omit=dev --no-fund --log-level=error

EXPOSE 4000

CMD ["npm", "run", "serve:ssr:angular-lab-web"]
