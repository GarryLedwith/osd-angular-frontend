# ATU Lab Equipment Loaner — Angular Frontend

![CI / CD](https://github.com/GarryLedwith/osd-angular-frontend/actions/workflows/ci.yml/badge.svg)

Angular 20 frontend for the ATU Lab Equipment Loaner system, containerised with Docker and deployed to Railway.

## Deployment

| Service          | URL |
| ---------------- | --- |
| Angular Frontend | https://atu-loaner-frontend-production.up.railway.app |
| Express API      | https://osd-project-api-production.up.railway.app |
| Lambda Endpoint  | https://bvukez92l4.execute-api.eu-west-1.amazonaws.com/prod |

## Development server

```bash
npm install
ng serve
```

Open `http://localhost:4200/`.

## Running unit tests

```bash
# Angular
ng test

# Lambda (from lambda/ directory)
cd lambda && npm test
```

## Production build

```bash
ng build --configuration production
```

## Docker

```bash
# Build
docker build -t atu-loaner-frontend .

# Run locally
docker run -p 8080:80 atu-loaner-frontend
```
