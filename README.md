# Secret-agent-data-log

Alle gebruikers zien nu dezelfde data:
- leaks staan in een SQLite database
- uploads (afbeeldingen) staan als losse bestanden op schijf

Daardoor werkt de app niet meer met localStorage per browser, maar centraal via een API.

## Docker

Build image:

```bash
docker build -t secret-agent-data-log .
```

Run container:

```bash
docker run --rm -p 8080:3000 secret-agent-data-log
```

Open daarna: http://localhost:8080

## Docker Compose

Start lokaal met persistente data-volumes:

```bash
docker compose up -d --build
```

Stoppen:

```bash
docker compose down
```

Volledig resetten inclusief database + uploads:

```bash
docker compose down -v
```

De app draait standaard op: http://localhost:8081

Optioneel andere poort:

```bash
APP_PORT=8080 docker compose up -d --build
```

## Data-opslag

In de container:
- SQLite: `/app/data/leaks.db`
- Uploads: `/app/uploads`

In compose worden deze paden gekoppeld aan volumes:
- `db_data`
- `uploads_data`
