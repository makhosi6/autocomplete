FROM node:16-alpine
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm i
RUN cat package.json
RUN npm run compile
COPY . .
EXPOSE 3001
CMD [ "npm", "http" ]
