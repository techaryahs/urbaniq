from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.config import DATABASE_URL

# IMPORTANT: Import all models so SQLAlchemy registers every table
import app.models

from app.routers import (
    parks,
    dashboard,
    analytics,
    reports,
    upload,
)

print("=" * 60)
print("DATABASE_URL:", DATABASE_URL)
print("Creating database tables...")
print("=" * 60)

# Create all tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="UrbanIQ GIS API",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(parks.router)
app.include_router(dashboard.router)
app.include_router(analytics.router)
app.include_router(reports.router)
app.include_router(upload.router)


@app.get("/")
def root():
    return {
        "message": "UrbanIQ Backend Running 🚀"
    }