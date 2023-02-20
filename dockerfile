FROM node:16-alpine AS BUILD

WORKDIR /src
COPY package*.json ./
COPY .env ./
RUN npm install
COPY . .
ENV SOUNDCLOUD_CLIENT_ID=$SOUNDCLOUD_CLIENT_ID \
    SOUNDCLOUD_CLIENT_SECRET=$SOUNDCLOUD_CLIENT_SECRET
RUN npm run build

FROM node:16-alpine AS RUNTIME

WORKDIR /app
COPY --from=BUILD /src/node_modules /app/node_modules
COPY --from=BUILD /src/lib /app
COPY --from=BUILD /src/.env /app
EXPOSE 4000
CMD ["node", "index.js"]