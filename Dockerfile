FROM node:16-alpine

RUN mkdir -p /home/app/node_modules && chown -R node:node /home/app

WORKDIR /home/app

COPY package*.json ./

USER node

RUN npm install

COPY . .

EXPOSE 3001

CMD [ "node", "build/src/http.js" ]
