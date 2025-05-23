
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

## Exemplo de chamada via curl

```bash
curl -X POST -F "kmlfile=@example/morro-santana.kml" http://localhost:8084/upload
```

## Testar o servidor remoto

```bash
curl -X POST -F "kmlfile=@morro-santana.kml" https://geoserver-api-extension.terrakrya.com/upload
```

# Deploy no servidor 

Para fazer o deploy da aplicação, faça o commit na branch main e execute os seguintes comandos para publicar:

$ ssh deployer@geo.terrakrya.com
$ cd geoserver-api-extension/
$ git pull
$ docker compose build
$ docker compose up -d
