from sqlalchemy import Column, Integer, String
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