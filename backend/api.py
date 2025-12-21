from flask import jsonify, request, make_response
from sqlalchemy.orm import sessionmaker,joinedload
from sqlalchemy.exc import IntegrityError
from auth.token import token_required, hash_password
from database import engine
from models import Base
from models import Book, Author, User, IssuedBook
SessionLocal = sessionmaker(bind=engine)


def add_cors_headers(response):
    """Add CORS headers to response."""
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
    response.headers['Access-Control-Max-Age'] = '3600'
    return response
 
def register_routes(app):
    @app.route("/")
    def index():
        return jsonify({"message": "Flask app running successfully!"})



    from sqlalchemy import or_
    @app.route("/books/search", defaults={"search_param": None, "category": None, "status": None, "author": None}, methods=["GET", "OPTIONS"])
    @app.route("/books/search/<search_param>", defaults={"category": None, "status": None, "author": None}, methods=["GET", "OPTIONS"])
    @app.route("/books/search/<search_param>/<category>", defaults={"status": None, "author": None}, methods=["GET", "OPTIONS"])
    @app.route("/books/search/<search_param>/<category>/<status>", defaults={"author": None}, methods=["GET", "OPTIONS"])
    @app.route("/books/search/<search_param>/<category>/<status>/<author>", methods=["GET", "OPTIONS"])
    def search_books(search_param, category, status, author):
        if request.method == "OPTIONS":
            response = make_response(jsonify({}), 200)
            return add_cors_headers(response)
        
        try:
            session = SessionLocal()

            
            query = session.query(Book).options(joinedload(Book.author))
            if search_param:
                sp = search_param.strip()
                if sp.lower() == "all":
                    pass
                elif sp.isdigit():
                    query = query.filter(Book.id == int(sp))
                else:
                    query = query.filter(Book.title.ilike(f"%{sp}%"))

           
            if category:
                query = query.filter(Book.category.ilike(f"%{category}%"))
            if status:
                query = query.filter(Book.status.ilike(f"%{status}%"))
            if author:
                query = query.join(Author).filter(Author.name.ilike(f"%{author}%"))

            books = query.all()

            if not books:
                session.close()
                response = make_response(jsonify({"message": "No books found"}), 404)
                return add_cors_headers(response)

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
            response = make_response(jsonify(result), 200)
            return add_cors_headers(response)
        except Exception as e:
            print(f"Error in search_books: {str(e)}")
            response = make_response(jsonify({"error": str(e)}), 500)
            return add_cors_headers(response)
    

    # Preflight requests for CORS - must come BEFORE @token_required routes
    @app.route("/books", methods=["OPTIONS"])
    def books_preflight():
        response = make_response("", 204)
        return add_cors_headers(response)

    @app.route("/books/<int:book_id>", methods=["OPTIONS"])
    def books_id_preflight(book_id):
        response = make_response("", 204)
        return add_cors_headers(response)

    @app.route("/books", methods=["POST"])
    @token_required
    def add_book():
        data = request.get_json() or {}
        session = SessionLocal()

        title = data.get("title")
        category = data.get("category")
        isbn = data.get("isbn")
        status = data.get("status", "available")
        description = data.get("description", "")
        author_name = data.get("author_name")

        if not title or not category or not author_name:
            session.close()
            response = make_response(jsonify({"error": "title, category, and author_name are required"}), 400)
            return add_cors_headers(response)

        # Find or create author
        author = session.query(Author).filter(Author.name == author_name).first()
        if not author:
            author = Author(name=author_name, bio="")
            session.add(author)
            session.flush()  # Flush to get the author ID

        new_book = Book(
            title=title,
            category=category,
            author_id=author.id,
            isbn=isbn,
            status=status,
            description=description
        )
        session.add(new_book)
        session.commit()
        session.close()
        response = make_response(jsonify({"message": "Book added successfully!"}), 201)
        return add_cors_headers(response)
    

    @app.route("/books/<int:book_id>", methods=["PUT"])
    @token_required
    def update_book(book_id):
        data = request.get_json()
        session = SessionLocal()
        
        book = session.query(Book).get(book_id)
        if not book:
            session.close()
            response = make_response(jsonify({"error": "Book not found"}), 404)
            return add_cors_headers(response)
        
        # Update book fields if provided
        if "title" in data:
            book.title = data["title"]
        if "category" in data:
            book.category = data["category"]
        if "isbn" in data:
            book.isbn = data["isbn"]
        if "status" in data:
            book.status = data["status"]
        if "description" in data:
            book.description = data.get("description", "")
        
        # Handle author update
        if "author_name" in data:
            author_name = data["author_name"]
            # Find existing author or create new one
            author = session.query(Author).filter(Author.name == author_name).first()
            if not author:
                author = Author(name=author_name, bio="")
                session.add(author)
                session.flush()  # Flush to get the author ID
            book.author_id = author.id
        
        session.commit()
        session.close()
        response = make_response(jsonify({"message": "Book updated successfully!"}), 200)
        return add_cors_headers(response)

    @app.route("/books/<int:book_id>", methods=["DELETE"])
    @token_required
    def delete_book(book_id):
        session = SessionLocal()
    
    
        book = session.query(Book).get(book_id)
        if not book:
           session.close()
           response = make_response(jsonify({"message": "Book not found"}), 404)
           return add_cors_headers(response)

        session.delete(book)
        session.commit()
        session.close()
        response = make_response(jsonify({"message": f"Book with id {book_id} deleted successfully!"}), 200)
        return add_cors_headers(response)
    
    @app.route("/authors", methods=["GET", "OPTIONS"])
    def get_authors():
        if request.method == "OPTIONS":
            response = make_response(jsonify({}), 200)
            return add_cors_headers(response)
        
        session = SessionLocal()
        authors = session.query(Author).all()
        result = [
            {"id": a.id, "name": a.name, "bio": a.bio}
            for a in authors
        ]
        session.close()
        response = make_response(jsonify(result), 200)
        return add_cors_headers(response)
    
    # Preflight for authors
    @app.route("/authors", methods=["OPTIONS"])
    def authors_preflight():
        response = make_response("", 204)
        return add_cors_headers(response)

    @app.route("/authors/<int:author_id>", methods=["OPTIONS"])
    def author_id_preflight(author_id):
        response = make_response("", 204)
        return add_cors_headers(response)

    @app.route("/authors", methods=["POST"])
    @token_required
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
        response = make_response(jsonify({"message": "Author added successfully!"}), 201)
        return add_cors_headers(response)
    
    @app.route("/authors/<int:author_id>", methods=["PUT"])
    @token_required
    def update_author(author_id):
        data = request.get_json()
        session = SessionLocal()
        author = session.query(Author).get(author_id)
        if not author:
            session.close()
            response = make_response(jsonify({"message": "Author not found"}), 404)
            return add_cors_headers(response)
        
        author.name = data.get("name", author.name)
        author.bio = data.get("bio", author.bio)
        session.commit()
        session.close()
        response = make_response(jsonify({"message": "Author updated successfully!"}), 200)
        return add_cors_headers(response)
    
    @app.route("/authors/<int:author_id>", methods=["DELETE"])
    @token_required
    def delete_author(author_id):
        session = SessionLocal()
        author = session.query(Author).get(author_id)
        if not author:
           session.close()
           response = make_response(jsonify({"message": "Author not found"}), 404)
           return add_cors_headers(response)

        session.delete(author)
        session.commit()
        session.close()
        response = make_response(jsonify({"message": f"Author with id {author_id} deleted successfully!"}), 200)
        return add_cors_headers(response)
    

    @app.route("/users", defaults={"user_id": None, "role": None}, methods=["GET", "OPTIONS"])
    @app.route("/users/<int:user_id>", defaults={"role": None}, methods=["GET", "OPTIONS"])
    @app.route("/users/role/<role>", defaults={"user_id": None}, methods=["GET", "OPTIONS"])
    def search_users(user_id, role):
        if request.method == "OPTIONS":
            response = make_response(jsonify({}), 200)
            return add_cors_headers(response)
        
        session = SessionLocal()

        query = session.query(User).options(joinedload(User.issued_books))

        
        if user_id is not None:
            query = query.filter(User.id == user_id)

        
        role_param = role or request.args.get("role")
        if role_param:
            if role_param.lower() not in ("user", "admin"):
                session.close()
                response = make_response(jsonify({"error": "Invalid role. Must be 'user' or 'admin'"}), 400)
                return add_cors_headers(response)
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
            response = make_response(jsonify({"message": "No users found"}), 404)
            return add_cors_headers(response)

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
        response = make_response(jsonify(result), 200)
        return add_cors_headers(response)



    # Preflight for users
    @app.route("/users/<int:user_id>", methods=["OPTIONS"])
    def users_preflight(user_id):
        response = make_response("", 204)
        return add_cors_headers(response)

    @app.route("/users", methods=["OPTIONS"])
    def users_list_preflight():
        response = make_response("", 204)
        return add_cors_headers(response)

    @app.route("/users/<int:user_id>", methods=["DELETE"])
    @token_required
    def delete_user(user_id):
        session = SessionLocal()

        user = session.get(User, user_id)
        if not user:
            session.close()
            response = make_response(jsonify({"message": "User not found"}), 404)
            return add_cors_headers(response)

        session.delete(user)
        session.commit()
        session.close()

        response = make_response(jsonify({"message": f"User with id {user_id} deleted successfully!"}), 200)
        return add_cors_headers(response)
    


    @app.route("/users", methods=["POST"])
    @token_required
    def add_user():
        data = request.get_json()
        session = SessionLocal()
        name = data.get("name")
        email = data.get("email")
        password = data.get("password")
        role = data.get("role", "user").lower()

        if not name or not email or not password:
            session.close()
            response = make_response(jsonify({"error": "Name, email and password are required"}), 400)
            return add_cors_headers(response)
        if role not in ("user", "admin"):
            session.close()
            response = make_response(jsonify({"error": "Invalid role. Must be 'user' or 'admin'"}), 400)
            return add_cors_headers(response)

        pw_hash = hash_password(password)
        new_user = User(name=name, email=email, password=pw_hash, role=role)

        session.add(new_user)
        try:
            session.commit()
        except IntegrityError:
            session.rollback()
            session.close()
            response = make_response(jsonify({"error": "Email already exists"}), 400)
            return add_cors_headers(response)

        session.close()
        response = make_response(jsonify({"message": "User added successfully!"}), 201)
        return add_cors_headers(response)


    @app.route("/issued_books", methods=["GET", "OPTIONS"])
    @token_required
    def list_issued_books():
        if request.method == "OPTIONS":
            response = make_response(jsonify({}), 200)
            return add_cors_headers(response)
        
        session = SessionLocal()
        query = session.query(IssuedBook).options(joinedload(IssuedBook.book), joinedload(IssuedBook.user))

        user_id = request.args.get("user_id")
        book_id = request.args.get("book_id")
        status = request.args.get("status")

        if user_id and user_id.isdigit():
            query = query.filter(IssuedBook.user_id == int(user_id))
        if book_id and book_id.isdigit():
            query = query.filter(IssuedBook.book_id == int(book_id))
        if status:
            query = query.filter(IssuedBook.status.ilike(f"%{status}%"))

        issued = query.all()
        if not issued:
            session.close()
            response = make_response(jsonify({"message": "No issued books found"}), 404)
            return add_cors_headers(response)

        result = [
            {
                "id": i.id,
                "book_id": i.book_id,
                "book_title": i.book.title if i.book else None,
                "user_id": i.user_id,
                "user_name": i.user.name if i.user else None,
                "status": i.status
            }
            for i in issued
        ]
        session.close()
        response = make_response(jsonify(result), 200)
        return add_cors_headers(response)


    @app.route("/issued_books/<int:issue_id>", methods=["GET"])
    @token_required
    def get_issued_book(issue_id):
        session = SessionLocal()
        issued = session.query(IssuedBook).options(joinedload(IssuedBook.book), joinedload(IssuedBook.user)).get(issue_id)
        if not issued:
            session.close()
            return jsonify({"message": "Issued record not found"}), 404

        result = {
            "id": issued.id,
            "book_id": issued.book_id,
            "book_title": issued.book.title if issued.book else None,
            "user_id": issued.user_id,
            "user_name": issued.user.name if issued.user else None,
            "status": issued.status
        }
        session.close()
        return jsonify(result)


    @app.route("/issued_books", methods=["POST"])
    @token_required
    def create_issued_book():
        data = request.get_json()
        session = SessionLocal()
        book_id = data.get("book_id")
        user_id = data.get("user_id")

        if not book_id or not user_id:
            session.close()
            return jsonify({"error": "book_id and user_id are required"}), 400

        book = session.get(Book, book_id)
        user = session.get(User, user_id)
        if not book:
            session.close()
            return jsonify({"error": "Book not found"}), 404
        if not user:
            session.close()
            return jsonify({"error": "User not found"}), 404
        if book.status != "available":
            session.close()
            return jsonify({"error": "Book not available"}), 400

        issued = IssuedBook(book_id=book_id, user_id=user_id, status="issued")
        book.status = "issued"
        session.add(issued)
        session.commit()

        result = {"message": "Book issued successfully", "issued_id": issued.id}
        session.close()
        return jsonify(result), 201


    @app.route("/issued_books/<int:issue_id>", methods=["DELETE"])
    @token_required
    def delete_issued_book(issue_id):
        session = SessionLocal()
        issued = session.query(IssuedBook).get(issue_id)
        if not issued:
            session.close()
            return jsonify({"message": "Issued record not found"}), 404

        session.delete(issued)
        session.commit()
        session.close()
        return jsonify({"message": f"Issued record {issue_id} deleted"})
    

    