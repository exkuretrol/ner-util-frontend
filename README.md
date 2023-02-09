# How to use this image

## via docker-compose

Example `docker-compose.yml`:
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
