from flask import Flask, jsonify


from sqlalchemy.orm import sessionmaker
from models import Author,Book,User, IssuedBook
from database import engine
from models import Base
from api import register_routes
app = Flask(__name__)
register_routes(app)


if __name__ == "__main__":
    app.run(debug=True)




