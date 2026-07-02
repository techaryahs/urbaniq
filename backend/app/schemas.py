from typing import Optional
from pydantic import BaseModel, ConfigDict


class ParkCreate(BaseModel):
    name: str
    area: int
    latitude: float
    longitude: float


class ParkResponse(BaseModel):
    id: int
    name: str
    area: int
    latitude: Optional[float] = None
    longitude: Optional[float] = None

    model_config = ConfigDict(from_attributes=True)


# Response model for nearest park
class NearestParkResponse(BaseModel):
    id: int
    name: str
    area: int
    latitude: float
    longitude: float
    distance_meters: float


# Response model for nearby parks
class NearbyParkResponse(BaseModel):
    id: int
    name: str
    area: int
    latitude: float
    longitude: float
    distance_meters: float


# Response model for buffer GeoJSON
class BufferResponse(BaseModel):
    type: str
    geometry: dict
    properties: dict