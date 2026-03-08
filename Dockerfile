FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run compile

EXPOSE 3001

CMD [ "node", "build/src/http.js" ]
