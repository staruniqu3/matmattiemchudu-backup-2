# Mat-Mat Customer Portal

A Flask web application for the Mat-Mat brand, providing:
- Customer membership lookup via Google Sheets integration
- Package tracking (via Google Sheets Sheet2)
- Event booking and order management

## Architecture

- **Framework:** Flask (Python)
- **Database:** SQLAlchemy with SQLite (default) or PostgreSQL (via `DATABASE_URL` env var)
- **Cache:** Flask-Caching (simple in-memory by default)
- **Google Sheets:** gspread + google-auth for customer data and tracking data

## Project Layout

```
app.py            # Flask app factory
main.py           # Entry point (dev server, port 5000)
startup.py        # Production startup helper
config.py         # App configuration (reads from env vars)
cache.py          # Flask-Caching setup
models.py         # SQLAlchemy models
blueprints/       # Flask blueprints
  customer.py     # /customer/ routes
  tracking.py     # /tracking/ routes
  booking.py      # /booking/ routes
services/         # Business logic
  google_sheets_service.py
  cache_service.py
  shipping_service.py
utils/            # Helpers and decorators
templates/        # Jinja2 HTML templates
static/           # CSS, JS, images
```

## Environment Variables

| Variable | Description |
|---|---|
| `GOOGLE_SHEETS_CREDENTIALS` | JSON string of Google service account credentials |
| `GOOGLE_SHEETS_SPREADSHEET_ID` | ID of the Google Spreadsheet |
| `DATABASE_URL` | PostgreSQL connection URL (optional, defaults to SQLite) |
| `SESSION_SECRET` | Flask session secret key |
| `GHN_API_KEY` | Giao Hang Nhanh shipping API key (optional) |
| `GHTK_API_KEY` | Giao Hang Tiet Kiem shipping API key (optional) |
| `VIETNAM_POST_API_KEY` | Vietnam Post shipping API key (optional) |

## Workflow

- **Start application:** `python main.py` — runs Flask dev server on port 5000

## Deployment

Configured for Autoscale deployment using:
```
gunicorn --bind=0.0.0.0:5000 --reuse-port app:app
```
