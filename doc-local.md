# Guia de Execução Local

Este guia descreve os passos necessários para executar o projeto localmente, incluindo a configuração do GeoServer em Docker.

## Pré-requisitos

- Docker e Docker Compose instalados
- Node.js (versão 22.14)
- Yarn (gerenciador de pacotes)
- Git

## 1. Configuração do GeoServer

Primeiro, vamos configurar o GeoServer em Docker:

1. Crie um novo diretório para o GeoServer:
```bash
mkdir ~/geoserver-docker
cd ~/geoserver-docker
```

2. Crie um arquivo `docker-compose.yml` com o seguinte conteúdo:
```yaml
version: '3.8'

services:
  geoserver:
    image: kartoza/geoserver
    container_name: geoserver
    ports:
      - "8080:8080"
    environment:
      - GEOSERVER_ADMIN_PASSWORD=geoserver
      - GEOSERVER_ADMIN_USER=admin
    volumes:
      - geoserver_data:/opt/geoserver/data_dir
    networks:
      - terrakrya-geo_default

networks:
  terrakrya-geo_default:
    external: true

volumes:
  geoserver_data:
```

3. Crie a rede Docker necessária:
```bash
docker network create terrakrya-geo_default
```

4. Inicie o GeoServer:
```bash
docker compose up -d
```

5. Acesse o GeoServer em [http://localhost:8080/geoserver](http://localhost:8080/geoserver)
   - Usuário: `admin`
   - Senha: `geoserver`

> **Nota:** Se você já tentou acessar com outras credenciais, pode ser necessário remover o volume do GeoServer e recriar o container:
> ```bash
> docker compose down -v
> docker compose up -d
> ```

6. Crie um novo workspace chamado `terrakrya`:
   - Acesse o GeoServer
   - Vá em "Workspaces" > "Add new workspace"
   - Nome: `terrakrya`
   - Namespace URI: `http://terrakrya`
   - Marque como workspace padrão

## 2. Configuração do Projeto

1. Clone o repositório:
```bash
git clone https://github.com/terrakrya/geoserver-api-extension.git
cd geoserver-api-extension
```

2. Instale as dependências:
```bash
yarn install
```

3. Crie o arquivo `.env` na raiz do projeto:
```bash
cp .env.example .env
```

4. Edite o arquivo `.env` com as seguintes configurações:
```env
GEOSERVER_URL=http://geoserver:8080/geoserver
GEOSERVER_WORKSPACE=terrakrya
GEOSERVER_USER=admin
GEOSERVER_PASS=geoserver
UPLOAD_PATH=/opt/geoserver/data_dir/data
```

5. Crie o diretório de uploads:
```bash
mkdir -p uploads
```

## 3. Executando o Projeto

1. Inicie o servidor:
```bash
node server.js
```

O servidor estará rodando em `http://localhost:8084`

## 4. Testando o Upload

Você pode testar o upload de duas maneiras:

1. **Usando curl:**
```bash
curl -X POST -F "kmlfile=@example/morro-santana.kml" http://localhost:8084/upload
```

2. **Usando Postman ou Insomnia:**
   - Método: POST
   - URL: http://localhost:8084/upload
   - Body: form-data
   - Key: kmlfile
   - Value: [selecione seu arquivo .kml]

## 5. Verificando o Resultado

Após um upload bem-sucedido:
1. O arquivo será salvo no diretório `uploads/`
2. Uma cópia será enviada para o GeoServer
3. Um novo DataStore será criado
4. Um novo FeatureType (camada) será criado

Você pode verificar a camada criada no GeoServer:
1. Acesse [http://localhost:8080/geoserver](http://localhost:8080/geoserver)
2. Vá em "Layer Preview"
3. Procure pela camada criada no workspace `terrakrya`

## Solução de Problemas

### Erro de Conexão com GeoServer
- Verifique se o GeoServer está rodando: `docker ps | grep geoserver`
- Verifique se a rede Docker existe: `docker network ls | grep terrakrya-geo_default`
- Verifique se as credenciais no `.env` estão corretas

### Erro no Upload
- Verifique se o arquivo é um KML válido
- Verifique se o workspace `terrakrya` existe no GeoServer
- Verifique os logs do servidor para mais detalhes

### Erro de Permissão
- Verifique se o diretório `uploads/` tem permissões corretas
- Verifique se o volume do GeoServer tem permissões corretas

## Limpeza

Para parar todos os serviços:
```bash
# No diretório do GeoServer
cd ~/geoserver-docker
docker compose down
