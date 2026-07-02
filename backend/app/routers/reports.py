from datetime import datetime
from pathlib import Path
import json

from fastapi import APIRouter, Depends
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import SimpleDocTemplate, Paragraph

from openpyxl import Workbook

from app.database import SessionLocal
from app.models import Report, Park
from app.schemas import ReportResponse
from app.crud import get_parks_geojson

router = APIRouter(
    prefix="/reports",
    tags=["Reports"]
)


# ---------------------------------------------------------
# Reports Folder
# ---------------------------------------------------------

BASE_DIR = Path(__file__).resolve().parent.parent.parent

REPORTS_DIR = BASE_DIR / "reports"

REPORTS_DIR.mkdir(
    parents=True,
    exist_ok=True
)


# ---------------------------------------------------------
# Database
# ---------------------------------------------------------

def get_db():

    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()


# ---------------------------------------------------------
# Report History
# ---------------------------------------------------------

@router.get(
    "/history",
    response_model=list[ReportResponse]
)
def get_reports_history(
    db: Session = Depends(get_db)
):

    return (
        db.query(Report)
        .order_by(
            Report.created_at.desc()
        )
        .limit(20)
        .all()
    )


# ---------------------------------------------------------
# Spatial Summary
# ---------------------------------------------------------

@router.get("/summary")
def get_reports_summary(
    db: Session = Depends(get_db)
):

    total = db.query(Park).count()

    good = (
        db.query(Park)
        .filter(Park.condition == "Good")
        .count()
    )

    fair = (
        db.query(Park)
        .filter(Park.condition == "Fair")
        .count()
    )

    poor = (
        db.query(Park)
        .filter(Park.condition == "Poor")
        .count()
    )

    organizations = len(
        set(
            park.organization
            for park in db.query(Park).all()
            if park.organization
        )
    )

    average_score = 0

    parks = db.query(Park).all()

    if parks:

        scores = [
            p.survey_score
            for p in parks
            if p.survey_score is not None
        ]

        if scores:
            average_score = round(
                sum(scores) / len(scores),
                2
            )

    summary = (
        f"UrbanIQ currently manages "
        f"{total} public parks. "
        f"{good} are in Good condition, "
        f"{fair} require monitoring, "
        f"and {poor} require maintenance. "
        f"The average survey score is "
        f"{average_score}%."
    )

    return {

        "total_parks": total,

        "good": good,

        "fair": fair,

        "poor": poor,

        "organizations": organizations,

        "average_survey_score": average_score,

        "summary": summary,
    }


# ---------------------------------------------------------
# Helper
# ---------------------------------------------------------

def save_report_history(
    db: Session,
    filename: str,
    report_format: str,
):

    report = Report(

        filename=filename,

        format=report_format,
    )

    db.add(report)

    db.commit()

    db.refresh(report)

    return report


# ---------------------------------------------------------
# Export PDF
# ---------------------------------------------------------

@router.post("/pdf")
def export_pdf(
    db: Session = Depends(get_db)
):

    summary = get_reports_summary(db)

    filename = (
        f"UrbanIQ_Report_"
        f"{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
    )

    filepath = REPORTS_DIR / filename

    styles = getSampleStyleSheet()

    document = SimpleDocTemplate(str(filepath))

    story = []

    story.append(
        Paragraph(
            "<b><font size=22>UrbanIQ GIS Report</font></b>",
            styles["Title"],
        )
    )

    story.append(
        Paragraph(
            f"Generated: {datetime.now()}",
            styles["Normal"],
        )
    )

    story.append(
        Paragraph("<br/>", styles["Normal"])
    )

    story.append(
        Paragraph(
            f"<b>Total Parks:</b> {summary['total_parks']}",
            styles["BodyText"],
        )
    )

    story.append(
        Paragraph(
            f"<b>Good:</b> {summary['good']}",
            styles["BodyText"],
        )
    )

    story.append(
        Paragraph(
            f"<b>Fair:</b> {summary['fair']}",
            styles["BodyText"],
        )
    )

    story.append(
        Paragraph(
            f"<b>Poor:</b> {summary['poor']}",
            styles["BodyText"],
        )
    )

    story.append(
        Paragraph(
            f"<b>Organizations:</b> {summary['organizations']}",
            styles["BodyText"],
        )
    )

    story.append(
        Paragraph(
            f"<b>Average Survey:</b> {summary['average_survey_score']}%",
            styles["BodyText"],
        )
    )

    story.append(
        Paragraph("<br/>", styles["Normal"])
    )

    story.append(
        Paragraph(
            summary["summary"],
            styles["BodyText"],
        )
    )

    document.build(story)

    save_report_history(
        db,
        filename,
        "PDF",
    )

    return FileResponse(
        filepath,
        filename=filename,
        media_type="application/pdf",
    )


# ---------------------------------------------------------
# Export Excel
# ---------------------------------------------------------

@router.post("/excel")
def export_excel(
    db: Session = Depends(get_db)
):

    filename = (
        f"UrbanIQ_Parks_"
        f"{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"
    )

    filepath = REPORTS_DIR / filename

    workbook = Workbook()

    sheet = workbook.active

    sheet.title = "Parks"

    sheet.append(
        [
            "ID",
            "Name",
            "Condition",
            "Organization",
            "Survey Score",
            "Area",
        ]
    )

    parks = db.query(Park).all()

    for park in parks:

        sheet.append(
            [
                park.id,
                park.name,
                park.condition,
                park.organization,
                park.survey_score,
                park.area,
            ]
        )

    workbook.save(filepath)

    save_report_history(
        db,
        filename,
        "Excel",
    )

    return FileResponse(
        filepath,
        filename=filename,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    )

# ---------------------------------------------------------
# Export GeoJSON
# ---------------------------------------------------------

@router.post("/geojson")
def export_geojson(
    db: Session = Depends(get_db)
):

    filename = (
        f"UrbanIQ_Parks_"
        f"{datetime.now().strftime('%Y%m%d_%H%M%S')}.geojson"
    )

    filepath = REPORTS_DIR / filename

    geojson = get_parks_geojson(db)

    with open(filepath, "w", encoding="utf-8") as file:
        json.dump(
            geojson,
            file,
            indent=2
        )

    save_report_history(
        db,
        filename,
        "GeoJSON",
    )

    return FileResponse(
        path=filepath,
        filename=filename,
        media_type="application/geo+json",
    )


# ---------------------------------------------------------
# Download Report
# ---------------------------------------------------------

@router.get("/download/{filename}")
def download_report(
    filename: str
):

    filepath = REPORTS_DIR / filename

    if not filepath.exists():

        return {
            "success": False,
            "message": "Report not found."
        }

    return FileResponse(
        path=filepath,
        filename=filename,
        media_type="application/octet-stream",
    )


# ---------------------------------------------------------
# Delete Report
# ---------------------------------------------------------

@router.delete("/{report_id}")
def delete_report(
    report_id: int,
    db: Session = Depends(get_db)
):

    report = (
        db.query(Report)
        .filter(Report.id == report_id)
        .first()
    )

    if report is None:

        return {
            "success": False,
            "message": "Report not found."
        }

    filepath = REPORTS_DIR / report.filename

    if filepath.exists():
        filepath.unlink()

    db.delete(report)

    db.commit()

    return {
        "success": True,
        "message": "Report deleted successfully."
    }


# ---------------------------------------------------------
# Report Statistics
# ---------------------------------------------------------

@router.get("/stats")
def report_statistics(
    db: Session = Depends(get_db)
):

    reports = db.query(Report).all()

    pdf = sum(
        1
        for r in reports
        if r.format == "PDF"
    )

    excel = sum(
        1
        for r in reports
        if r.format == "Excel"
    )

    geojson = sum(
        1
        for r in reports
        if r.format == "GeoJSON"
    )

    return {

        "total_reports": len(reports),

        "pdf_reports": pdf,

        "excel_reports": excel,

        "geojson_reports": geojson,

    }


# ---------------------------------------------------------
# Health Check
# ---------------------------------------------------------

@router.get("/")
def reports_root():

    return {
        "module": "UrbanIQ Reports",
        "status": "Running",
        "storage": str(REPORTS_DIR),
    }