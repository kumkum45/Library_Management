from flask import Flask, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv


from sqlalchemy.orm import sessionmaker
from models import Author,Book,User, IssuedBook
from database import engine
from models import Base
from api import register_routes
from auth.token import register_auth_routes

# load .env values into environment
load_dotenv()

app = Flask(__name__)
# Enable CORS for all origins with proper configuration
CORS(app, resources={r"/*": {"origins": "*", "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"], "allow_headers": ["Content-Type", "Authorization"]}})
# Load SECRET_KEY from environment; fail fast if missing to avoid token mismatches
secret = os.environ.get('SECRET_KEY')
if not secret:
    raise RuntimeError('SECRET_KEY is not set. Define it in .env or environment before starting the app.')
app.config['SECRET_KEY'] = secret

# Create all tables on startup
try:
    Base.metadata.create_all(bind=engine)
    print("✓ Database tables created/verified successfully!")
except Exception as e:
    print(f"⚠ Warning: Could not create database tables: {str(e)}")

# Global error handler for uncaught exceptions
@app.errorhandler(500)
def internal_error(error):
    print(f"500 Error: {str(error)}")
    return jsonify({"error": "Internal server error"}), 500

@app.errorhandler(Exception)
def handle_exception(error):
    print(f"Exception: {str(error)}")
    return jsonify({"error": str(error)}), 500

register_auth_routes(app)
register_routes(app)


if __name__ == "__main__":
    app.run(debug=True)




