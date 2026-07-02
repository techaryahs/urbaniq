from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import SessionLocal
from app.models import Park, Activity
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
    total_parks = db.query(Park).count()
    
    conditions = db.query(Park.condition, func.count(Park.id)).group_by(Park.condition).all()
    cond_dict = {c: count for c, count in conditions}
    
    good_condition = cond_dict.get("Good", 0)
    fair_condition = cond_dict.get("Fair", 0)
    poor_condition = cond_dict.get("Poor", 0)
    
    orgs = db.query(Park.organization).distinct().count()
    
    recent_surveys = db.query(Park).filter(Park.survey_score != None).count()
    
    return {
        "total_parks": total_parks,
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
