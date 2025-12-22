from sqlalchemy import create_engine,Column, Integer, String,ForeignKey
from sqlalchemy.orm import sessionmaker, declarative_base , relationship
import os
from dotenv import load_dotenv

load_dotenv()

# Get database URL from environment variable, with fallback
db_url = os.environ.get(
    'DATABASE_URL',
    'postgresql://postgres:supabase!01@db.dzikcpihkcdsblffgldy.supabase.co:5432/postgres'
)

# Handle Heroku/Render postgres:// prefix (change to postgresql://)
if db_url.startswith('postgres://'):
    db_url = db_url.replace('postgres://', 'postgresql://', 1)

print(f"Connecting to database: {db_url.split('@')[1] if '@' in db_url else 'unknown'}")

# Create engine with connection pool settings for better reliability
engine = create_engine(
    db_url,
    pool_pre_ping=True,  # Test connection before using it
    connect_args={'connect_timeout': 10},  # 10 second timeout
    echo=False
)

Base = declarative_base()


