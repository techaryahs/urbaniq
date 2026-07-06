from datetime import datetime
from pathlib import Path
import json
import csv

from fastapi import APIRouter, Depends
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import SimpleDocTemplate, Paragraph
from reportlab.lib import colors
from reportlab.platypus import Table, TableStyle

from openpyxl import Workbook

from app.database import SessionLocal
from app.models import Report, User, Organization
from app.models.public_space import PublicSpace, PublicSpaceType
from app.models.survey import Survey
from app.auth.permissions import require_city_planner
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
REPORTS_DIR.mkdir(parents=True, exist_ok=True)

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
@router.get("/history", response_model=list[ReportResponse])
def get_reports_history(db: Session = Depends(get_db)):
    return (
        db.query(Report)
        .order_by(Report.created_at.desc())
        .limit(20)
        .all()
    )


# ---------------------------------------------------------
# Spatial Summary
# ---------------------------------------------------------
@router.get("/summary")
def get_reports_summary(db: Session = Depends(get_db)):
    total = db.query(PublicSpace).count()
    good = db.query(PublicSpace).filter(PublicSpace.condition == "Good").count()
    fair = db.query(PublicSpace).filter(PublicSpace.condition == "Fair").count()
    poor = db.query(PublicSpace).filter(PublicSpace.condition == "Poor").count()

    organizations = len(
        set(
            db.query(Organization.name)
            .join(PublicSpace, PublicSpace.organization_id == Organization.id)
            .all()
        )
    )

    average_score = 0
    spaces = db.query(PublicSpace).all()
    if spaces:
        scores = [s.survey_score for s in spaces if s.survey_score is not None]
        if scores:
            average_score = round(sum(scores) / len(scores), 2)

    summary = (
        f"UrbanIQ currently manages {total} public spaces. "
        f"{good} are in Good condition, "
        f"{fair} require monitoring, "
        f"and {poor} require maintenance. "
        f"The average survey score is {average_score}%."
    )

    return {
        "total_parks": total,              # compatibility
        "total_public_spaces": total,       # new
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
def save_report_history(db: Session, filename: str, report_format: str):
    report = Report(filename=filename, format=report_format)
    db.add(report)
    db.commit()
    db.refresh(report)
    return report


# ---------------------------------------------------------
# Export PDF
# ---------------------------------------------------------
@router.post("/pdf")
def export_pdf(db: Session = Depends(get_db)):
    summary = get_reports_summary(db)
    filename = f"UrbanIQ_Report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
    filepath = REPORTS_DIR / filename

    styles = getSampleStyleSheet()
    document = SimpleDocTemplate(str(filepath))
    story = []

    story.append(Paragraph("<b><font size=22>UrbanIQ GIS Summary Report</font></b>", styles["Title"]))
    story.append(Paragraph(f"Generated: {datetime.now()}", styles["Normal"]))
    story.append(Paragraph("<br/>", styles["Normal"]))

    story.append(Paragraph(f"<b>Total Public Spaces:</b> {summary['total_public_spaces']}", styles["BodyText"]))
    story.append(Paragraph(f"<b>Good:</b> {summary['good']}", styles["BodyText"]))
    story.append(Paragraph(f"<b>Fair:</b> {summary['fair']}", styles["BodyText"]))
    story.append(Paragraph(f"<b>Poor:</b> {summary['poor']}", styles["BodyText"]))
    story.append(Paragraph(f"<b>Organizations:</b> {summary['organizations']}", styles["BodyText"]))
    story.append(Paragraph(f"<b>Average Survey Score:</b> {summary['average_survey_score']}%", styles["BodyText"]))
    story.append(Paragraph("<br/>", styles["Normal"]))
    story.append(Paragraph(summary["summary"], styles["BodyText"]))

    document.build(story)
    save_report_history(db, filename, "PDF")

    return FileResponse(
        filepath,
        filename=filename,
        media_type="application/pdf",
    )


# ---------------------------------------------------------
# Export Excel
# ---------------------------------------------------------
@router.post("/excel")
def export_excel(db: Session = Depends(get_db)):
    filename = f"UrbanIQ_PublicSpaces_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"
    filepath = REPORTS_DIR / filename

    workbook = Workbook()
    sheet = workbook.active
    sheet.title = "Public Spaces"
    sheet.append([
        "ID", "Name", "Type", "Condition", "Organization", "Survey Score", "Area"
    ])

    spaces = db.query(PublicSpace).all()
    for space in spaces:
        org_name = db.query(Organization.name).filter(Organization.id == space.organization_id).scalar() if space.organization_id else "Parks Dept"
        sheet.append([
            space.id,
            space.name,
            space.type.value if hasattr(space.type, "value") else space.type,
            space.condition,
            org_name,
            space.survey_score,
            space.area,
        ])

    workbook.save(filepath)
    save_report_history(db, filename, "Excel")

    return FileResponse(
        filepath,
        filename=filename,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    )


# ---------------------------------------------------------
# Export GeoJSON
# ---------------------------------------------------------
@router.post("/geojson")
def export_geojson(db: Session = Depends(get_db)):
    filename = f"UrbanIQ_PublicSpaces_{datetime.now().strftime('%Y%m%d_%H%M%S')}.geojson"
    filepath = REPORTS_DIR / filename

    spaces = db.query(PublicSpace).all()
    features = []
    
    for s in spaces:
        org_name = db.query(Organization.name).filter(Organization.id == s.organization_id).scalar() if s.organization_id else "Parks Dept"
        features.append({
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [s.longitude, s.latitude]
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
        
    geojson = {
        "type": "FeatureCollection",
        "features": features
    }

    with open(filepath, "w", encoding="utf-8") as file:
        json.dump(geojson, file, indent=2)

    save_report_history(db, filename, "GeoJSON")

    return FileResponse(
        path=filepath,
        filename=filename,
        media_type="application/geo+json",
    )


# ---------------------------------------------------------
# Download Report
# ---------------------------------------------------------
@router.get("/download/{filename}")
def download_report(filename: str):
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
def delete_report(report_id: int, db: Session = Depends(get_db)):
    report = db.query(Report).filter(Report.id == report_id).first()
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
def report_statistics(db: Session = Depends(get_db)):
    reports = db.query(Report).all()
    pdf = sum(1 for r in reports if r.format == "PDF")
    excel = sum(1 for r in reports if r.format == "Excel")
    geojson = sum(1 for r in reports if r.format == "GeoJSON")

    return {
        "total_reports": len(reports),
        "pdf_reports": pdf,
        "excel_reports": excel,
        "geojson_reports": geojson,
    }


# ---------------------------------------------------------
# Survey Exports
# ---------------------------------------------------------
@router.post("/surveys/pdf")
def export_surveys_pdf(db: Session = Depends(get_db)):
    filename = f"UrbanIQ_Surveys_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
    filepath = REPORTS_DIR / filename

    styles = getSampleStyleSheet()
    document = SimpleDocTemplate(str(filepath))
    story = []

    story.append(Paragraph("<b><font size=22>UrbanIQ Survey Report</font></b>", styles["Title"]))
    story.append(Paragraph(f"Generated: {datetime.now()}", styles["Normal"]))
    story.append(Paragraph("<br/>", styles["Normal"]))

    surveys = db.query(Survey).order_by(Survey.survey_date.desc()).all()
    spaces_map = {s.id: s.name for s in db.query(PublicSpace).all()}

    data = [["Date", "Public Space", "Condition", "Score", "Remarks"]]
    for s in surveys:
        date_str = s.survey_date.strftime("%Y-%m-%d")
        space_name = spaces_map.get(s.public_space_id, "Unknown")
        remarks_truncated = (s.remarks[:30] + "...") if s.remarks and len(s.remarks) > 30 else (s.remarks or "")
        data.append([
            date_str,
            space_name,
            s.condition,
            str(s.score),
            remarks_truncated
        ])

    table = Table(data)
    table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.grey),
        ('TEXTCOLOR', (0,0), (-1,0), colors.whitesmoke),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('BOTTOMPADDING', (0,0), (-1,0), 6),
        ('GRID', (0,0), (-1,-1), 0.5, colors.grey),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,-1), 8),
    ]))

    story.append(table)
    document.build(story)

    save_report_history(db, filename, "PDF")
    return FileResponse(
        filepath,
        filename=filename,
        media_type="application/pdf"
    )


@router.post("/surveys/excel")
def export_surveys_excel(db: Session = Depends(get_db)):
    filename = f"UrbanIQ_Surveys_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"
    filepath = REPORTS_DIR / filename

    workbook = Workbook()
    sheet = workbook.active
    sheet.title = "Surveys"
    sheet.append([
        "ID", "Public Space ID", "Public Space Name", "Researcher ID", "Condition", "Score", "Remarks", "Survey Date"
    ])

    surveys = db.query(Survey).order_by(Survey.survey_date.desc()).all()
    spaces_map = {s.id: s.name for s in db.query(PublicSpace).all()}

    for s in surveys:
        sheet.append([
            s.id,
            s.public_space_id,
            spaces_map.get(s.public_space_id, "Unknown"),
            s.researcher_id,
            s.condition,
            s.score,
            s.remarks or "",
            s.survey_date.strftime("%Y-%m-%d %H:%M:%S")
        ])

    workbook.save(filepath)
    save_report_history(db, filename, "Excel")
    return FileResponse(
        filepath,
        filename=filename,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )


@router.post("/surveys/csv")
def export_surveys_csv(db: Session = Depends(get_db)):
    filename = f"UrbanIQ_Surveys_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
    filepath = REPORTS_DIR / filename

    surveys = db.query(Survey).order_by(Survey.survey_date.desc()).all()
    spaces_map = {s.id: s.name for s in db.query(PublicSpace).all()}

    with open(filepath, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["ID", "Public Space ID", "Public Space Name", "Researcher ID", "Condition", "Score", "Remarks", "Survey Date", "Photos"])
        for s in surveys:
            writer.writerow([
                s.id,
                s.public_space_id,
                spaces_map.get(s.public_space_id, "Unknown"),
                s.researcher_id,
                s.condition,
                s.score,
                s.remarks or "",
                s.survey_date.strftime("%Y-%m-%d %H:%M:%S"),
                s.photos or "[]"
            ])

    save_report_history(db, filename, "CSV")
    return FileResponse(
        path=filepath,
        filename=filename,
        media_type="text/csv"
    )