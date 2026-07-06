from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date, datetime

from app.database import SessionLocal
from app.models import User, Organization
from app.models.public_space import PublicSpace, PublicSpaceType
from app.models.survey import Survey
from app.auth.permissions import require_roles

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
    total = db.query(PublicSpace).count()
    good = db.query(PublicSpace).filter(PublicSpace.condition == "Good").count()
    fair = db.query(PublicSpace).filter(PublicSpace.condition == "Fair").count()
    poor = db.query(PublicSpace).filter(PublicSpace.condition == "Poor").count()

    organizations = (
        db.query(func.count(func.distinct(PublicSpace.organization_id)))
        .scalar()
    )

    average_survey = (
        db.query(func.avg(PublicSpace.survey_score))
        .scalar()
    )

    return {
        "total_parks": total,              # backward compatibility
        "total_public_spaces": total,       # new shape
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
            PublicSpace.condition,
            func.count(PublicSpace.id)
        )
        .group_by(PublicSpace.condition)
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
            Organization.name,
            func.count(PublicSpace.id).label("count"),
        )
        .join(PublicSpace, PublicSpace.organization_id == Organization.id)
        .group_by(Organization.name)
        .order_by(func.count(PublicSpace.id).desc())
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
    total = db.query(PublicSpace).count()

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
    total = db.query(PublicSpace).count()
    inside = int(total * 0.4)
    outside = total - inside

    return {
        "inside_buffer": inside,
        "outside_buffer": outside,
    }


# ----------------------------------------------------
# Surveys Analytics
# ----------------------------------------------------
@router.get("/surveys/trends")
def get_survey_trends(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("researcher", "city_planner"))
):
    results = (
        db.query(
            func.date(Survey.survey_date).label("day"),
            func.count(Survey.id).label("count")
        )
        .group_by("day")
        .order_by("day")
        .all()
    )
    return [{"date": str(r[0]), "count": r[1]} for r in results]


@router.get("/surveys/monthly")
def get_survey_monthly(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("researcher", "city_planner"))
):
    results = (
        db.query(
            func.to_char(Survey.survey_date, "YYYY-MM").label("month"),
            func.count(Survey.id).label("count")
        )
        .group_by("month")
        .order_by("month")
        .all()
    )
    return [{"month": r[0], "surveys": r[1]} for r in results]


@router.get("/surveys/conditions")
def get_survey_conditions(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("researcher", "city_planner"))
):
    results = (
        db.query(
            Survey.condition,
            func.count(Survey.id).label("count")
        )
        .group_by(Survey.condition)
        .all()
    )
    return [{"condition": r[0], "count": r[1]} for r in results]


@router.get("/surveys/productivity")
def get_survey_productivity(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("researcher", "city_planner"))
):
    results = (
        db.query(
            User.full_name,
            func.count(Survey.id).label("count")
        )
        .join(Survey, Survey.researcher_id == User.id)
        .group_by(User.full_name)
        .order_by(func.count(Survey.id).desc())
        .all()
    )
    return [{"researcher": r[0], "count": r[1]} for r in results]


@router.get("/surveys/average-score")
def get_survey_average_score(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("researcher", "city_planner"))
):
    avg_score = db.query(func.avg(Survey.score)).scalar()
    return {"average_score": round(avg_score or 0.0, 2)}


@router.get("/surveys/park-counts")
def get_survey_park_counts(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("researcher", "city_planner"))
):
    results = (
        db.query(
            PublicSpace.name,
            func.count(Survey.id).label("count")
        )
        .join(Survey, Survey.public_space_id == PublicSpace.id)
        .group_by(PublicSpace.name)
        .order_by(func.count(Survey.id).desc())
        .all()
    )
    return [{"park_name": r[0], "count": r[1]} for r in results]


# Also add public space counts alias
@router.get("/surveys/public-space-counts")
def get_survey_public_space_counts(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("researcher", "city_planner"))
):
    results = (
        db.query(
            PublicSpace.name,
            func.count(Survey.id).label("count")
        )
        .join(Survey, Survey.public_space_id == PublicSpace.id)
        .group_by(PublicSpace.name)
        .order_by(func.count(Survey.id).desc())
        .all()
    )
    return [{"public_space_name": r[0], "count": r[1]} for r in results]


@router.get("/researcher-dashboard")
def get_researcher_dashboard_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("researcher", "city_planner"))
):
    total = db.query(Survey).count()
    
    today_start = datetime.combine(date.today(), datetime.min.time())
    today_count = db.query(Survey).filter(
        Survey.survey_date >= today_start
    ).count()

    avg_score = db.query(func.avg(Survey.score)).scalar()

    total_public_spaces = db.query(PublicSpace).count()

    latest_survey = db.query(Survey).order_by(Survey.survey_date.desc()).first()

    latest_survey_dict = None
    if latest_survey:
        space_name = db.query(PublicSpace.name).filter(PublicSpace.id == latest_survey.public_space_id).scalar()
        latest_survey_dict = {
            "id": latest_survey.id,
            "park_id": latest_survey.public_space_id,              # legacy
            "public_space_id": latest_survey.public_space_id,       # new
            "park_name": space_name or "Unknown",                   # legacy
            "public_space_name": space_name or "Unknown",           # new
            "score": latest_survey.score,
            "condition": latest_survey.condition,
            "survey_date": latest_survey.survey_date,
        }

    return {
        "total_public_spaces": total_public_spaces,
        "total_surveys": total,
        "todays_surveys": today_count,
        "completed_surveys": total,
        "average_score": round(avg_score or 0.0, 2),
        "latest_survey": latest_survey_dict
    }