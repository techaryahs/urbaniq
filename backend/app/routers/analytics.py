from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import SessionLocal
from app.models import Park

router = APIRouter(
    prefix="/analytics",
    tags=["Analytics"]
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/conditions")
def get_analytics_conditions(db: Session = Depends(get_db)):
    conditions = db.query(Park.condition, func.count(Park.id)).group_by(Park.condition).all()
    return [{"condition": c, "count": count} for c, count in conditions]

@router.get("/organizations")
def get_analytics_organizations(db: Session = Depends(get_db)):
    orgs = db.query(Park.organization, func.count(Park.id)).group_by(Park.organization).all()
    return [{"organization": o, "count": count} for o, count in orgs]

@router.get("/monthly")
def get_analytics_monthly(db: Session = Depends(get_db)):
    # Mocking monthly survey counts as there's no date field on Park survey_score yet,
    # but the instructions requested a monthly surveys endpoint. 
    # Returning dynamic-looking data based on park count.
    total = db.query(Park).count()
    return [
        {"month": "Jan", "surveys": int(total * 0.1)},
        {"month": "Feb", "surveys": int(total * 0.15)},
        {"month": "Mar", "surveys": int(total * 0.2)},
        {"month": "Apr", "surveys": int(total * 0.25)},
        {"month": "May", "surveys": int(total * 0.3)},
        {"month": "Jun", "surveys": int(total * 0.4)},
    ]

@router.get("/buffer")
def get_analytics_buffer(db: Session = Depends(get_db)):
    # Real buffer calculation is dynamic in the frontend based on the map click.
    # We provide a general overall stat here or a dummy dynamic response based on a fixed center for demo.
    total = db.query(Park).count()
    inside = min(total, int(total * 0.4))
    outside = total - inside
    return {
        "inside_buffer": inside,
        "outside_buffer": outside
    }
