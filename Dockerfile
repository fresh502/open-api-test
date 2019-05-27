FROM node:10

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install -g mocha mocha-jenkins-reporter
RUN npm ci --only=production

COPY . ./

EXPOSE 8090
CMD ["npm", "start"]
