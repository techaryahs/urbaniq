import asyncio
from sqlalchemy import text
from app.database import engine, Base
from app.models import Activity, Report, Upload, Park
import random

def run_migration():
    print("Running migration...")
    
    # Create new tables for Activity, Report, Upload if they don't exist
    Base.metadata.create_all(bind=engine)
    
    with engine.begin() as conn:
        # Check if condition column exists
        result = conn.execute(text("SELECT column_name FROM information_schema.columns WHERE table_name='parks' AND column_name='condition'"))
        if result.fetchone() is None:
            print("Adding columns to parks table...")
            conn.execute(text("ALTER TABLE parks ADD COLUMN condition VARCHAR DEFAULT 'Good'"))
            conn.execute(text("ALTER TABLE parks ADD COLUMN organization VARCHAR DEFAULT 'Parks Dept'"))
            conn.execute(text("ALTER TABLE parks ADD COLUMN survey_score FLOAT DEFAULT 85.0"))
            
            # Seed the condition randomly for existing parks
            print("Seeding random conditions and organizations for existing parks...")
            conditions = ["Good", "Fair", "Poor"]
            organizations = ["Parks Dept", "City Council", "Private HOA"]
            
            park_ids = conn.execute(text("SELECT id FROM parks")).fetchall()
            for row in park_ids:
                p_id = row[0]
                cond = random.choices(conditions, weights=[0.6, 0.3, 0.1])[0]
                org = random.choices(organizations, weights=[0.5, 0.3, 0.2])[0]
                score = random.uniform(50.0, 100.0)
                
                conn.execute(
                    text("UPDATE parks SET condition = :c, organization = :o, survey_score = :s WHERE id = :id"),
                    {"c": cond, "o": org, "s": round(score, 1), "id": p_id}
                )
            
            print("Seeding some activities...")
            conn.execute(text("INSERT INTO activities (action, details) VALUES ('System Update', 'Upgraded to Professional GIS Platform'), ('Data Import', 'Imported historical park data')"))
            
            print("Seeding some reports...")
            conn.execute(text("INSERT INTO reports (filename, format) VALUES ('Q1_Maintenance.pdf', 'PDF'), ('Survey_Results.xlsx', 'Excel')"))
            
            print("Seeding some uploads...")
            conn.execute(text("INSERT INTO uploads (filename, status) VALUES ('parks_2023.geojson', 'Done'), ('districts.zip', 'Done')"))
            
            print("Migration successful.")
        else:
            print("Columns already exist. Skipping.")

if __name__ == "__main__":
    run_migration()
