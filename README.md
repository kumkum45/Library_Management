# Library MAnagement System
A full-stack library management application

## Features
 1.User Authentication**: Secure user signup and login with JWT token-based authentication
 2.User Authentication**: Secure user signup and login with JWT token-based authentication
 3. User Roles**: Admin and regular user roles with different permissions
 4.Book Management**: Add, update, and manage book inventory with author associations
 5.Author Management**: Maintain author information with book relationships
 6.Book Issuance**: Issue and track books to users with status management
 7.Responsive Design**: Clean, user-friendly frontend interface
 8.Database Persistence**: PostgreSQL database with SQLAlchemy ORM
 9.CORS Support**: Enabled for cross-origin requests from frontend

 ## Tech Stack
 # Backend
 Framework: Flask
- **ORM**: SQLAlchemy
- **Database**: PostgreSQL
- **Authentication**: PyJWT
- **Server**: Gunicorn
- **CORS**: Flask-CORS
- **Environment**: python-dotenv

### Frontend
- **HTML5** - Structure
- **CSS3** - Styling
- **Vanilla JavaScript** - Interactivity
- **Python SimpleHTTPServer** - Development server

## Installation
pip install flask
pip install sqlalchemy
pip install psycopg

## Create Virtual Environment
python -m venv venv
.\venv\source\Activate

## Install dependencies
pip install -r requirements.txt

## Create a .env file for following
SECRET_KEY : secret-key
DATABASE_URL
FLASK_ENV=development

Run Backend Server:
python app.py

##Frontend Setup
cd frontend_new
python serve.py


## Database Models:
#User
id(Integer,Primary)
name(String)
email(String)
password(String,Hashed)
role(String:admin,user)
issued_books(Relationship to issuedBook)

#Book
id (Integer, Primary Key)
title (String)
category (String)
author_id (Foreign Key to Author)
isbn (String, Unique)
status (String - 'available' or 'issued')

#Author
id (Integer, Primary Key)
name (String)
bio (String, Optional)
books (Relationship to Book)

#IssuedBook
id (Integer, Primary Key)
user_id (Foreign Key to User)
book_id (Foreign Key to Book)
issue_date (DateTime)
return_date (DateTime, Optional)

##API Endpoints
# Authentication
POST /register - User registration
POST /login - User login

# Books
GET /books - Get all books
POST /books - Create new book
PUT /books/{id} - Update book
DELETE /books/{id} - Delete book

# Authors
GET /authors - Get all authors
POST /authors - Create new author
PUT /authors/{id} - Update author
DELETE /authors/{id} - Delete author

##Deployment:  Backend Deployed at Render
For Database Supabase is Used
For Frontend Deployment Vercel is used

Frontend Deployed Link : library-management-o0now5jgv-kumkumsolanki65-3092s-projects.vercel.app


 
