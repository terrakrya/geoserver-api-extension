# Servidor de Upload e Validação de Arquivos KML
Esta aplicação é um servidor HTTP construído com Node.js e Express que roda na porta 8084, que expõe um único endpoint `POST /upload` para receber arquivos no formato `.kml` (Keyhole Markup Language). Ao receber um arquivo, o sistema realiza as seguintes operações:

1. **Validação da extensão**: Apenas arquivos com a extensão `.kml` são aceitos.
2. **Armazenamento seguro**: O arquivo é salvo em um diretório local específico (`uploads/`) com nome único baseado em timestamp.
3. **Validação do conteúdo**: O conteúdo do arquivo é analisado para verificar se possui uma estrutura XML válida e se contém a tag raiz `<kml>`, garantindo que o arquivo seja realmente um KML válido.
4. **Resposta apropriada**: O sistema retorna mensagens de sucesso ou erro, informando claramente se o arquivo foi aceito e validado ou se foi rejeitado.

## Tecnologias utilizadas:

* Node.js
* Express
* Multer (upload de arquivos)
* xml2js (validação de XML)
* fs (manipulação de arquivos)

## Finalidade:
Esse projeto é útil como base para aplicações geoespaciais, sistemas de importação de dados geográficos ou qualquer aplicação que precise validar e processar arquivos KML enviados por usuários.

## Build Setup

```bash
# set node version
$ nvm use 22.14

# install dependencies
$ yarn

# serve local
$ node server.js
```

## Exemplo de chamada curl
```bash
curl -X POST -F "kmlfile=@example/morro-santana.kml" http://localhost:8084/upload
```

## Instalação em produção
```bash
# 1 - Instalar o nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
~/.bashrc
export NVM_DIR="$HOME/.nvm" [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# 2 - Instalar o node
nvm install --lts
nvm use --lts

node -v
npm -v

# 3 - Instalar o pm2 globalmente
npm install -g pm2

# 4 - Instalar o projeto
https://github.com/terrakrya/geoserver-api-extension.git
cd geoserver-api-extension
npm install
pm2 start server.js --name "kml-api"
pm2 save
pm2 startup
```

## Testar o servidor remoto
```bash
curl -X POST -F "kmlfile=@morro-santana.kml" http://geo.terrakrya.com:8084/upload
```