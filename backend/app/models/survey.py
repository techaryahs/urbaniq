from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from app.database import Base


class Survey(Base):
    __tablename__ = "surveys"

    id = Column(Integer, primary_key=True, index=True)
    public_space_id = Column(Integer, ForeignKey("public_spaces.id", ondelete="CASCADE"), nullable=False)
    researcher_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    condition = Column(String(50), nullable=False)
    score = Column(Float, nullable=False)
    remarks = Column(String(500), nullable=True)
    survey_date = Column(DateTime, nullable=False, server_default=func.now())
    photos = Column(String(1000), nullable=True)  # serialized string (e.g. JSON list or comma-separated filenames)
    created_at = Column(DateTime, nullable=False, server_default=func.now())
    updated_at = Column(DateTime, nullable=False, server_default=func.now(), onupdate=func.now())

    # Relationships
    public_space = relationship("PublicSpace", back_populates="surveys")
    researcher = relationship("User", back_populates="surveys")
