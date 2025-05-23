FROM node:20-slim

WORKDIR /app

# Instala dependências do sistema e GDAL (inclui ogr2ogr)
RUN apt-get update && \
    apt-get install -y gdal-bin python3-gdal && \
    rm -rf /var/lib/apt/lists/*

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 8084

CMD ["node", "server.js"] 