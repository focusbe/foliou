FROM nginx:alpine
COPY demos/src/ /usr/share/nginx/html/
EXPOSE 80
