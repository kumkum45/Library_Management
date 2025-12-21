"""
Migration script to add password column to users table
Run this once: python migrate.py
"""
from sqlalchemy import text, inspect
from database import engine

def add_password_column():
    with engine.connect() as connection:
        # Check if password column already exists
        inspector = inspect(engine)
        columns = [col['name'] for col in inspector.get_columns('users')]
        
        if 'password' not in columns:
            print("Adding password column to users table...")
            connection.execute(text(
                "ALTER TABLE users ADD COLUMN password VARCHAR(255) NOT NULL DEFAULT 'temp-password'"
            ))
            connection.commit()
            print("✓ Password column added successfully!")
        else:
            print("✓ Password column already exists.")

if __name__ == "__main__":
    add_password_column()
