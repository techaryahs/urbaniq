from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.models import Park
from app.routers import parks

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="UrbanIQ GIS API",
    version="1.0.0"
)

# Enable CORS
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

app.include_router(parks.router)


@app.get("/")
def root():
    return {
        "message": "UrbanIQ Backend Running 🚀"
    }