from datetime import datetime, timedelta
import hashlib
import hmac
import secrets
import time
import traceback

from flask import jsonify, request, g, current_app
from functools import wraps
import jwt
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import sessionmaker

from database import engine
from models import User

SessionLocal = sessionmaker(bind=engine)


def hash_password(password: str) -> str:
    """Hash a password using SHA-256 with a per-user salt."""
    salt = secrets.token_hex(16)
    digest = hashlib.sha256((salt + password).encode("utf-8")).hexdigest()
    return f"{salt}${digest}"


def verify_password(stored_value: str, provided_password: str) -> bool:
    """Verify a provided password against the stored salt+hash."""
    if not stored_value or "$" not in stored_value:
        return False
    salt, stored_digest = stored_value.split("$", 1)
    computed = hashlib.sha256((salt + provided_password).encode("utf-8")).hexdigest()
    return hmac.compare_digest(stored_digest, computed)


def generate_access_token(user, secret: str) -> str:
    now = time.time()
    payload = {
        "user_id": user.id,
        "email": user.email,
        "iat": int(now),
        "exp": int(now + (24 * 3600)),
    }
    token = jwt.encode(payload, secret, algorithm="HS256")
    if isinstance(token, bytes):
        token = token.decode("utf-8")
    return token


def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth = request.headers.get("Authorization", "")
        token = auth.split(" ", 1)[1] if auth.startswith("Bearer ") else None
        if not token:
            return jsonify({"error": "Token is missing"}), 401

        secret = current_app.config.get("SECRET_KEY")
        if not secret:
            return jsonify({"error": "Server configuration error: SECRET_KEY not found"}), 500
        try:
            data = jwt.decode(token, secret, algorithms=["HS256"])
            user_id = data.get("user_id")
            if not user_id:
                return jsonify({"error": "Token is invalid"}), 401

            db = SessionLocal()
            user = db.get(User, user_id)
            db.close()
            if not user:
                return jsonify({"error": "Invalid token user"}), 401

            g.current_user = {
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "role": user.role,
            }
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token expired"}), 401
        except jwt.InvalidTokenError as e:
            return jsonify({"error": f"Token is invalid: {str(e)}"}), 401
        except Exception as e:
            return jsonify({"error": f"Token validation error: {str(e)}"}), 401

        return f(*args, **kwargs)

    return decorated


def register_auth_routes(app):
    @app.route("/signup", methods=["POST"])
    def signup():
        try:
            data = request.get_json()
            if not data:
                return jsonify({"error": "No JSON data provided"}), 400
                
            session = SessionLocal()

            name = data.get("name")
            email = data.get("email")
            password = data.get("password")
            role = data.get("role", "user").lower()

            if not name or not email or not password:
                session.close()
                return jsonify({"error": "Name, email and password are required"}), 400
            if role not in ("user", "admin"):
                session.close()
                return jsonify({"error": "Invalid role. Must be 'user' or 'admin'"}), 400

            pw_hash = hash_password(password)
            new_user = User(name=name, email=email, password=pw_hash, role=role)

            session.add(new_user)
            try:
                session.commit()
            except IntegrityError as e:
                session.rollback()
                session.close()
                print(f"Integrity Error: {str(e)}")
                # Check if it's email duplicate
                if "unique" in str(e).lower() or "email" in str(e).lower():
                    return jsonify({"error": "Email already exists"}), 400
                return jsonify({"error": "Database constraint violation"}), 400
            except Exception as e:
                session.rollback()
                session.close()
                print(f"Database error during signup: {str(e)}")
                traceback.print_exc()
                return jsonify({"error": f"Database error: {str(e)}"}), 500

            session.close()
            return jsonify({"message": "Signup successful. Please login to get a token"}), 201
        except Exception as e:
            print(f"Unexpected error in signup: {str(e)}")
            traceback.print_exc()
            return jsonify({"error": f"Server error: {str(e)}"}), 500

    @app.route("/login", methods=["POST"])
    def login():
        try:
            data = request.get_json()
            if not data:
                return jsonify({"error": "No JSON data provided"}), 400
            
            session = SessionLocal()

            email = data.get("email")
            password = data.get("password")
            if not email or not password:
                session.close()
                return jsonify({"error": "Email and password are required"}), 400

            user = session.query(User).filter(User.email == email).first()
            if not user:
                session.close()
                return jsonify({"error": "Invalid credentials"}), 401

            if not verify_password(user.password, password):
                session.close()
                return jsonify({"error": "Invalid credentials"}), 401

            secret = current_app.config.get("SECRET_KEY")
            if not secret:
                session.close()
                return jsonify({"error": "Server configuration error: SECRET_KEY not found"}), 500
            token = generate_access_token(user, secret)

            result = {
                "message": "Login successful",
                "token": token,
                "user": {
                    "id": user.id,
                    "name": user.name,
                    "email": user.email,
                    "role": user.role,
                },
            }

            session.close()
            return jsonify(result)
        except Exception as e:
            print(f"Unexpected error in login: {str(e)}")
            return jsonify({"error": f"Server error: {str(e)}"}), 500


__all__ = [
    "register_auth_routes",
    "token_required",
    "hash_password",
    "verify_password",
    "generate_access_token",
]
