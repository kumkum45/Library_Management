from flask import app, jsonify, request, session, session
from sqlalchemy import or_
from sqlalchemy.orm import sessionmaker,joinedload
from sqlalchemy.exc import IntegrityError
from database import engine
from models import Base
from models import Book, Author, User, IssuedBook
SessionLocal = sessionmaker(bind=engine)

def register_routes(app):
    @app.route("/")
    def index():
        return jsonify({"message": "Flask app running successfully!"})



    from sqlalchemy import or_
    @app.route("/books/search", defaults={"search_param": None}, methods=["GET"])
    @app.route("/books/search/<search_param>", methods=["GET"])
    def search_books(search_param):
        session = SessionLocal()

        
        query = session.query(Book).options(joinedload(Book.author))

        
        if search_param:
            if search_param.isdigit():  
                query = query.filter(Book.id == int(search_param))
            else:  
                query = query.filter(Book.title.ilike(f"%{search_param}%"))

        
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
    

    @app.route("/users", defaults={"user_id": None, "role": None}, methods=["GET"])
    @app.route("/users/<int:user_id>", defaults={"role": None}, methods=["GET"])
    @app.route("/users/role/<role>", defaults={"user_id": None}, methods=["GET"])
    def search_users(user_id, role):
        session = SessionLocal()

        query = session.query(User).options(joinedload(User.issued_books))

        
        if user_id is not None:
            query = query.filter(User.id == user_id)

        
        role_param = role or request.args.get("role")
        if role_param:
            if role_param.lower() not in ("user", "admin"):
                session.close()
                return jsonify({"error": "Invalid role. Must be 'user' or 'admin'"}), 400
            query = query.filter(User.role == role_param.lower())

       
        name = request.args.get("name")
        email = request.args.get("email")

        if name:
            query = query.filter(User.name.ilike(f"%{name}%"))
        if email:
            query = query.filter(User.email.ilike(f"%{email}%"))

        users = query.all()

        if not users:
            session.close()
            return jsonify({"message": "No users found"}), 404

        result = [
            {
                "id": u.id,
                "name": u.name,
                "email": u.email,
                "role": u.role,
                "issued_books": [
                    {"id": b.id, "book_name": b.book_name} for b in u.issued_books
                ]
            }
            for u in users
        ]

        session.close()
        return jsonify(result)



    @app.route("/users/<int:user_id>", methods=["DELETE"])
    def delete_user(user_id):
        session = SessionLocal()

        user = session.get(User, user_id)
        if not user:
            session.close()
            return jsonify({"message": "User not found"}), 404

        session.delete(user)
        session.commit()
        session.close()

        return jsonify({"message": f"User with id {user_id} deleted successfully!"})
    


    @app.route("/users", methods=["POST"])
    def add_user():
        data = request.get_json()
        session = SessionLocal()
        name = data.get("name")
        email = data.get("email")
        role = data.get("role", "user").lower()  
        if not name or not email:
            session.close()
            return jsonify({"error": "Name and email are required"}), 400
        if role not in ("user", "admin"):
            session.close()
            return jsonify({"error": "Invalid role. Must be 'user' or 'admin'"}), 400

        new_user = User(name=name, email=email, role=role)

        session.add(new_user)
        try:
            session.commit()
        except IntegrityError:
            session.rollback()
            session.close()
            return jsonify({"error": "Email already exists"}), 400

        session.close()
        return jsonify({"message": "User added successfully!"})