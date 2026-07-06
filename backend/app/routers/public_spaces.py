from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import SessionLocal
from app.models import User, Organization
from app.auth.permissions import require_roles, require_researcher
from app.routers.auth import get_current_user
from app.schemas import (
    PublicSpaceCreate,
    PublicSpaceUpdate,
    PublicSpaceResponse,
    PublicSpaceListResponse,
    PublicSpaceType,
)
import app.crud as crud
from geoalchemy2.shape import to_shape

router = APIRouter(
    prefix="/public-spaces",
    tags=["Public Spaces"]
)

# Database Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# -----------------------------
# GET /public-spaces/geojson
# -----------------------------
@router.get("/geojson")
def get_public_spaces_geojson(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retrieve all public spaces as a GeoJSON FeatureCollection.
    """
    features = []
    
    # We query all spaces
    spaces = db.query(crud.PublicSpace).all()
    
    for s in spaces:
        lng = s.longitude
        lat = s.latitude
        
        # If coordinates are stored as PostGIS geometry, convert them to latitude longitude
        if s.location is not None:
            try:
                geom = to_shape(s.location)
                lng = geom.x
                lat = geom.y
            except Exception:
                pass
                
        # Ignore records with invalid coordinates per the requirements
        if not lat and not lng:
            continue
            
        org_name = db.query(Organization.name).filter(Organization.id == s.organization_id).scalar() if s.organization_id else "Parks Dept"
        features.append({
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [lng, lat]
            },
            "properties": {
                "id": s.id,
                "name": s.name,
                "type": s.type.value if hasattr(s.type, "value") else s.type,
                "area": s.area,
                "condition": s.condition,
                "organization": org_name,
                "survey_score": s.survey_score
            }
        })
        
    return {
        "type": "FeatureCollection",
        "features": features
    }


# -----------------------------
# GET /public-spaces
# -----------------------------
@router.get("/", response_model=PublicSpaceListResponse)
def list_public_spaces(
    search: Optional[str] = None,
    type: Optional[PublicSpaceType] = None,
    condition: Optional[str] = None,
    skip: int = 0,
    limit: int = 10,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get paginated public spaces, with optional filters. Open to all logged-in users.
    """
    type_str = type.value if type else None
    items, total = crud.get_public_spaces(
        db,
        search=search,
        type=type_str,
        condition=condition,
        skip=skip,
        limit=limit
    )
    return {"items": items, "total": total}


# -----------------------------
# GET /public-spaces/{id}
# -----------------------------
@router.get("/{id}", response_model=PublicSpaceResponse)
def get_public_space_details(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retrieve single public space by ID.
    """
    space = crud.get_public_space(db, id)
    if not space:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Public Space not found"
        )
    return space


# -----------------------------
# POST /public-spaces
# -----------------------------
@router.post("/", response_model=PublicSpaceResponse, status_code=status.HTTP_201_CREATED)
def add_public_space(
    space_in: PublicSpaceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("researcher", "city_planner"))
):
    """
    Create a new Public Space. Planners and Researchers can create.
    """
    # Authorize organization if set
    if space_in.organization_id:
        org = db.query(Organization).filter(Organization.id == space_in.organization_id).first()
        if not org:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Organization does not exist"
            )
            
    space = crud.create_public_space(db, space_in, current_user.id)
    return space


# -----------------------------
# PUT /public-spaces/{id}
# -----------------------------
@router.put("/{id}", response_model=PublicSpaceResponse)
def edit_public_space(
    id: int,
    space_in: PublicSpaceUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("researcher", "city_planner"))
):
    """
    Update Public Space. Planners can edit any. Researchers can only edit ones they created.
    """
    db_space = db.query(crud.PublicSpace).filter(crud.PublicSpace.id == id).first()
    if not db_space:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Public Space not found"
        )

    # Authorization Check
    if current_user.role == "researcher" and db_space.created_by != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Researchers can only update public spaces they created."
        )

    if space_in.organization_id:
        org = db.query(Organization).filter(Organization.id == space_in.organization_id).first()
        if not org:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Organization does not exist"
            )

    updated = crud.update_public_space(db, id, space_in)
    return updated


# -----------------------------
# DELETE /public-spaces/{id}
# -----------------------------
@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_public_space(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("city_planner"))
):
    """
    Delete Public Space by ID. Limited to City Planners.
    """
    db_space = db.query(crud.PublicSpace).filter(crud.PublicSpace.id == id).first()
    if not db_space:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Public Space not found"
        )

    crud.delete_public_space(db, id)
    return None
