from typing import Optional, List
import enum
from pydantic import BaseModel, ConfigDict, Field, field_validator
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


class PublicSpaceType(str, enum.Enum):
    PARK = "PARK"
    LAKE = "LAKE"
    SCHOOL = "SCHOOL"
    GARDEN = "GARDEN"
    PLAYGROUND = "PLAYGROUND"
    OPEN_SPACE = "OPEN_SPACE"


class PublicSpaceCreate(BaseModel):
    name: str
    type: PublicSpaceType
    description: Optional[str] = None
    latitude: float
    longitude: float
    area: Optional[int] = None
    condition: Optional[str] = "Good"
    survey_score: Optional[float] = 85.0
    organization_id: Optional[int] = None

    @field_validator("latitude")
    @classmethod
    def validate_latitude(cls, v: float) -> float:
        if v < -90.0 or v > 90.0:
            raise ValueError("Latitude must be between -90 and 90")
        return v

    @field_validator("longitude")
    @classmethod
    def validate_longitude(cls, v: float) -> float:
        if v < -180.0 or v > 180.0:
            raise ValueError("Longitude must be between -180 and 180")
        return v

    @field_validator("type", mode="before")
    @classmethod
    def validate_type(cls, v):
        if isinstance(v, str):
            norm = v.strip().upper().replace(" ", "_")
            if norm == "OPENSPACE":
                norm = "OPEN_SPACE"
            if norm in PublicSpaceType.__members__:
                return PublicSpaceType[norm]
        return v


class PublicSpaceUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[PublicSpaceType] = None
    description: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    area: Optional[int] = None
    condition: Optional[str] = None
    survey_score: Optional[float] = None
    organization_id: Optional[int] = None

    @field_validator("type", mode="before")
    @classmethod
    def validate_type(cls, v):
        if v is not None and isinstance(v, str):
            norm = v.strip().upper().replace(" ", "_")
            if norm == "OPENSPACE":
                norm = "OPEN_SPACE"
            if norm in PublicSpaceType.__members__:
                return PublicSpaceType[norm]
        return v


class PublicSpaceResponse(BaseModel):
    id: int
    name: str
    type: PublicSpaceType
    description: Optional[str] = None
    latitude: float
    longitude: float
    area: Optional[int] = None
    condition: Optional[str] = None
    survey_score: Optional[float] = None
    organization_id: Optional[int] = None
    created_by: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    version: int

    model_config = ConfigDict(from_attributes=True)


class PublicSpaceListResponse(BaseModel):
    items: List[PublicSpaceResponse]
    total: int


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

from pydantic import EmailStr


class UserRegister(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    role: str

    @field_validator("email", mode="before")
    @classmethod
    def lower_email(cls, v):
        if isinstance(v, str):
            return v.lower()
        return v


class UserLogin(BaseModel):
    email: EmailStr
    password: str

    @field_validator("email", mode="before")
    @classmethod
    def lower_email(cls, v):
        if isinstance(v, str):
            return v.lower()
        return v


class UserResponse(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    role: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class Token(BaseModel):
    access_token: str
    token_type: str


class OrganizationBase(BaseModel):
    name: str
    address: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    contact_person: Optional[str] = None


class OrganizationCreate(OrganizationBase):
    pass


class OrganizationUpdate(BaseModel):
    name: Optional[str] = None
    address: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    contact_person: Optional[str] = None


class OrganizationResponse(OrganizationBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class OrganizationAnalyticsResponse(BaseModel):
    total_public_spaces: int
    condition_breakdown: dict
    average_survey_score: float


# (duplicate imports removed)



class SurveyConditionEnum(str, enum.Enum):
    Excellent = "Excellent"
    Good = "Good"
    Average = "Average"
    Poor = "Poor"
    Very_Poor = "Very Poor"


class SurveyBase(BaseModel):
    public_space_id: int
    condition: SurveyConditionEnum
    score: float = Field(..., ge=1.0, le=10.0)
    remarks: Optional[str] = None
    survey_date: datetime
    photos: Optional[List[str]] = None


class SurveyCreate(SurveyBase):
    @field_validator("survey_date")
    @classmethod
    def date_not_in_future(cls, v: datetime) -> datetime:
        if v.timestamp() > datetime.now().timestamp() + 60: # Allow 1 minute buffer for minor clock skew
            raise ValueError("Survey date cannot be in the future")
        return v


class SurveyUpdate(BaseModel):
    public_space_id: Optional[int] = None
    condition: Optional[SurveyConditionEnum] = None
    score: Optional[float] = Field(None, ge=1.0, le=10.0)
    remarks: Optional[str] = None
    survey_date: Optional[datetime] = None
    photos: Optional[List[str]] = None

    @field_validator("survey_date")
    @classmethod
    def date_not_in_future(cls, v: Optional[datetime]) -> Optional[datetime]:
        if v is not None and v.timestamp() > datetime.now().timestamp() + 60:
            raise ValueError("Survey date cannot be in the future")
        return v


class SurveyResponse(SurveyBase):
    id: int
    researcher_id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class SurveyListResponse(BaseModel):
    items: List[SurveyResponse]
    total: int
