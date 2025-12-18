from flask import app, jsonify, request, session, session
from sqlalchemy import or_
from sqlalchemy.orm import sessionmaker
from database import engine
from models import Base
from models import Book, Author, User, IssuedBook
SessionLocal = sessionmaker(bind=engine)

def register_routes(app):
    @app.route("/")
    def index():
        return jsonify({"message": "Flask app running successfully!"})



    from sqlalchemy import or_

# 🔍 Search OR return all books
    @app.route("/books", methods=["GET"])
    def get_books():
        session = SessionLocal()
        books = session.query(Book).all()
        result = [
            {"id": b.id, "title": b.title, "category": b.category,
             "status": b.status, "author": b.author.name}
            for b in books
        ]
        session.close()
        return jsonify(result)

    

    @app.route("/books", methods=["POST"])
    def add_book():
        data = request.get_json()
        session = SessionLocal()
        new_book = Book(
            title=data["title"],
            category=data["category"],
            author_id=data["author_id"],
            isbn=data["isbn"]
        )
        session.add(new_book)
        session.commit()
        session.close()
        return jsonify({"message": "Book added successfully!"})
    

    @app.route("/books/<int:book_id>", methods=["DELETE"])
    def delete_book(book_id):
        session = SessionLocal()
    
    # Find book by id
        book = session.query(Book).get(book_id)
        if not book:
           session.close()
           return jsonify({"message": "Book not found"}), 404

        session.delete(book)
        session.commit()
        session.close()
        return jsonify({"message": f"Book with id {book_id} deleted successfully!"})
    
    @app.route("/authors", methods=["GET"])
    def get_authors():
        session = SessionLocal()
        authors = session.query(Author).all()
        result = [
            {"id": a.id, "name": a.name, "bio": a.bio}
            for a in authors
        ]
        session.close()
        return jsonify(result)
    
    @app.route("/authors", methods=["POST"])
    def add_author():
        data = request.get_json()
        session = SessionLocal()
        new_author = Author(
            name=data["name"],
            bio=data.get("bio", "")
        )
        session.add(new_author)
        session.commit()
        session.close()
        return jsonify({"message": "Author added successfully!"})
    
    @app.route("/authors/<int:author_id>", methods=["DELETE"])
    def delete_author(author_id):
        session = SessionLocal()
        author = session.query(Author).get(author_id)
        if not author:
           session.close()
           return jsonify({"message": "Author not found"}), 404

        session.delete(author)
        session.commit()
        session.close()
        return jsonify({"message": f"Author with id {author_id} deleted successfully!"})
    
    
    Base.metadata.create_all(bind=engine)
   