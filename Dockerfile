##
# Production Dockerfile
##

###
# Base image declaration
###
FROM node:20.5-alpine AS base

ENV APPDIR /app

###
# Client build stage
###
FROM base AS client-build

WORKDIR ${APPDIR}/client

COPY client/package*.json ./
RUN npm ci

COPY interfaces ../interfaces
COPY client ./
RUN npm run build

###
# Server build stage
###
FROM base AS server-build

WORKDIR ${APPDIR}/server

# Tell Puppeteer to skip installing Chrome. We'll be using the installed package.
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

COPY server/package*.json ./
RUN npm ci

COPY interfaces ../interfaces
COPY server ./
RUN npm run build
RUN rm -r src

###
# Main image build
###
FROM base AS main

# Install all dependencies (GDAL & others for Puppeteer)
RUN apk update && apk add \
  gdal-tools \
  chromium \
  nss \
  freetype \
  harfbuzz \
  ca-certificates \
  ttf-freefont

WORKDIR ${APPDIR}

COPY --from=server-build ${APPDIR}/server ./
COPY --from=client-build ${APPDIR}/client/dist ./static/

ENV TZ=Europe/Helsinki

# Define Chromium path, as it was not installed in the previous phase
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

CMD npm start
