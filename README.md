# RouteWise

RouteWise is a map-based delivery route optimizer for planning practical driver
routes. Move delivery stops on the map, update their addresses automatically,
and let the backend return an optimized road route with distance and duration.

The project is built as a React + Leaflet frontend backed by a FastAPI service.
It uses OpenStreetMap tiles, Nominatim for reverse geocoding, and OSRM for
road-aware routing data.

## What it does

- Displays a depot and delivery stops on an interactive map.
- Supports draggable stop pins for quick location changes.
- Accepts between 3 and 10 delivery stops per route.
- Reverse-geocodes moved pins into readable addresses.
- Validates stop data and duplicate IDs through the API.
- Calculates an ordered route and draws the returned road geometry.
- Shows route distance and estimated travel duration.

## Tech stack

| Area | Technology |
| --- | --- |
| Frontend | React, Vite, Leaflet, React Leaflet |
| Backend | Python, FastAPI, Pydantic, Uvicorn |
| Map data | OpenStreetMap |
| Geocoding | Nominatim |
| Routing | OSRM |

## Quick start

### 1. Start the backend

Use Python 3.12 or newer:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

The API will be available at `http://127.0.0.1:8000`. Visit
`http://127.0.0.1:8000/docs` for interactive API documentation.

### 2. Start the frontend

Open a second terminal in the project root:

```powershell
npm install
npm run dev
```

Open the local Vite address, normally `http://localhost:5173`.

The frontend uses `http://127.0.0.1:8000` by default. To use another API
address, set `VITE_API_BASE_URL` before starting Vite:

```powershell
$env:VITE_API_BASE_URL = "http://localhost:8000"
npm run dev
```

## API endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/health` | Confirms that the API is running |
| `POST` | `/routes/validate` | Validates a depot and 3-10 delivery stops |
| `POST` | `/routes/optimize` | Returns ordered stops and road geometry |
| `GET` | `/geocode/reverse` | Converts coordinates into an address |

Example health response:

```json
{"status":"ok","service":"routewise-api"}
```

## Project structure

```text
.
├── backend/
│   ├── app/main.py                  # FastAPI routes and CORS configuration
│   ├── app/schemas.py               # Request and response models
│   └── app/services/
│       ├── geocoding.py             # Nominatim reverse geocoding
│       └── route_optimizer.py       # OSRM routing and route ordering
├── src/
│   ├── App.jsx                      # Main interface and map workflow
│   ├── api/routeApi.js              # Frontend API client
│   ├── data/stops.js                # Example route data
│   └── styles.css                   # Application styles
├── index.html
├── package.json
└── README.md
```

## External service notes

This local demo uses public OpenStreetMap ecosystem services. Nominatim asks
clients to identify themselves and limit requests to one per second. Public
OSRM and Nominatim services are not intended to be treated as production
infrastructure; use a managed or self-hosted provider for a deployed product.

## Development commands

```powershell
npm run dev       # Start the frontend development server
npm run build     # Create a production frontend build
npm run preview   # Preview the production build locally
```

## License

No license has been selected for this project yet. Until one is added, the
repository should be treated as source-available rather than open source.
