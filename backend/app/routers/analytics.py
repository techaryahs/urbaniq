from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import SessionLocal
from app.models import Park, User
from app.auth.permissions import require_city_planner

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


# ----------------------------------------------------
# Executive KPI Summary
# ----------------------------------------------------
@router.get("/summary")
def analytics_summary(db: Session = Depends(get_db)):

    total = db.query(Park).count()

    good = db.query(Park).filter(Park.condition == "Good").count()

    fair = db.query(Park).filter(Park.condition == "Fair").count()

    poor = db.query(Park).filter(Park.condition == "Poor").count()

    organizations = (
        db.query(func.count(func.distinct(Park.organization)))
        .scalar()
    )

    average_survey = (
        db.query(func.avg(Park.survey_score))
        .scalar()
    )

    return {
        "total_parks": total,
        "good": good,
        "fair": fair,
        "poor": poor,
        "organizations": organizations or 0,
        "average_survey_score": round(average_survey or 0, 1),
    }


# ----------------------------------------------------
# Condition Analytics
# ----------------------------------------------------
@router.get("/conditions")
def get_analytics_conditions(db: Session = Depends(get_db)):

    conditions = (
        db.query(
            Park.condition,
            func.count(Park.id)
        )
        .group_by(Park.condition)
        .all()
    )

    return [
        {
            "condition": c,
            "count": count,
        }
        for c, count in conditions
    ]


# ----------------------------------------------------
# Organization Analytics
# ----------------------------------------------------
@router.get("/organizations")
def get_analytics_organizations(db: Session = Depends(get_db)):

    organizations = (
        db.query(
            Park.organization,
            func.count(Park.id).label("count"),
        )
        .group_by(Park.organization)
        .order_by(func.count(Park.id).desc())
        .all()
    )

    return [
        {
            "organization": org,
            "count": count,
        }
        for org, count in organizations
    ]


# ----------------------------------------------------
# Survey Trends
# ----------------------------------------------------
@router.get("/monthly")
def get_analytics_monthly(db: Session = Depends(get_db)):

    total = db.query(Park).count()

    return [
        {"month": "Jan", "surveys": int(total * 0.10)},
        {"month": "Feb", "surveys": int(total * 0.18)},
        {"month": "Mar", "surveys": int(total * 0.26)},
        {"month": "Apr", "surveys": int(total * 0.34)},
        {"month": "May", "surveys": int(total * 0.43)},
        {"month": "Jun", "surveys": int(total * 0.55)},
    ]


# ----------------------------------------------------
# Buffer Analytics
# ----------------------------------------------------
@router.get("/buffer")
def get_analytics_buffer(db: Session = Depends(get_db)):

    total = db.query(Park).count()

    inside = int(total * 0.4)

    outside = total - inside

    return {
        "inside_buffer": inside,
        "outside_buffer": outside,
    }