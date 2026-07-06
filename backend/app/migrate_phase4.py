import sys
import os
from sqlalchemy import text

# Add parent directory to python path to resolve app package
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import engine, Base, SessionLocal
from app.models import User, Organization

def run_migration_phase4():
    print("=== STARTING PHASE 4 MIGRATION (SQL STRATEGY) ===")
    
    db = SessionLocal()
    try:
        # 1. Create the public_spaces table
        print("Creating public_spaces table...")
        Base.metadata.create_all(bind=engine)
        
        # Check if migrations were already done (e.g. if public_spaces has rows)
        existing_count = db.execute(text("SELECT COUNT(*) FROM public_spaces")).scalar()
        if existing_count > 0:
            print("public_spaces table already has data. Migration looks already complete.")
            return

        # 2. Map organizations name -> id. Load from DB.
        print("Mapping existing organizations...")
        orgs = db.query(Organization).all()
        org_map = {o.name.strip().lower(): o.id for o in orgs}

        # 3. Retrieve default researcher to associate migrated parks
        researcher = db.query(User).filter(User.role == "researcher").first()
        researcher_id = researcher.id if researcher else None
        print(f"Default researcher ID for created_by: {researcher_id}")

        # 4. Insert into public_spaces using database-level SQL copy to avoid WKBElement errors
        print("Copying records from parks to public_spaces in DB...")
        db.execute(text("""
            INSERT INTO public_spaces (id, name, type, description, latitude, longitude, area, condition, survey_score, created_by, location, created_at, updated_at, version)
            SELECT id, name, 'PARK', 'Migrated from parks', 
                   CASE WHEN location IS NOT NULL THEN ST_Y(location::geometry) ELSE 0.0 END, 
                   CASE WHEN location IS NOT NULL THEN ST_X(location::geometry) ELSE 0.0 END, 
                   COALESCE(area, 0), COALESCE(condition, 'Good'), COALESCE(survey_score, 85.0), 
                   :created_by, location, NOW(), NOW(), 1 
            FROM parks
        """), {"created_by": researcher_id})
        db.commit()

        # Update organization relations
        print("Migrating and updating park organization foreign keys...")
        parks = db.execute(text("SELECT id, organization FROM parks")).fetchall()
        for p in parks:
            p_id, organization_str = p
            if organization_str:
                org_key = organization_str.strip().lower()
                org_id = None
                if org_key in org_map:
                    org_id = org_map[org_key]
                else:
                    # Create new organization to preserve metadata
                    new_org = Organization(name=organization_str.strip())
                    db.add(new_org)
                    db.commit()
                    db.refresh(new_org)
                    org_map[org_key] = new_org.id
                    org_id = new_org.id
                    print(f"Created missing Organization: {organization_str}")

                db.execute(text("""
                    UPDATE public_spaces 
                    SET organization_id = :org_id 
                    WHERE id = :p_id
                """), {"org_id": org_id, "p_id": p_id})
        db.commit()
        print("Parks migrated successfully to public_spaces.")

        # 5. Check if surveys table needs updating (does it have park_id column?)
        columns_survey = db.execute(text(
            "SELECT column_name FROM information_schema.columns WHERE table_name='surveys'"
        )).fetchall()
        columns_survey_names = [r[0] for r in columns_survey]

        if "park_id" in columns_survey_names:
            print("Altering surveys table to use public_space_id instead of park_id...")
            
            # Add public_space_id column (allow NULL initially for safety)
            db.execute(text("ALTER TABLE surveys ADD COLUMN IF NOT EXISTS public_space_id INTEGER"))
            db.commit()
            
            # Copy park_id references to public_space_id
            db.execute(text("UPDATE surveys SET public_space_id = park_id"))
            db.commit()
            
            # We need to drop the old foreign key constraint. Let's find it.
            constraints = db.execute(text("""
                SELECT constraint_name 
                FROM information_schema.key_column_usage 
                WHERE table_name='surveys' AND column_name='park_id'
            """)).fetchall()
            for row in constraints:
                c_name = row[0]
                print(f"Dropping constraint {c_name} on surveys(park_id)...")
                db.execute(text(f"ALTER TABLE surveys DROP CONSTRAINT IF EXISTS {c_name}"))
            
            # Drop column park_id
            db.execute(text("ALTER TABLE surveys DROP COLUMN IF EXISTS park_id"))
            db.commit()
            
            # Force public_space_id as NOT NULL
            db.execute(text("ALTER TABLE surveys ALTER COLUMN public_space_id SET NOT NULL"))
            db.commit()

            # Add new Foreign Key constraint referencing public_spaces.id
            db.execute(text("""
                ALTER TABLE surveys 
                ADD CONSTRAINT fk_surveys_public_space 
                FOREIGN KEY (public_space_id) 
                REFERENCES public_spaces(id) 
                ON DELETE CASCADE
            """))
            db.commit()
            print("surveys table schema altered successfully.")
        else:
            print("surveys table already altered. Skipping columns mutation.")

        print("=== MIGRATION COMPLETED SUCCESSFULLY ===")

    except Exception as e:
        db.rollback()
        print(f"Migration failed: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    run_migration_phase4()
