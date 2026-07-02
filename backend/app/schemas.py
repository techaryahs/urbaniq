from typing import Optional
from pydantic import BaseModel, ConfigDict
from datetime import datetime


class ParkCreate(BaseModel):
    name: str
    area: Optional[int] = None
    latitude: float
    longitude: float
    condition: Optional[str] = "Good"
    organization: Optional[str] = "Parks Dept"
    survey_score: Optional[float] = 85.0


class ParkResponse(BaseModel):
    id: int
    name: str
    area: Optional[int] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    condition: Optional[str] = None
    organization: Optional[str] = None
    survey_score: Optional[float] = None

    model_config = ConfigDict(from_attributes=True)


class NearestParkResponse(BaseModel):
    id: int
    name: str
    area: Optional[int] = None
    latitude: float
    longitude: float
    distance_meters: float


class NearbyParkResponse(BaseModel):
    id: int
    name: str
    area: Optional[int] = None
    latitude: float
    longitude: float
    distance_meters: float


class BufferResponse(BaseModel):
    type: str
    geometry: dict
    properties: dict


class ActivityResponse(BaseModel):
    id: int
    action: str
    details: str
    timestamp: datetime

    model_config = ConfigDict(from_attributes=True)


class ReportResponse(BaseModel):
    id: int
    filename: str
    format: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class UploadResponse(BaseModel):
    id: int
    filename: str
    status: str
    uploaded_at: datetime

    model_config = ConfigDict(from_attributes=True)