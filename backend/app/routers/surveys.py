import os
import uuid
import shutil
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File

from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import User
from app.auth.permissions import require_roles, require_researcher
from app.routers.auth import get_current_user
from app.schemas import (
    SurveyCreate,
    SurveyUpdate,
    SurveyResponse,
    SurveyListResponse,
    SurveyConditionEnum,
)
import app.crud as crud

router = APIRouter(
    prefix="/surveys",
    tags=["Surveys"]
)

UPLOAD_DIR = "uploads/surveys"

# Database Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# -----------------------------
# POST /surveys/upload-photos
# -----------------------------
@router.post("/upload-photos", response_model=List[str])
def upload_photos(
    files: List[UploadFile] = File(...),
    current_user: User = Depends(require_roles("researcher", "city_planner"))
):
    """
    Accept JPEG/PNG photos, save them to uploads/surveys/, validate size <= 5MB, count <= 5.
    Returns list of saved filenames.
    """
    if len(files) > 5:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You can upload a maximum of 5 photos."
        )

    saved_filenames = []
    os.makedirs(UPLOAD_DIR, exist_ok=True)

    for file in files:
        content_type = file.content_type or ""
        ext = os.path.splitext(file.filename)[1].lower() if file.filename else ""
        if content_type not in ["image/jpeg", "image/png", "image/jpg"] and ext not in [".jpg", ".jpeg", ".png"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File {file.filename} has unsupported format. Only JPG, JPEG, and PNG are allowed."
            )

        try:
            content = file.file.read()
            if len(content) > 5 * 1024 * 1024:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"File {file.filename} exceeds the 5MB size limit."
                )
            file.file.seek(0)
        except HTTPException:
            raise
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Could not read file {file.filename}."
            )

        filename = f"{uuid.uuid4()}{ext}"
        filepath = os.path.join(UPLOAD_DIR, filename)

        with open(filepath, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        saved_filenames.append(filename)

    return saved_filenames


# -----------------------------
# GET /surveys
# -----------------------------
@router.get("/", response_model=SurveyListResponse)
def list_surveys(
    public_space_id: Optional[int] = None,
    park_id: Optional[int] = None,  # backward compatibility
    researcher_id: Optional[int] = None,
    condition: Optional[SurveyConditionEnum] = None,
    min_score: Optional[float] = None,
    max_score: Optional[float] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    skip: int = 0,
    limit: int = 10,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get all surveys list matching query filters. Open to all authenticated users.
    """
    cond_str = condition.value if condition else None
    items, total = crud.get_surveys(
        db,
        public_space_id=public_space_id,
        park_id=park_id,
        researcher_id=researcher_id,
        condition=cond_str,
        min_score=min_score,
        max_score=max_score,
        start_date=start_date,
        end_date=end_date,
        skip=skip,
        limit=limit
    )
    return {"items": items, "total": total}


# -----------------------------
# GET /surveys/{id}
# -----------------------------
@router.get("/{id}", response_model=SurveyResponse)
def get_survey_info(id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Retrieve details of a survey by id.
    """
    survey = crud.get_survey(db, id)
    if not survey:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Survey not found"
        )
    return survey


# -----------------------------
# POST /surveys
# -----------------------------
@router.post("/", response_model=SurveyResponse, status_code=status.HTTP_201_CREATED)
def add_survey(
    survey_in: SurveyCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("researcher", "city_planner"))
):
    """
    Post a new Survey. City Planners and Researchers can create surveys.
    Automatically recalculates/updates associated Public Space details.
    """
    space = db.query(crud.PublicSpace).filter(crud.PublicSpace.id == survey_in.public_space_id).first()
    if not space:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Target public space not found"
        )
        
    survey = crud.create_survey(db, survey_in, current_user.id)
    return survey


# -----------------------------
# PUT /surveys/{id}
# -----------------------------
@router.put("/{id}", response_model=SurveyResponse)
def edit_survey(
    id: int,
    survey_in: SurveyUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("researcher", "city_planner"))
):
    """
    Update survey elements.
    - Researchers can only edit their own surveys.
    - City Planners can edit any survey.
    """
    survey = db.query(crud.Survey).filter(crud.Survey.id == id).first()
    if not survey:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Survey not found"
        )

    if current_user.role == "researcher" and survey.researcher_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Researchers can only edit their own surveys."
        )

    updated = crud.update_survey(db, id, survey_in)
    return updated


# -----------------------------
# DELETE /surveys/{id}
# -----------------------------
@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_survey(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("researcher", "city_planner"))
):
    """
    Delete survey by ID.
    - Researchers can only delete their own surveys.
    - City Planners can delete any survey.
    """
    survey = db.query(crud.Survey).filter(crud.Survey.id == id).first()
    if not survey:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Survey not found"
        )

    if current_user.role == "researcher" and survey.researcher_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Researchers can only delete their own surveys."
        )

    crud.delete_survey(db, id)
    return None


# -----------------------------
# GET /surveys/researcher/{id}
# -----------------------------
@router.get("/researcher/{id}", response_model=List[SurveyResponse])
def get_surveys_by_researcher_id(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retrieve all surveys submitted by a researcher.
    """
    user = db.query(User).filter(User.id == id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Researcher not found"
        )
    return crud.get_surveys_by_researcher(db, id)


# -----------------------------
# GET /surveys/park/{id} (Backward Compatibility)
# -----------------------------
@router.get("/park/{id}", response_model=List[SurveyResponse])
def get_surveys_by_park_id(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retrieve all surveys submitted for a park.
    """
    space = db.query(crud.PublicSpace).filter(crud.PublicSpace.id == id).first()
    if not space:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Park not found"
        )
    return crud.get_surveys_by_park(db, id)


# -----------------------------
# GET /surveys/public-space/{id}
# -----------------------------
@router.get("/public-space/{id}", response_model=List[SurveyResponse])
def get_surveys_by_public_space_id(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retrieve all surveys submitted for a public space.
    """
    space = db.query(crud.PublicSpace).filter(crud.PublicSpace.id == id).first()
    if not space:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Public Space not found"
        )
    return crud.get_surveys_by_public_space(db, id)
