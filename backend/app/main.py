from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from app.schemas import OptimizedRouteResponse, ReverseGeocodeResponse, RouteRequest, ValidationResponse
from app.services.geocoding import nominatim_geocoder
from app.services.route_optimizer import optimize_route


app = FastAPI(
    title="RouteWise API",
    version="0.1.0",
    description="Backend service for delivery route optimization.",
)

# React runs at a different local address during development. CORS lets the
# frontend call this API safely. We will tighten this list for deployment.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check() -> dict[str, str]:
    """Confirms that the API server is reachable."""
    return {"status": "ok", "service": "routewise-api"}


@app.post("/routes/validate", response_model=ValidationResponse)
def validate_route_request(route: RouteRequest) -> ValidationResponse:
    """Checks that React has supplied one depot and 3–10 valid stops."""
    return ValidationResponse(delivery_stop_count=len(route.stops))


@app.post("/routes/optimize", response_model=OptimizedRouteResponse)
async def optimize_route_request(route: RouteRequest) -> OptimizedRouteResponse:
    """Return an OSRM road route beginning at the depot."""
    ordered_stops, geometry, distance, duration = await optimize_route(route)
    return OptimizedRouteResponse(
        ordered_stops=ordered_stops,
        geometry=geometry,
        distance_meters=distance,
        duration_seconds=duration,
    )


@app.get("/geocode/reverse", response_model=ReverseGeocodeResponse)
async def reverse_geocode(
    latitude: float = Query(ge=-90, le=90),
    longitude: float = Query(ge=-180, le=180),
) -> ReverseGeocodeResponse:
    """Find the nearest human-readable address for a draggable map pin."""
    result = await nominatim_geocoder.reverse(latitude, longitude)
    return ReverseGeocodeResponse(
        latitude=latitude,
        longitude=longitude,
        display_name=result["display_name"],
        address=result.get("address", {}),
    )
