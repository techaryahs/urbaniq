from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from geoalchemy2 import Geometry

from app.database import Base


class Park(Base):
    __tablename__ = "parks"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    area = Column(Integer)

    location = Column(
        Geometry("POINT", srid=4326)
    )

    condition = Column(String, default="Good")
    organization = Column(String, default="Parks Dept")
    survey_score = Column(Float, default=85.0)


class Activity(Base):
    __tablename__ = "activities"

    id = Column(Integer, primary_key=True, index=True)
    action = Column(String, nullable=False)
    details = Column(String, nullable=False)
    timestamp = Column(DateTime, default=func.now())


class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, nullable=False)
    format = Column(String, nullable=False)
    created_at = Column(DateTime, default=func.now())


class Upload(Base):
    __tablename__ = "uploads"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, nullable=False)
    status = Column(String, default="Processing")
    uploaded_at = Column(DateTime, default=func.now())


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    full_name = Column(String(100), nullable=False)

    email = Column(String(150), unique=True, index=True, nullable=False)

    password = Column(String(255), nullable=False)

    role = Column(String(30), nullable=False, default="researcher")

    created_at = Column(DateTime, nullable=False, server_default=func.now())

    # Relationships
    surveys = relationship("Survey", back_populates="researcher", cascade="all, delete-orphan")
    public_spaces = relationship("PublicSpace", back_populates="creator")


class Organization(Base):
    __tablename__ = "organizations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), unique=True, nullable=False, index=True)
    address = Column(String(255), nullable=True)
    email = Column(String(150), nullable=True)
    phone = Column(String(50), nullable=True)
    contact_person = Column(String(100), nullable=True)
    created_at = Column(DateTime, nullable=False, server_default=func.now())
    updated_at = Column(DateTime, nullable=False, server_default=func.now(), onupdate=func.now())

    public_spaces = relationship("PublicSpace", back_populates="organization")


# Import Survey & PublicSpace at the bottom to register it with Base and make it available in app.models
from app.models.public_space import PublicSpace, PublicSpaceType
from app.models.survey import Survey
