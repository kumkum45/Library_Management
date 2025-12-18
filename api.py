from flask import app, jsonify, request, session, session
from sqlalchemy import or_
from sqlalchemy.orm import sessionmaker,joinedload
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
    @app.route("/books/search", defaults={"search_param": None}, methods=["GET"])
    @app.route("/books/search/<search_param>", methods=["GET"])
    def search_books(search_param):
        session = SessionLocal()

        # Start base query
        query = session.query(Book).options(joinedload(Book.author))

        # Apply search_param if provided
        if search_param:
            if search_param.isdigit():  # numeric → book ID
                query = query.filter(Book.id == int(search_param))
            else:  # string → book title (case-insensitive)
                query = query.filter(Book.title.ilike(f"%{search_param}%"))

        # Optional query params
        category = request.args.get("category")
        status = request.args.get("status")

        if category:
            query = query.filter(Book.category.ilike(f"%{category}%"))
        if status:
            query = query.filter(Book.status.ilike(f"%{status}%"))

        books = query.all()

        if not books:
            session.close()
            return jsonify({"message": "No books found"}), 404

        result = [
            {
                "id": b.id,
                "title": b.title,
                "category": b.category,
                "status": b.status,
                "author_id": b.author_id,
                "author_name": b.author.name if b.author else None
            }
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
   