from sqlalchemy.orm import Session
from sqlalchemy import text
import json
from typing import Optional, List
from datetime import datetime

from shapely.geometry import Point
from geoalchemy2.shape import from_shape, to_shape

from app.models import User, Organization, Park
from app.models.public_space import PublicSpace, PublicSpaceType
from app.models.survey import Survey
from app.schemas import (
    ParkCreate,
    PublicSpaceCreate,
    PublicSpaceUpdate,
    SurveyCreate,
    SurveyUpdate
)

# ---------------------------------------------------
# Helper: Public Space to Dict
# ---------------------------------------------------
def public_space_to_dict(ps: PublicSpace, db: Optional[Session] = None):
    # Lookup organization name string for backwards compatibility
    org_name = None
    if ps.organization_id:
        if db:
            org_name = db.query(Organization.name).filter(Organization.id == ps.organization_id).scalar()
        else:
            # Fallback relationship load
            org_name = ps.organization.name if ps.organization else None

    # Resolve longitude/latitude from PostGIS location if explicit fields are missing (e.g. from GeoJSON imports)
    lat, lng = ps.latitude, ps.longitude
    if ps.location is not None:
        try:
            geom = to_shape(ps.location)
            lng = geom.x
            lat = geom.y
        except Exception:
            pass

    return {
        "id": ps.id,
        "name": ps.name,
        "type": ps.type.value if hasattr(ps.type, "value") else ps.type,
        "description": ps.description,
        "latitude": lat,
        "longitude": lng,
        "area": ps.area,
        "condition": ps.condition,
        "survey_score": ps.survey_score,
        "organization_id": ps.organization_id,
        "organization": org_name or "Parks Dept",  # legacy field compatibility
        "created_by": ps.created_by,
        "created_at": ps.created_at,
        "updated_at": ps.updated_at,
        "version": ps.version
    }


# ---------------------------------------------------
# Backend Public Spaces CRUD
# ---------------------------------------------------
def create_public_space(db: Session, public_space: PublicSpaceCreate, creator_id: int):
    point = from_shape(Point(public_space.longitude, public_space.latitude), srid=4326)
    
    db_space = PublicSpace(
        name=public_space.name,
        type=public_space.type,
        description=public_space.description,
        latitude=public_space.latitude,
        longitude=public_space.longitude,
        area=public_space.area,
        condition=public_space.condition or "Good",
        survey_score=public_space.survey_score or 85.0,
        organization_id=public_space.organization_id,
        created_by=creator_id,
        location=point
    )
    db.add(db_space)
    db.commit()
    db.refresh(db_space)
    return public_space_to_dict(db_space, db)


def get_public_spaces(
    db: Session,
    search: Optional[str] = None,
    type: Optional[str] = None,
    condition: Optional[str] = None,
    skip: int = 0,
    limit: int = 10
):
    query = db.query(PublicSpace)
    if search:
        query = query.filter(PublicSpace.name.ilike(f"%{search}%"))
    if type:
        query = query.filter(PublicSpace.type == type)
    if condition:
        query = query.filter(PublicSpace.condition == condition)
        
    total = query.count()
    items = query.order_by(PublicSpace.name.asc()).offset(skip).limit(limit).all()
    return [public_space_to_dict(item, db) for item in items], total


def get_public_space(db: Session, public_space_id: int):
    ps = db.query(PublicSpace).filter(PublicSpace.id == public_space_id).first()
    return public_space_to_dict(ps, db) if ps else None


def update_public_space(db: Session, public_space_id: int, ps_in: PublicSpaceUpdate):
    db_space = db.query(PublicSpace).filter(PublicSpace.id == public_space_id).first()
    if not db_space:
        return None
        
    update_data = ps_in.model_dump(exclude_unset=True)
    coords_changed = False
    
    for field, val in update_data.items():
        setattr(db_space, field, val)
        if field == "latitude" or field == "longitude":
            coords_changed = True
            
    if coords_changed and db_space.latitude is not None and db_space.longitude is not None:
        db_space.location = from_shape(Point(db_space.longitude, db_space.latitude), srid=4326)
        
    db_space.version = (db_space.version or 1) + 1
    
    db.commit()
    db.refresh(db_space)
    return public_space_to_dict(db_space, db)


def delete_public_space(db: Session, public_space_id: int):
    db_space = db.query(PublicSpace).filter(PublicSpace.id == public_space_id).first()
    if not db_space:
        return False
    db.delete(db_space)
    db.commit()
    return True


def search_public_spaces(db: Session, query_str: str, skip: int = 0, limit: int = 10):
    return get_public_spaces(db, search=query_str, skip=skip, limit=limit)


def filter_by_type(db: Session, type_val: str, skip: int = 0, limit: int = 10):
    return get_public_spaces(db, type=type_val, skip=skip, limit=limit)


def filter_by_condition(db: Session, condition_val: str, skip: int = 0, limit: int = 10):
    return get_public_spaces(db, condition=condition_val, skip=skip, limit=limit)


# ---------------------------------------------------
# Survey CRUD & Recalculation (Public Space Focused)
# ---------------------------------------------------
def survey_to_dict(survey: Survey):
    photos_list = []
    if survey.photos:
        try:
            photos_list = json.loads(survey.photos)
        except Exception:
            photos_list = survey.photos.split(",") if survey.photos else []
    return {
        "id": survey.id,
        "public_space_id": survey.public_space_id,
        "park_id": survey.public_space_id,  # legacy field compatibility
        "researcher_id": survey.researcher_id,
        "condition": survey.condition,
        "score": survey.score,
        "remarks": survey.remarks,
        "survey_date": survey.survey_date,
        "photos": photos_list,
        "created_at": survey.created_at,
        "updated_at": survey.updated_at
    }


def recalculate_public_space_stats(db: Session, public_space_id: int):
    ps = db.query(PublicSpace).filter(PublicSpace.id == public_space_id).first()
    if not ps:
        return

    surveys = db.query(Survey).filter(Survey.public_space_id == public_space_id).all()
    if not surveys:
        ps.survey_score = 0.0
        ps.condition = "Good"
    else:
        total_score = sum(s.score for s in surveys)
        ps.survey_score = round(total_score / len(surveys), 2)
        
        latest_survey = max(surveys, key=lambda s: s.survey_date)
        ps.condition = latest_survey.condition

    db.commit()
    db.refresh(ps)


def recalculate_park_stats(db: Session, park_id: int):
    # Backward compatibility stub
    recalculate_public_space_stats(db, park_id)


def create_survey(db: Session, survey: SurveyCreate, researcher_id: int):
    photos_str = json.dumps(survey.photos) if survey.photos else "[]"
    
    db_survey = Survey(
        public_space_id=survey.public_space_id,
        researcher_id=researcher_id,
        condition=survey.condition.value,
        score=survey.score,
        remarks=survey.remarks,
        survey_date=survey.survey_date,
        photos=photos_str
    )
    db.add(db_survey)
    db.commit()
    db.refresh(db_survey)

    recalculate_public_space_stats(db, survey.public_space_id)
    return survey_to_dict(db_survey)


def get_surveys(
    db: Session,
    public_space_id: Optional[int] = None,
    park_id: Optional[int] = None, # legacy compat
    researcher_id: Optional[int] = None,
    condition: Optional[str] = None,
    min_score: Optional[float] = None,
    max_score: Optional[float] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    skip: int = 0,
    limit: int = 10
):
    query = db.query(Survey)
    
    # Merge public_space_id and legacy park_id query arguments
    space_query_id = public_space_id if public_space_id is not None else park_id
    if space_query_id is not None:
        query = query.filter(Survey.public_space_id == space_query_id)
        
    if researcher_id is not None:
        query = query.filter(Survey.researcher_id == researcher_id)
    if condition is not None:
        query = query.filter(Survey.condition == condition)
    if min_score is not None:
        query = query.filter(Survey.score >= min_score)
    if max_score is not None:
        query = query.filter(Survey.score <= max_score)
    if start_date is not None:
        query = query.filter(Survey.survey_date >= start_date)
    if end_date is not None:
        query = query.filter(Survey.survey_date <= end_date)

    total = query.count()
    items = query.order_by(Survey.survey_date.desc()).offset(skip).limit(limit).all()
    return [survey_to_dict(s) for s in items], total


def get_survey(db: Session, survey_id: int):
    survey = db.query(Survey).filter(Survey.id == survey_id).first()
    return survey_to_dict(survey) if survey else None


def update_survey(db: Session, survey_id: int, survey_in: SurveyUpdate):
    db_survey = db.query(Survey).filter(Survey.id == survey_id).first()
    if not db_survey:
        return None

    update_data = survey_in.model_dump(exclude_unset=True)
    pk_change = False

    for field, val in update_data.items():
        if field == "photos" and val is not None:
            db_survey.photos = json.dumps(val)
        elif field == "condition" and val is not None:
            db_survey.condition = val.value
        else:
            setattr(db_survey, field, val)
        if field == "public_space_id" or field == "score" or field == "condition" or field == "survey_date":
            pk_change = True

    db.commit()
    db.refresh(db_survey)

    if pk_change:
        recalculate_public_space_stats(db, db_survey.public_space_id)

    return survey_to_dict(db_survey)


def delete_survey(db: Session, survey_id: int):
    db_survey = db.query(Survey).filter(Survey.id == survey_id).first()
    if not db_survey:
        return False

    space_id = db_survey.public_space_id
    db.delete(db_survey)
    db.commit()

    recalculate_public_space_stats(db, space_id)
    return True


def get_surveys_by_researcher(db: Session, researcher_id: int):
    items = db.query(Survey).filter(Survey.researcher_id == researcher_id).order_by(Survey.survey_date.desc()).all()
    return [survey_to_dict(s) for s in items]


def get_surveys_by_park(db: Session, park_id: int):
    # Backward compatibility stub
    items = db.query(Survey).filter(Survey.public_space_id == park_id).order_by(Survey.survey_date.desc()).all()
    return [survey_to_dict(s) for s in items]


def get_surveys_by_public_space(db: Session, public_space_id: int):
    items = db.query(Survey).filter(Survey.public_space_id == public_space_id).order_by(Survey.survey_date.desc()).all()
    return [survey_to_dict(s) for s in items]


# ---------------------------------------------------
# Backward-Compatible Parks Methods (Delegates to PublicSpaces of type PARK)
# ---------------------------------------------------
def create_park(db: Session, park: ParkCreate):
    point = from_shape(Point(park.longitude, park.latitude), srid=4326)
    
    # Resolve legacy organization string field into organization_id
    org_id = None
    if park.organization:
        org = db.query(Organization).filter(Organization.name == park.organization.strip()).first()
        if org:
            org_id = org.id
        else:
            new_org = Organization(name=park.organization.strip())
            db.add(new_org)
            db.commit()
            db.refresh(new_org)
            org_id = new_org.id

    db_park = PublicSpace(
        name=park.name,
        type=PublicSpaceType.PARK,
        description="Created via legacy parks API",
        latitude=park.latitude,
        longitude=park.longitude,
        area=park.area,
        condition=park.condition or "Good",
        survey_score=park.survey_score or 85.0,
        organization_id=org_id,
        location=point
    )
    db.add(db_park)
    db.commit()
    db.refresh(db_park)
    
    return {
        "id": db_park.id,
        "name": db_park.name,
        "area": db_park.area,
        "latitude": db_park.latitude,
        "longitude": db_park.longitude,
        "condition": db_park.condition,
        "organization": park.organization or "Parks Dept",
        "survey_score": db_park.survey_score
    }


def get_parks(db: Session):
    parks = db.query(PublicSpace).filter(PublicSpace.type == PublicSpaceType.PARK).all()
    return [
        {
            "id": p.id,
            "name": p.name,
            "area": p.area,
            "latitude": p.latitude,
            "longitude": p.longitude,
            "condition": p.condition,
            "organization": db.query(Organization.name).filter(Organization.id == p.organization_id).scalar() or "Parks Dept",
            "survey_score": p.survey_score
        }
        for p in parks
    ]


def get_parks_geojson(db: Session):
    parks = db.query(PublicSpace).filter(PublicSpace.type == PublicSpaceType.PARK).all()
    features = []
    
    for p in parks:
        features.append({
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [p.longitude, p.latitude]
            },
            "properties": {
                "id": p.id,
                "name": p.name,
                "area": p.area,
                "condition": p.condition,
                "organization": db.query(Organization.name).filter(Organization.id == p.organization_id).scalar() or "Parks Dept",
                "survey_score": p.survey_score
            }
        })
        
    return {
        "type": "FeatureCollection",
        "features": features
    }


def get_nearest_park(db: Session, latitude: float, longitude: float):
    # Find nearest from public_spaces table where type = 'PARK'
    query = text("""
        SELECT
            id,
            name,
            area,
            latitude,
            longitude,
            ST_Distance(
                location::geography,
                ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326)::geography
            ) AS distance_meters
        FROM public_spaces
        WHERE type = 'PARK'
        ORDER BY ST_Distance(
            location::geography,
            ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326)::geography
        )
        LIMIT 1;
    """)
    result = db.execute(query, {"latitude": latitude, "longitude": longitude}).mappings().first()
    return dict(result) if result else None


def get_parks_within_radius(db: Session, latitude: float, longitude: float, radius: float):
    # Find within from public_spaces table where type = 'PARK'
    query = text("""
        SELECT
            id,
            name,
            area,
            latitude,
            longitude,
            ST_Distance(
                location::geography,
                ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326)::geography
            ) AS distance_meters
        FROM public_spaces
        WHERE type = 'PARK' AND ST_DWithin(
            location::geography,
            ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326)::geography,
            :radius
        )
        ORDER BY distance_meters;
    """)
    results = db.execute(query, {"latitude": latitude, "longitude": longitude, "radius": radius}).mappings().all()
    return [dict(row) for row in results]


def get_buffer_zone(db: Session, latitude: float, longitude: float, radius: float):
    query = text("""
        SELECT ST_AsGeoJSON(
            ST_Buffer(
                ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326)::geography,
                :radius
            )::geometry
        ) AS buffer;
    """)
    result = db.execute(query, {"latitude": latitude, "longitude": longitude, "radius": radius}).scalar()
    geometry = json.loads(result)
    return {
        "type": "Feature",
        "geometry": geometry,
        "properties": {
            "radius": radius
        }
    }