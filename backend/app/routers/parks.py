from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models import User
from app.auth.permissions import require_researcher
from app.schemas import (
    ParkCreate,
    ParkResponse,
    NearestParkResponse,
    NearbyParkResponse,
    BufferResponse,
)

from app.crud import (
    create_park,
    get_parks,
    get_parks_geojson,
    get_nearest_park,
    get_parks_within_radius,
    get_buffer_zone,
)

router = APIRouter(
    prefix="/parks",
    tags=["Parks"],
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ---------------------------------------------------
# GET /parks
# Accessible to all authenticated users
# ---------------------------------------------------
@router.get("/", response_model=list[ParkResponse])
def read_parks(
    db: Session = Depends(get_db),
):
    return get_parks(db)


# ---------------------------------------------------
# GET /parks/geojson
# Accessible to all authenticated users
# ---------------------------------------------------
@router.get("/geojson")
def read_parks_geojson(
    db: Session = Depends(get_db),
):
    return get_parks_geojson(db)


# ---------------------------------------------------
# GET /parks/nearest
# Accessible to all authenticated users
# ---------------------------------------------------
@router.get("/nearest", response_model=NearestParkResponse)
def nearest_park(
    latitude: float,
    longitude: float,
    db: Session = Depends(get_db),
):
    park = get_nearest_park(
        db,
        latitude,
        longitude,
    )

    if park is None:
        raise HTTPException(
            status_code=404,
            detail="No parks found.",
        )

    return park


# ---------------------------------------------------
# GET /parks/within
# Accessible to all authenticated users
# ---------------------------------------------------
@router.get("/within", response_model=list[NearbyParkResponse])
def parks_within_radius(
    latitude: float,
    longitude: float,
    radius: float,
    db: Session = Depends(get_db),
):
    return get_parks_within_radius(
        db,
        latitude,
        longitude,
        radius,
    )


# ---------------------------------------------------
# GET /parks/buffer
# Accessible to all authenticated users
# ---------------------------------------------------
@router.get("/buffer", response_model=BufferResponse)
def buffer_zone(
    latitude: float,
    longitude: float,
    radius: float,
    db: Session = Depends(get_db),
):
    return get_buffer_zone(
        db,
        latitude,
        longitude,
        radius,
    )


# ---------------------------------------------------
# POST /parks
# Researchers only
# ---------------------------------------------------
@router.post("/", response_model=ParkResponse)
def add_park(
    park: ParkCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_researcher),
):
    return create_park(db, park)