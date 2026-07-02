from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import Report, Park
from app.schemas import ReportResponse

router = APIRouter(
    prefix="/reports",
    tags=["Reports"]
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/history", response_model=list[ReportResponse])
def get_reports_history(db: Session = Depends(get_db)):
    reports = db.query(Report).order_by(Report.created_at.desc()).limit(10).all()
    return reports

@router.get("/summary")
def get_reports_summary(db: Session = Depends(get_db)):
    total = db.query(Park).count()
    poor_count = db.query(Park).filter(Park.condition == "Poor").count()
    poor_percentage = int((poor_count / total * 100)) if total > 0 else 0
    
    return {
        "summary": f"The UrbanIQ intelligence platform has processed {total} public spaces. "
                   f"Recent analytics indicate that {100 - poor_percentage}% of parks are in acceptable condition. "
                   f"A comprehensive maintenance report is recommended for Q3 to address the {poor_percentage}% of parks currently marked in 'Poor' condition."
    }
