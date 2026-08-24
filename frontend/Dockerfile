FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 4200

# Angular CLI escuchando en todas las interfaces de red para el contenedor
CMD ["npx", "ng", "serve", "--host", "0.0.0.0", "--poll", "2000"]
