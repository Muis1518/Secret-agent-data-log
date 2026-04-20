# Secret-agent-data-log
Hier is te alles te zien wat de secret agent vind en wat het er mee heeft gedaan 

## Docker

Build image:

```bash
docker build -t secret-agent-data-log .
```

Run container:

```bash
docker run --rm -p 8080:80 secret-agent-data-log
```

Open daarna: http://localhost:8080

## GitHub Container Registry (GHCR)

Er staat nu een workflow in `.github/workflows/publish-ghcr.yml`.

Deze workflow:
- Bouwt de Docker image bij push naar `main` of `master`
- Bouwt en pusht ook op tags zoals `v1.0.0`
- Publiceert de image naar GHCR als:

```text
ghcr.io/<owner>/secret-agent-data-log
```

Voorbeelden na een succesvolle workflow run:

```bash
docker pull ghcr.io/<owner>/secret-agent-data-log:latest
docker run --rm -p 8080:80 ghcr.io/<owner>/secret-agent-data-log:latest
```
