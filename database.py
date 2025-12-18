from sqlalchemy import create_engine,Column, Integer, String,ForeignKey
from sqlalchemy.orm import sessionmaker, declarative_base , relationship


db_url="postgresql://postgres:root@localhost:5432/Library_db"

engine = create_engine(db_url)
Base=declarative_base()