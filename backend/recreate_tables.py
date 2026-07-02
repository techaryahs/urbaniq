from app.database import Base, engine
import app.models

print("Creating missing tables...")
Base.metadata.create_all(bind=engine)
print("Done!")