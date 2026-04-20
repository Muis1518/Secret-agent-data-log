FROM nginx:1.27-alpine

# Serve the static website with nginx
COPY index.html /usr/share/nginx/html/index.html
COPY add.html /usr/share/nginx/html/add.html
COPY script.js /usr/share/nginx/html/script.js
COPY style.css /usr/share/nginx/html/style.css

EXPOSE 80
