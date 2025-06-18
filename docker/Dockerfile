FROM node:22.0.0-alpine
WORKDIR /app
COPY --chown=node:node ./src ./package*.json ./tsconfig.json /app/
RUN npm i
USER node
CMD [ "npx", "nodemon", "src/app.ts" ]