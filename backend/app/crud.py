from sqlalchemy.orm import Session
from sqlalchemy import text
import json

from shapely.geometry import Point
from geoalchemy2.shape import from_shape, to_shape

from app.models import Park
from app.schemas import ParkCreate


def park_to_dict(park: Park):
    """
    Convert a Park SQLAlchemy object into a dictionary response.
    """

    latitude = None
    longitude = None

    if park.location is not None:
        point = to_shape(park.location)
        latitude = point.y
        longitude = point.x

    return {
        "id": park.id,
        "name": park.name,
        "area": park.area,
        "latitude": latitude,
        "longitude": longitude,
        "condition": park.condition,
        "organization": park.organization,
        "survey_score": park.survey_score,
    }


def create_park(db: Session, park: ParkCreate):
    """
    Create a new park with PostGIS POINT geometry.
    """

    point = from_shape(
        Point(park.longitude, park.latitude),
        srid=4326
    )

    db_park = Park(
        name=park.name,
        area=park.area,
        location=point,
        condition=park.condition,
        organization=park.organization,
        survey_score=park.survey_score,
    )

    db.add(db_park)
    db.commit()
    db.refresh(db_park)

    return park_to_dict(db_park)
def get_parks(db: Session):
    """
    Return all parks.
    """

    parks = db.query(Park).all()

    return [park_to_dict(park) for park in parks]


def get_parks_geojson(db: Session):
    """
    Return all parks as GeoJSON FeatureCollection.
    """

    parks = db.query(Park).all()

    features = []

    for park in parks:

        if park.location is None:
            continue

        park_data = park_to_dict(park)

        features.append(
            {
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [
                        park_data["longitude"],
                        park_data["latitude"]
                    ]
                },
                "properties": {
                    "id": park_data["id"],
                    "name": park_data["name"],
                    "area": park_data["area"],
                    "condition": park_data["condition"],
                    "organization": park_data["organization"],
                    "survey_score": park_data["survey_score"]
                }
            }
        )

    return {
        "type": "FeatureCollection",
        "features": features
    }


def get_nearest_park(db: Session, latitude: float, longitude: float):
    """
    Find the nearest park using PostGIS ST_Distance.
    """

    query = text("""
        SELECT
            id,
            name,
            area,
            ST_Y(location::geometry) AS latitude,
            ST_X(location::geometry) AS longitude,
            ST_Distance(
                location::geography,
                ST_SetSRID(
                    ST_MakePoint(:longitude, :latitude),
                    4326
                )::geography
            ) AS distance_meters
        FROM parks
        ORDER BY ST_Distance(
            location::geography,
            ST_SetSRID(
                ST_MakePoint(:longitude, :latitude),
                4326
            )::geography
        )
        LIMIT 1;
    """)

    result = db.execute(
        query,
        {
            "latitude": latitude,
            "longitude": longitude
        }
    ).mappings().first()

    if result is None:
        return None

    return dict(result)


def get_parks_within_radius(
    db: Session,
    latitude: float,
    longitude: float,
    radius: float
):
    """
    Find all parks within a given radius (meters)
    using PostGIS ST_DWithin().
    """

    query = text("""
        SELECT
            id,
            name,
            area,
            ST_Y(location::geometry) AS latitude,
            ST_X(location::geometry) AS longitude,
            ST_Distance(
                location::geography,
                ST_SetSRID(
                    ST_MakePoint(:longitude, :latitude),
                    4326
                )::geography
            ) AS distance_meters
        FROM parks
        WHERE ST_DWithin(
            location::geography,
            ST_SetSRID(
                ST_MakePoint(:longitude, :latitude),
                4326
            )::geography,
            :radius
        )
        ORDER BY distance_meters;
    """)

    results = db.execute(
        query,
        {
            "latitude": latitude,
            "longitude": longitude,
            "radius": radius
        }
    ).mappings().all()

    return [dict(row) for row in results]


def get_buffer_zone(
    db: Session,
    latitude: float,
    longitude: float,
    radius: float
):
    """
    Create a GeoJSON buffer polygon around a point using ST_Buffer.
    Radius is in meters.
    """

    query = text("""
        SELECT ST_AsGeoJSON(
            ST_Buffer(
                ST_SetSRID(
                    ST_MakePoint(:longitude, :latitude),
                    4326
                )::geography,
                :radius
            )::geometry
        ) AS buffer;
    """)

    result = db.execute(
        query,
        {
            "latitude": latitude,
            "longitude": longitude,
            "radius": radius
        }
    ).scalar()

    geometry = json.loads(result)

    return {
        "type": "Feature",
        "geometry": geometry,
        "properties": {
            "radius": radius
        }
    }