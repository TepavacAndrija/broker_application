FROM node:22.14.0-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build -- --configuration production

# FROM nginx:alpine
# COPY --from=build /app/dist/frontend /usr/share/nginx/html
# COPY nginx.conf /etc/nginx/nginx.conf
# EXPOSE 80
# CMD ["nginx", "-g", "daemon off;"]

FROM node:22.14.0-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
RUN npm install -g @angular/cli
COPY . .
RUN npm run build -- --configuration production
EXPOSE 4200
CMD ["ng", "serve", "--host", "0.0.0.0", "--port", "4200", "--poll", "2000"]


# RUN npm install -g @angular/cli

# COPY --from=build /app/node_modules ./node_modules
# COPY --from=build /app ./

# EXPOSE 4200

# CMD ["ng", "serve", "--host", "0.0.0.0", "--poll", "2000"]