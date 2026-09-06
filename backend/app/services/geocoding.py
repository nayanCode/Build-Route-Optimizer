"""Small, rate-limited adapter for Nominatim reverse geocoding."""

import asyncio
import time

import httpx
from fastapi import HTTPException


class NominatimGeocoder:
    """Looks up the nearest readable OpenStreetMap address for a coordinate."""

    endpoint = "https://nominatim.openstreetmap.org/reverse"
    minimum_request_interval = 1.0  # Public Nominatim permits at most 1 request/second.

    def __init__(self) -> None:
        self._request_lock = asyncio.Lock()
        self._last_request_at = 0.0

    async def reverse(self, latitude: float, longitude: float) -> dict:
        """Return Nominatim's nearest-address result for a WGS84 coordinate."""
        async with self._request_lock:
            elapsed = time.monotonic() - self._last_request_at
            if elapsed < self.minimum_request_interval:
                await asyncio.sleep(self.minimum_request_interval - elapsed)

            try:
                async with httpx.AsyncClient(
                    timeout=10.0,
                    headers={"User-Agent": "RouteWise/0.1 (local delivery-route demo)"},
                ) as client:
                    response = await client.get(
                        self.endpoint,
                        params={
                            "lat": latitude,
                            "lon": longitude,
                            "format": "jsonv2",
                            "addressdetails": 1,
                        },
                    )
                self._last_request_at = time.monotonic()
                response.raise_for_status()
            except httpx.HTTPError as error:
                raise HTTPException(status_code=502, detail="Geocoding service is unavailable") from error

        result = response.json()
        if "display_name" not in result:
            raise HTTPException(status_code=404, detail="No address found for these coordinates")
        return result


nominatim_geocoder = NominatimGeocoder()
