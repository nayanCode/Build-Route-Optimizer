"""Road-aware route ordering and geometry lookup through OSRM."""

import httpx

from app.schemas import RouteRequest, Stop


OSRM_BASE_URL = "https://router.project-osrm.org"


async def optimize_route(route: RouteRequest) -> tuple[list[Stop], list[list[float]], float, float]:
    """Order stops using OSRM travel times and return the road geometry."""
    all_stops = [route.depot, *route.stops]
    coordinates = ";".join(
        f"{stop.longitude},{stop.latitude}" for stop in all_stops
    )

    async with httpx.AsyncClient(timeout=15) as client:
        table_response = await client.get(
            f"{OSRM_BASE_URL}/table/v1/driving/{coordinates}",
            params={"annotations": "duration"},
        )
        table_response.raise_for_status()
        durations = table_response.json().get("durations")
        if not durations:
            raise ValueError("OSRM did not return travel times for these stops.")

        ordered_indexes = _nearest_next_order(durations, len(all_stops))
        ordered_stops = [all_stops[index] for index in ordered_indexes]
        ordered_coordinates = ";".join(
            f"{stop.longitude},{stop.latitude}" for stop in ordered_stops
        )
        route_response = await client.get(
            f"{OSRM_BASE_URL}/route/v1/driving/{ordered_coordinates}",
            params={"overview": "full", "geometries": "geojson"},
        )
        route_response.raise_for_status()
        route_data = route_response.json().get("routes", [None])[0]
        if not route_data:
            raise ValueError("OSRM did not return a route geometry.")

    geometry = [
        [latitude, longitude]
        for longitude, latitude in route_data["geometry"]["coordinates"]
    ]
    return (
        ordered_stops,
        geometry,
        route_data["distance"],
        route_data["duration"],
    )


def _nearest_next_order(durations: list[list[float | None]], stop_count: int) -> list[int]:
    """Choose the nearest unvisited stop, always starting at the depot."""
    order = [0]
    remaining = set(range(1, stop_count))

    while remaining:
        current = order[-1]
        next_stop = min(
            remaining,
            key=lambda index: durations[current][index]
            if durations[current][index] is not None
            else float("inf"),
        )
        order.append(next_stop)
        remaining.remove(next_stop)

    return order