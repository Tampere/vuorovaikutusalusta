##
# Production Dockerfile
##

###
# Base image declaration
###
FROM node:14.17.1-alpine AS base

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
# Install GDAL dependence
RUN apk update && apk add gdal

WORKDIR ${APPDIR}

COPY --from=server-build ${APPDIR}/server ./
COPY --from=client-build ${APPDIR}/client/dist ./static/

CMD npm start
