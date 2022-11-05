FROM node:16-alpine
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm i
COPY . .

EXPOSE 3001
CMD [ "npm", "http" ]
