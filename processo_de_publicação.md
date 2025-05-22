Acessível via:
https://geoserver-api-extension.terrakrya.com/

Geoserver:
https://geo.terrakrya.com/geoserver

Passos executados:

Criados os arquivos de Docker nesse projeto:
    Dockerfile
    docker-compose.yml
    .dockerignore


Acessei por ssh o servidor

$ ssh deployer@geo.terrakrya.com

(OBS: Antes disso precisei mover a aplicação do /root/geoserver-api-extension para o /home/deployer/geoserver-api-extension)
(OBS2: Precisei também adicionar as nossas chaves ssh no servidor para o usuário deployer)

Depois de acessar o servidor, precisei instalar atualizar a aplicação rodando os comandos:

$ cd geoserver-api-extension/   
$ git pull
$ docker compose build
$ docker compose up -d

Depois configurei o nginx para redirecionar o tráfego para o nosso serviço:

vim ../nginx/conf.d/default.conf 
Adicionei a seguinte configuração:

server {
    listen 80;
    server_name geoserver-api-extension.terrakrya.com;

    # Configuração específica para o desafio do Let's Encrypt
    location /.well-known/acme-challenge/ {
        root /usr/share/nginx/html;
        try_files $uri =404;
    }

    # Configuração para a API
    location / {
        proxy_pass http://geoserver-api-extension-api-1:8084;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

Reiniciei o nginx para aplicar as alterações:

$ docker restart nginx
$ docker exec nginx nginx -s reload

Depois executei o seguinte comando para gerar o certificado:

$ certbot update_account --email terrakrya@protonemail.com --config-dir ~/letsencrypt --work-dir ~/letsencrypt --logs-dir ~/letsencrypt
$ certbot certonly -v -n --agree-tos --email terrakrya@protonmail.com --webroot -w ~/acme-challenge -d geoserver-api-extension.terrakrya.com --config-dir ~/letsencrypt --work-dir ~/letsencrypt --logs-dir ~/letsencrypt

Com os certificados gerados, precisei configurar o nginx para usar o certificado:

vim ../nginx/conf.d/default.conf 

Depois reiniciei o nginx para aplicar as alterações:

$ docker exec nginx nginx -t
$ docker restart nginx
$ docker exec nginx nginx -s reload

Com isso, a aplicação está acessível via:
https://geoserver-api-extension.terrakrya.com/



Para fazer o deploy da aplicação, precisei executar os seguintes comandos:

$ ssh deployer@geo.terrakrya.com
$ cd geoserver-api-extension/
$ git pull
$ docker compose build
$ docker compose up -d


Adicionei isso no README.md












