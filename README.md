<div align="center">
  <img height="130" src="art/logo.svg" alt="LOGO" />
  <div style="text-center">Built by <img src="https://raw.githubusercontent.com/stevenrskelton/flag-icon/master/png/16/country-4x3/vn.png"/> with passion</div>
</div>

[![Go](https://github.com/tructn/racket/actions/workflows/go.yml/badge.svg)](https://github.com/tructn/racket/actions/workflows/go.yml) 
[![CodeQL Advanced](https://github.com/tructn/racket/actions/workflows/codeql.yml/badge.svg)](https://github.com/tructn/racket/actions/workflows/codeql.yml)

## Overview
A hobby project for personal usage, for amature badminton player self-organized group, manage players, courts, costs

## Demo

![demo](art/iPad-PRO-11-booking.png "Booking")

![demo](art/iPad-PRO-11-dashboard.png "Dashboard")

![demo](art/iPad-PRO-11-players.png "Players")

![demo](art/iPad-PRO-11-matches.png "Matches")

![demo](art/iPad-PRO-11-mark-as-paid.png "Mark as paid")

![demo](art/iPad-PRO-11-sportcenters.png "Sport Centers")

## Usage
### Environment Variables

Backend
```
DB=postgres://postgres:admin@localhost:5434/racket?sslmode=disable
AUTH0_ISSUER_URL=
AUTH0_AUDIENCE=
```
Frontend
```
VITE_API_URL=http://localhost:8000
VITE_AUTH0_DOMAIN=
VITE_AUTH0_CLIENTID=
VITE_AUTH0_AUDIENCE=
```
## Docker
```bash
docker compose up
```

## Roadmap
- ✅ Auth0 Integration
- ✅ Docker support
- ✅ Registration dashboard  
- ✅ Players management
- ✅ Matches management
- ✅ Duplicate match
- ✅ Unpaid report
- ✅ Support cost management
- ✅ Support anonymously view outstanding report
- 🚧 Support notification (Facebook Messenger, Email, Push Notification)
- 🚧 Monzo API Integration
- 🚧 Support Mobile Devices (iOS, Android)
- 🚧 Testing high coverage

## Stack
- Golang Gin
- GORM with Postgres
- Auth0
- React
- Tailwindcss
- Dayjs
- Mantine UI
- Numerable


## Dev Guidline
### Run test
```bash
go test -v ./...
go test -v -cover ./...
```

## Hosting
- Backend: https://www.koyeb.com/
- Frontend: https://vercel.com/
