FROM node:8

# Create app directory
WORKDIR /usr/src/app

COPY package*.json ./
COPY credentials.json ./

RUN npm install

COPY . .

EXPOSE 3000
CMD [ "npm", "start" ]