FROM node:16-alpine

RUN apk add --no-cache chromium nss freetype harfbuzz ca-certificates ttf-freefont udev xvfb x11vnc fluxbox dbus
RUN apk add --no-cache --virtual .build-deps curl \
    && echo "http://dl-cdn.alpinelinux.org/alpine/edge/main" >> /etc/apk/repositories \
    && echo "http://dl-cdn.alpinelinux.org/alpine/edge/community" >> /etc/apk/repositories \
    && echo "http://dl-cdn.alpinelinux.org/alpine/edge/testing" >> /etc/apk/repositories \
    && apk add --no-cache curl wget \
    && apk del .build-deps  # puppeteer 다운로드를 위해 필요한 라이브러리들을 설치하고 마지막에는 빌드를 위해 추가적으로 설치한 패키지들을 삭제

ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser 
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true 
ENV DISPLAY=:99  

WORKDIR /app

# COPY package.json and package-lock.json files
COPY package*.json ./
# generated prisma files
COPY prisma ./prisma/
# COPY tsconfig.json file
COPY tsconfig.json ./

RUN npm install

# COPY
COPY . .

# prisma generate 실행
RUN npx prisma generate

# Run and expose the server on port 3000
EXPOSE 3000
# A command to start the server

CMD ["npm", "run", "start:prod"]
