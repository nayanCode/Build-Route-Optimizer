# RouteWise backend — step 1

This folder contains the Python API that will later handle geocoding, OSRM
driving times, and Google OR-Tools optimization. It currently exposes a health
check and validates delivery-stop data from React.

## Files

- `requirements.txt` — Python packages needed to run the API.
- `app/__init__.py` — identifies `app` as a Python package.
- `app/main.py` — creates the FastAPI app, permits calls from the Vite frontend,
  and defines the API endpoints.
- `app/schemas.py` — describes a depot and delivery stop, including coordinate
  limits and the rule that a route has 3–10 stops.
- `app/services/geocoding.py` — calls OpenStreetMap Nominatim to convert a pin
  coordinate into a readable address, while limiting this local demo to one
  request per second.

## Run after installing Python 3.12+

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Open `http://127.0.0.1:8000/health`. It should return:

```json
{"status":"ok","service":"routewise-api"}
```

Interactive API documentation is available at `http://127.0.0.1:8000/docs`.

## Reverse geocoding note

`GET /geocode/reverse?latitude=19.0619&longitude=72.8995` looks up the nearest
address through the public Nominatim service. It is appropriate for this
low-volume local demo only. Its public usage policy requires an identifying
User-Agent and a maximum of one request per second; use a dedicated provider or
self-hosted service before production.
