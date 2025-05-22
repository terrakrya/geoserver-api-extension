
# Servidor de Upload, Validação e Publicação de Arquivos KML

Esta aplicação é um servidor HTTP construído com Node.js e Express que roda na porta 8084 e expõe um único endpoint `POST /upload` para receber arquivos no formato `.kml` (Keyhole Markup Language).

Ao receber um arquivo, o sistema realiza as seguintes operações:

1. **Validação da extensão**: Apenas arquivos com a extensão `.kml` são aceitos.
2. **Armazenamento local seguro**: O arquivo é salvo em um diretório específico (`uploads/`) com nome gerado automaticamente com base no nome original e slug.
3. **Validação do conteúdo**: O conteúdo é verificado como XML válido e a presença da tag `<kml>` é obrigatória.
4. **Cópia para o GeoServer**: O arquivo é movido para o diretório utilizado pelo GeoServer para leitura de arquivos (via `.env`).
5. **Criação do DataStore no GeoServer**: Um DataStore com nome único é criado automaticamente via API REST.
6. **Criação do FeatureType (camada)**: A camada correspondente é registrada no workspace do GeoServer, tornando o KML acessível via WMS/WFS.
7. **Resposta apropriada**: O sistema retorna mensagens de sucesso ou erro, com detalhes da camada criada.

## Tecnologias utilizadas

- Node.js
- Express
- Multer (upload de arquivos)
- xml2js (validação de XML)
- slugify (normalização de nomes)
- Axios (requisições HTTP para o GeoServer)
- Dotenv (variáveis de ambiente)
- fs (manipulação de arquivos)

## Finalidade

Esse projeto serve como base para aplicações geoespaciais, como sistemas de mapeamento dinâmico, portais de dados geográficos e soluções que exigem upload e publicação automática de arquivos KML em um GeoServer.

## Build Setup

```bash
# set node version
$ nvm use 22.14

# install dependencies
$ yarn

# serve local
$ node server.js
```

## Arquivo .env

Crie um arquivo `.env` na raiz do projeto e inclua o login e senha do Geoserver
```bash
cp .env.example .env
```

> Certifique-se de que o `UPLOAD_PATH` seja o mesmo diretório monitorado pelo GeoServer no DataStore.

## Exemplo de chamada via curl

```bash
curl -X POST -F "kmlfile=@example/morro-santana.kml" http://localhost:8084/upload
```

## Instalação em produção

```bash
# 1 - Instalar o nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc

# 2 - Instalar o node
nvm install --lts
nvm use --lts

# 3 - Instalar o pm2 globalmente
npm install -g pm2

# 4 - Clonar e instalar o projeto
git clone https://github.com/terrakrya/geoserver-api-extension.git
cd geoserver-api-extension
npm install

# 5 - Configurar e iniciar o processo com PM2
pm2 start server.js --name "kml-api"
pm2 save
pm2 startup
```

## Liberar a porta 8084

```bash
sudo ufw allow 8084
```

## Testar o servidor remoto

```bash
curl -X POST -F "kmlfile=@example/morro-santana.kml" http://geo.terrakrya.com:8084/upload
```