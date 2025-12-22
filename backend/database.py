from sqlalchemy import create_engine,Column, Integer, String,ForeignKey
from sqlalchemy.orm import sessionmaker, declarative_base , relationship

# databse url
db_url="postgresql://postgres:supabase!01@db.dzikcpihkcdsblffgldy.supabase.co:5432/postgres"

engine = create_engine(db_url)
Base=declarative_base()


