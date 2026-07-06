from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import SessionLocal
from app.models import Activity, Organization
from app.models.public_space import PublicSpace
from app.schemas import ActivityResponse

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/stats")
def get_dashboard_stats(db: Session = Depends(get_db)):
    total_spaces = db.query(PublicSpace).count()
    
    conditions = db.query(PublicSpace.condition, func.count(PublicSpace.id)).group_by(PublicSpace.condition).all()
    cond_dict = {c: count for c, count in conditions}
    
    good_condition = cond_dict.get("Good", 0)
    fair_condition = cond_dict.get("Fair", 0)
    poor_condition = cond_dict.get("Poor", 0)
    
    orgs = db.query(PublicSpace.organization_id).distinct().count()
    
    recent_surveys = db.query(PublicSpace).filter(PublicSpace.survey_score != None).count()
    
    return {
        "total_parks": total_spaces,           # backward-compatibility
        "total_public_spaces": total_spaces,   # new
        "good_condition": good_condition,
        "fair_condition": fair_condition,
        "poor_condition": poor_condition,
        "organizations": orgs,
        "recent_surveys": recent_surveys
    }

@router.get("/activity", response_model=list[ActivityResponse])
def get_recent_activity(db: Session = Depends(get_db)):
    activities = db.query(Activity).order_by(Activity.timestamp.desc()).limit(10).all()
    return activities
