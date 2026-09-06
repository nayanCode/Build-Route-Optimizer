# RouteWise frontend

The first frontend milestone for a delivery-route optimizer. It displays a real
OpenStreetMap base map, one depot, and ten draggable delivery-stop pins around
Bengaluru.

## Run it

```powershell
npm run dev
```

Then open the local address shown by Vite (normally `http://localhost:5173`).

## Files in this milestone

- `package.json` — project scripts and React, Leaflet, and Vite dependencies.
- `index.html` — the single HTML page Vite uses to mount the application.
- `src/main.jsx` — starts React and imports the Leaflet and application styles.
- `src/App.jsx` — page layout, map, draggable markers, route-preview state, and controls.
- `src/data/stops.js` — initial depot and ten example deliveries.
- `src/styles.css` — responsive visual design for the sidebar, controls, and map.

## Current versus later behavior

The **Optimize route** button sends the current depot and stops to the local
FastAPI backend. The backend uses OSRM driving times to choose a road-aware stop
order and returns the route geometry, distance, and estimated duration for the
map preview. OR-Tools can be added later for more advanced constraints such as
vehicle capacity and delivery time windows.
