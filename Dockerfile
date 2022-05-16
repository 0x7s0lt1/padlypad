# syntax=docker/dockerfile:1
FROM nikolaik/python-nodejs:python3.7-nodejs12-stretch
RUN apt update -y && apt install -y libxtst-dev libpng++-dev make gcc
#ENV NODE_ENV=production
WORKDIR /app
COPY ["package.json", "package-lock.json*", "./"]
RUN npm install
COPY . .
CMD ["node","index.js"]