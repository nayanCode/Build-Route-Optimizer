"""Data shapes accepted and returned by the RouteWise API."""

from pydantic import BaseModel, Field, model_validator


class Stop(BaseModel):
    """One physical place that a driver can visit."""

    id: str = Field(min_length=1, max_length=80)
    name: str = Field(min_length=1, max_length=120)
    type: str | None = Field(default=None, max_length=20)
    address: str | None = Field(default=None, max_length=250)
    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)


class RouteRequest(BaseModel):
    """The depot and delivery stops supplied by the React frontend."""

    depot: Stop
    stops: list[Stop] = Field(min_length=3, max_length=10)

    @model_validator(mode="after")
    def stop_ids_must_be_unique(self) -> "RouteRequest":
        """Prevent ambiguous routes caused by duplicate IDs."""
        all_ids = [self.depot.id, *(stop.id for stop in self.stops)]
        if len(all_ids) != len(set(all_ids)):
            raise ValueError("Depot and delivery stop IDs must be unique")
        return self


class ValidationResponse(BaseModel):
    """Small response used while we are building the API in stages."""

    valid: bool = True
    delivery_stop_count: int


class OptimizedRouteResponse(BaseModel):
    """The ordered stops and road geometry returned by the optimizer."""

    ordered_stops: list[Stop]
    geometry: list[list[float]]
    distance_meters: float
    duration_seconds: float


class ReverseGeocodeResponse(BaseModel):
    """Readable location information for a dragged map pin."""

    latitude: float
    longitude: float
    display_name: str
    address: dict[str, str] = Field(default_factory=dict)
