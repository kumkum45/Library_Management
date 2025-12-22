# Render Backend Setup & Debugging Guide

## ✅ Critical Checklist for Render Deployment

### 1. Environment Variables (REQUIRED)
Go to **Render Dashboard → Your Service → Settings → Environment → Environment Variables**

Add these:
```
SECRET_KEY=your-secret-key-here
```

**Status:** _____ (verify it's set)

---

### 2. Database Connection
Your backend connects to: `postgresql://postgres:supabase!01@db.dzikcpihkcdsblffgldy.supabase.co:5432/postgres`

#### On Supabase, verify:
- [ ] Database is running (check Supabase dashboard)
- [ ] These tables exist:
  - `users` (with id, name, email, password, role columns)
  - `authors` (with id, name, bio columns)
  - `books` (with id, title, category, author_id, isbn, status columns)
  - `issued_books` (with id, book_id, user_id, status columns)

---

### 3. Backend Models Match Database
The Python models in `backend/models.py` define the schema. When the backend starts, it automatically creates/updates tables.

#### Required columns in `users` table:
```sql
id          SERIAL PRIMARY KEY
name        VARCHAR(100) NOT NULL
email       VARCHAR(100) UNIQUE NOT NULL
password    VARCHAR(255) NOT NULL
role        VARCHAR(20) NOT NULL DEFAULT 'user'
```

---

### 4. Testing the Signup Endpoint

**URL:** `https://library-management-1.render.com/signup`

**Send POST request with:**
```json
{
  "name": "Test User",
  "email": "test@example.com",
  "password": "password123",
  "role": "user"
}
```

**Expected Responses:**
- ✅ 201: `{"message": "Signup successful. Please login to get a token"}`
- ❌ 400: `{"error": "Email already exists"}`
- ❌ 500: Check Render logs for detailed error

---

### 5. Viewing Render Logs

1. Go to **Render Dashboard**
2. Click your backend service
3. Click **"Logs"** button at top right
4. Look for error messages starting with "500 Error:" or "Database error:"

**Common errors:**
- `FATAL: remaining connection slots are reserved for non-replication superuser`
  → Too many connections to Supabase
  
- `relation "users" does not exist`
  → Tables not created on Supabase
  
- `SECRET_KEY is not set`
  → Environment variable not configured

---

### 6. Quick Troubleshooting

| Issue | Solution |
|-------|----------|
| 500 Error on signup | Check Render logs first |
| "Email already exists" | Good! Try different email |
| "Name, email and password are required" | Check frontend is sending all fields |
| Connection timeout | Check Supabase database status |
| "relation does not exist" | Create tables on Supabase using provided SQL |

---

## SQL to Create Tables (if not auto-created)

Run this in **Supabase SQL Editor** if tables aren't auto-created:

```sql
-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'user',
    CHECK (role IN ('admin', 'user'))
);

-- Create authors table
CREATE TABLE IF NOT EXISTS authors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    bio TEXT
);

-- Create books table
CREATE TABLE IF NOT EXISTS books (
    id SERIAL PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    category VARCHAR(100) NOT NULL,
    author_id INTEGER NOT NULL REFERENCES authors(id) ON DELETE CASCADE,
    isbn VARCHAR(50) UNIQUE,
    status VARCHAR(20) NOT NULL DEFAULT 'available'
);

-- Create issued_books table
CREATE TABLE IF NOT EXISTS issued_books (
    id SERIAL PRIMARY KEY,
    book_id INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'issued',
    CHECK (status IN ('issued', 'returned'))
);
```

---

## Next Steps

1. **Commit changes:** `git push` to deploy latest code to Render
2. **Check logs:** Watch Render logs for 5-10 minutes after deploy
3. **Test signup:** Try creating account from Vercel frontend
4. **If 500 error:** Paste the exact error from Render logs here

---

## Quick Git Commit

```bash
cd d:\Desktop\Library\Library_Management
git add -A
git commit -m "Fix model Base import and improve error logging"
git push
```

Then **wait 2-3 minutes** for Render to redeploy.
