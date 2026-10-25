# The public website, built with Hugo and served as static files. The guides under content/docs are
# committed, so this does not need the openvireo checkout or Asciidoctor.
FROM node:24-bookworm-slim AS build

# Hugo extended (the stylesheets go through css.Sass); hugo.toml needs 0.168 or later
ARG HUGO_VERSION=0.168.0
ARG TARGETARCH
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates curl \
    && curl -fsSL "https://github.com/gohugoio/hugo/releases/download/v${HUGO_VERSION}/hugo_extended_${HUGO_VERSION}_linux-${TARGETARCH}.tar.gz" \
       | tar -xz -C /usr/local/bin hugo \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . ./

# Links and assets are absolute, so the base URL must be where the browser opens the site
ARG BASE_URL=http://localhost:1313/
# Where the site's Sign in / Create account links go (the openvireo-web app)
ARG WEB_APP_URL=http://localhost:3000/
RUN HUGO_PARAMS_WEBAPPURL="${WEB_APP_URL}" hugo --minify --baseURL "${BASE_URL}"

FROM nginx:1.27-bookworm
COPY --from=build /app/public /usr/share/nginx/html
RUN printf 'server {\n  listen 1313;\n  root /usr/share/nginx/html;\n  error_page 404 /404.html;\n}\n' \
    > /etc/nginx/conf.d/default.conf
EXPOSE 1313
