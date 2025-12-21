from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, CheckConstraint
from sqlalchemy.orm import relationship,sessionmaker, declarative_base
from database import engine
from database import Base
Session=sessionmaker(bind=engine)
session=Session()

Base=declarative_base()


class Book(Base):
    __tablename__ = "books"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(150), nullable=False)
    category = Column(String(100), nullable=False)
    author_id = Column(
        Integer,
        ForeignKey("authors.id", ondelete="CASCADE"),
        nullable=False
    )

    isbn = Column(String(50), unique=True)

    status = Column(
        String(20),
        default="available",
        nullable=False
    )
    
    description = Column(String(500), default="", nullable=True)
    
    author = relationship("Author", back_populates="books")


class Author(Base):
    __tablename__ = "authors"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    bio = Column(String, nullable=True)
    books = relationship(
        "Book",
        back_populates="author",
        cascade="all, delete"
    )

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String(100), nullable=False)

    email = Column(String(100), unique=True, nullable=False)

    # store hashed password
    password = Column(String(255), nullable=False)

    role = Column(
        String(20),
        nullable=False,
        default="user"
    )

    issued_books = relationship(
        "IssuedBook",
        back_populates="user",
        cascade="all, delete"
    )

    __table_args__ = (
        CheckConstraint(
            "role IN ('admin', 'user')",
            name="check_user_role"
        ),
    )


class IssuedBook(Base):
    __tablename__ = "issued_books"

    id = Column(Integer, primary_key=True, index=True)

    book_id = Column(
        Integer,
        ForeignKey("books.id", ondelete="CASCADE"),
        nullable=False
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False
    )

    status = Column(
        String(20),
        default="issued",
        nullable=False
    )

    book = relationship("Book")
    user = relationship("User", back_populates="issued_books")

    __table_args__ = (
        CheckConstraint(
            "status IN ('issued', 'returned')",
            name="check_issue_status"
        ),
    )
