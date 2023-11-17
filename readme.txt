utilizei o docker-compose.yml para configurar coisas como network e autenticacao

- docker compose up -d
- docker exec -it mongo sh

conectei no MongoDB compass com
mongodb://root:toor@localhost:27017/?authSource=admin&readPreference=primary&appname=MongoDB%20Compass&directConnection=true&ssl=false
