import enum
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, func, Enum as SAEnum
from sqlalchemy.orm import relationship
from geoalchemy2 import Geometry
from app.database import Base

class PublicSpaceType(str, enum.Enum):
    PARK = "PARK"
    LAKE = "LAKE"
    SCHOOL = "SCHOOL"
    GARDEN = "GARDEN"
    PLAYGROUND = "PLAYGROUND"
    OPEN_SPACE = "OPEN_SPACE"

class PublicSpace(Base):
    __tablename__ = "public_spaces"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    type = Column(SAEnum(PublicSpaceType), nullable=False)
    description = Column(String(500), nullable=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    area = Column(Integer, nullable=True)
    condition = Column(String(50), default="Good")
    survey_score = Column(Float, default=85.0)
    organization_id = Column(Integer, ForeignKey("organizations.id", ondelete="SET NULL"), nullable=True)
    created_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, nullable=False, server_default=func.now())
    updated_at = Column(DateTime, nullable=False, server_default=func.now(), onupdate=func.now())
    version = Column(Integer, default=1)
    
    location = Column(Geometry("POINT", srid=4326), nullable=True)

    # Relationships
    organization = relationship("Organization", back_populates="public_spaces")
    creator = relationship("User", back_populates="public_spaces")
    surveys = relationship("Survey", back_populates="public_space", cascade="all, delete-orphan")
