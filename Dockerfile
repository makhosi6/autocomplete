FROM node:16-alpine

RUN mkdir -p /home/app/node_modules && chown -R node:node /home/app

FROM node:16

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

ENV PORT=3001

EXPOSE 3001

CMD [ "node", "build/src/http.js" ]
