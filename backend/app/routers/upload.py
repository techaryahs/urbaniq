from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import Upload, Park, Activity, User
from app.auth.permissions import require_researcher
from app.schemas import UploadResponse
import json
from shapely.geometry import shape
from geoalchemy2.shape import from_shape

router = APIRouter(
    prefix="/upload",
    tags=["Upload"]
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/")
def upload_file(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_researcher),
):
    imported_count = 0
    try:
        content = file.file.read()
        geojson_data = json.loads(content)
        
        if geojson_data.get("type") == "FeatureCollection":
            features = geojson_data.get("features", [])
            for feature in features:
                properties = feature.get("properties", {})
                geometry_data = feature.get("geometry", None)
                
                if not geometry_data or geometry_data.get("type") != "Point":
                    continue
                
                name = properties.get("name", "Unnamed Park")
                
                # Check for duplicates by name
                existing = db.query(Park).filter(Park.name == name).first()
                if existing:
                    continue
                
                
                # Case-insensitive extraction of condition
                raw_condition = None
                for k, v in properties.items():
                    if k.lower() == "condition":
                        raw_condition = v
                        break
                
                if raw_condition is None:
                    condition = "Good"
                else:
                    norm_cond = str(raw_condition).strip().title()
                    if norm_cond in ["Good", "Fair", "Poor"]:
                        condition = norm_cond
                    else:
                        condition = "Unknown"

                organization = properties.get("organization", "Parks Dept")
                
                shapely_geom = shape(geometry_data)
                
                new_park = Park(
                    name=name,
                    condition=condition,
                    organization=organization,
                    location=from_shape(shapely_geom, srid=4326)
                )
                db.add(new_park)
                imported_count += 1
            
            db.commit()
            
            # Log activity
            if imported_count > 0:
                db.add(Activity(
                    action="Data Import",
                    details=f"Imported {imported_count} new parks from {file.filename}"
                ))
                db.commit()
    except Exception as e:
        print(f"Error parsing GeoJSON: {e}")
        # Could just save the upload file metadata if it's a CSV or zip
        pass

    new_upload = Upload(
        filename=file.filename,
        status="Done"
    )
    db.add(new_upload)
    db.commit()
    db.refresh(new_upload)
    return {
        "success": True,
        "message": f"File uploaded successfully. Imported {imported_count} parks.",
        "filename": new_upload.filename,
        "imported_count": imported_count
    }
@router.get("/history", response_model=list[UploadResponse])
def get_upload_history(db: Session = Depends(get_db)):
    uploads = db.query(Upload).order_by(Upload.uploaded_at.desc()).limit(10).all()
    return uploads
