FROM postgres:15.0-alpine3.16
ENV POSTGRES_USER dev
ENV POSTGRES_PASSWORD dev
ENV POSTGRES_DB robotDB
ADD ./scripts/*.sql /docker-entrypoint-initdb.d/