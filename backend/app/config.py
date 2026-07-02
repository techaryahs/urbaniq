from dotenv import load_dotenv
import os

# Load variables from .env
load_dotenv()

# Read the database URL
DATABASE_URL = os.getenv("DATABASE_URL")