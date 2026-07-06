from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional

from app.database import SessionLocal
from app.models import Organization, Park
from app.schemas import (
    OrganizationCreate,
    OrganizationUpdate,
    OrganizationResponse,
    OrganizationAnalyticsResponse,
)

router = APIRouter(
    prefix="/organizations",
    tags=["Organizations"]
)

# Database Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# -----------------------------
# GET /organizations
# -----------------------------
@router.get("/", response_model=List[OrganizationResponse])
def get_organizations(
    search: Optional[str] = None,
    skip: int = 0,
    limit: int = 10,
    db: Session = Depends(get_db)
):
    query = db.query(Organization)
    if search:
        query = query.filter(
            (Organization.name.ilike(f"%{search}%")) |
            (Organization.address.ilike(f"%{search}%")) |
            (Organization.contact_person.ilike(f"%{search}%"))
        )
    return query.offset(skip).limit(limit).all()

# -----------------------------
# GET /organizations/{id}
# -----------------------------
@router.get("/{id}", response_model=OrganizationResponse)
def get_organization_by_id(id: int, db: Session = Depends(get_db)):
    org = db.query(Organization).filter(Organization.id == id).first()
    if not org:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Organization not found"
        )
    return org

# -----------------------------
# POST /organizations
# -----------------------------
@router.post("/", response_model=OrganizationResponse, status_code=status.HTTP_201_CREATED)
def create_organization(org_in: OrganizationCreate, db: Session = Depends(get_db)):
    existing = db.query(Organization).filter(Organization.name == org_in.name).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An organization with this name already exists"
        )
    
    db_org = Organization(
        name=org_in.name,
        address=org_in.address,
        email=org_in.email,
        phone=org_in.phone,
        contact_person=org_in.contact_person
    )
    db.add(db_org)
    db.commit()
    db.refresh(db_org)
    return db_org

# -----------------------------
# PUT /organizations/{id}
# -----------------------------
@router.put("/{id}", response_model=OrganizationResponse)
def update_organization(
    id: int,
    org_in: OrganizationUpdate,
    db: Session = Depends(get_db)
):
    org = db.query(Organization).filter(Organization.id == id).first()
    if not org:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Organization not found"
        )
    
    if org_in.name is not None and org_in.name != org.name:
        existing = db.query(Organization).filter(Organization.name == org_in.name).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="An organization with this name already exists"
            )
        org.name = org_in.name

    if org_in.address is not None:
        org.address = org_in.address
    if org_in.email is not None:
        org.email = org_in.email
    if org_in.phone is not None:
        org.phone = org_in.phone
    if org_in.contact_person is not None:
        org.contact_person = org_in.contact_person
        
    db.commit()
    db.refresh(org)
    return org

# -----------------------------
# DELETE /organizations/{id}
# -----------------------------
@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_organization(id: int, db: Session = Depends(get_db)):
    org = db.query(Organization).filter(Organization.id == id).first()
    if not org:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Organization not found"
        )
    db.delete(org)
    db.commit()
    return None

# -----------------------------
# GET /organizations/{id}/analytics
# -----------------------------
@router.get("/{id}/analytics", response_model=OrganizationAnalyticsResponse)
def get_organization_analytics(id: int, db: Session = Depends(get_db)):
    org = db.query(Organization).filter(Organization.id == id).first()
    if not org:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Organization not found"
        )
    
    # In Phase 2, we query parks where park's organization matches organization name (string-based matching)
    parks = db.query(Park).filter(Park.organization == org.name).all()
    
    total_parks = len(parks)
    
    # Calculate average survey score
    avg_score = 0.0
    if total_parks > 0:
        total_score = sum(p.survey_score for p in parks if p.survey_score is not None)
        avg_score = round(total_score / total_parks, 2)
        
    # Calculate condition breakdown
    breakdown = {"Good": 0, "Fair": 0, "Poor": 0, "Unknown": 0}
    for p in parks:
        cond = p.condition if p.condition else "Unknown"
        breakdown[cond] = breakdown.get(cond, 0) + 1
        
    return {
        "total_public_spaces": total_parks,
        "condition_breakdown": breakdown,
        "average_survey_score": avg_score
    }
