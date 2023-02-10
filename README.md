# How to use this image

## via docker-compose

先建立一個資料夾，並取一個名字，例如`ner-util-frontend`，再來建立一個名為`node`的資料夾，將本 repo 放置於該資料夾中。再來將[資料表sql](https://aka.kuaz.dev/0vz)下載，放置於資料夾`sql`中。最後將下列的`docker-compose.yml`放置於根目錄`ner-util-frontend`中。

檔案 `docker-compose.yml`：
```yaml
version: '3.9'

services:
  node:
    build:
      context: node
      dockerfile: Dockerfile
    ports:
      - 3000:3000

  db:
    image: mariadb:latest
    restart: always
    environment:
      MARIADB_ROOT_PASSWORD: notSecureChangeMe
    volumes:
      - ./db:/var/lib/mysql
      - ./sql:/docker-entrypoint-initdb.d

  phpmyadmin:
    image: phpmyadmin:latest
    restart: always
    ports:
      - 8080:80
    environment:
      PMA_HOST: db
      PMA_PORT: 3306

```

完成後的資料夾結構如下：
```
ner-util-frontend
├── db
├── docker-compose.yml
├── node
└── sql
```

打開終端機，將工作目錄移到`ner-util-frontend`資料夾，並輸入：
```
docker compose up -d
```