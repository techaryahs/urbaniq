from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.schemas import (
    ParkCreate,
    ParkResponse,
    NearestParkResponse,
    NearbyParkResponse,
    BufferResponse
)

from app.crud import (
    create_park,
    get_parks,
    get_parks_geojson,
    get_nearest_park,
    get_parks_within_radius,
    get_buffer_zone
)

router = APIRouter(
    prefix="/parks",
    tags=["Parks"]
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# GET /parks
@router.get("/", response_model=list[ParkResponse])
def read_parks(db: Session = Depends(get_db)):
    return get_parks(db)


# GET /parks/geojson
@router.get("/geojson")
def read_parks_geojson(db: Session = Depends(get_db)):
    return get_parks_geojson(db)


# GET /parks/nearest
@router.get("/nearest", response_model=NearestParkResponse)
def nearest_park(
    latitude: float,
    longitude: float,
    db: Session = Depends(get_db)
):
    park = get_nearest_park(db, latitude, longitude)

    if park is None:
        raise HTTPException(
            status_code=404,
            detail="No parks found."
        )

    return park


# GET /parks/within
@router.get("/within", response_model=list[NearbyParkResponse])
def parks_within_radius(
    latitude: float,
    longitude: float,
    radius: float,
    db: Session = Depends(get_db)
):
    return get_parks_within_radius(
        db,
        latitude,
        longitude,
        radius
    )


# NEW - GET /parks/buffer
@router.get("/buffer", response_model=BufferResponse)
def buffer_zone(
    latitude: float,
    longitude: float,
    radius: float,
    db: Session = Depends(get_db)
):
    return get_buffer_zone(
        db,
        latitude,
        longitude,
        radius
    )


# POST /parks
@router.post("/", response_model=ParkResponse)
def add_park(
    park: ParkCreate,
    db: Session = Depends(get_db)
):
    return create_park(db, park)