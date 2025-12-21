# 🚀 How to Run the Library Management Dashboard

## Quick Start (2 Terminal Windows)

### Terminal 1: Start Backend API
```bash
cd Library_Management/backend
python app.py
```
✅ Backend will be running at: `http://127.0.0.1:5000`

### Terminal 2: Start Frontend Server
```bash
cd Library_Management/frontend_new
python serve.py
```
✅ Frontend will be running at: `http://localhost:8000`

### Open Dashboard
1. Open your browser
2. Go to: `http://localhost:8000/dashboard.html`
3. Login with your credentials
4. Dashboard loads with all books

---

## ❌ Common Issues & Fixes

### "Failed to fetch" Error
**Problem**: Frontend can't reach backend
**Cause**: Frontend served from `file://` URL instead of `http://`
**Solution**: Use the `serve.py` script to serve frontend over HTTP

### "Connection refused" Error
**Problem**: Backend not running
**Cause**: Flask server not started
**Solution**: Run `python app.py` in the backend folder

### "No books showing"
**Problem**: Database is empty
**Solution**: 
1. Backend must be running
2. Ensure database has books
3. Check browser console for errors

### Port 8000 Already in Use
**Problem**: Another process using port 8000
**Solution**: Kill the process or modify port in `serve.py`

---

## 📋 Verify Everything is Working

### Backend Check
```bash
curl http://127.0.0.1:5000/
# Should return: {"message": "Flask app running successfully!"}
```

### Frontend Check
1. Open `http://localhost:8000/dashboard.html`
2. Should see login form
3. Login and verify books load

### Add Book Test
1. Click "➕ Add Book"
2. Fill in: Title, Author, Category, Status
3. Click "Add Book"
4. Book should appear instantly

### Delete Book Test
1. Click "🗑️" on any book
2. Click "Delete" to confirm
3. Book should disappear instantly

---

## 🎯 Expected Behavior

✅ Add Book: Modal closes → Success message → Book appears
✅ Delete Book: Confirmation modal → Success message → Book removed
✅ Search: Type in search boxes → Results filter instantly
✅ Filter: Select filters → Results update in real-time
✅ Issue: Click Issue button → Status changes → Disappears from Available view

---

## 🔧 Alternative: Using Python's Built-in Server

If `serve.py` doesn't work, you can use:
```bash
cd Library_Management/frontend_new
python -m http.server 8000
```

Then visit: `http://localhost:8000/dashboard.html`

---

## 📚 Required Components

- ✅ Backend: Python Flask app running
- ✅ Database: PostgreSQL or SQLite
- ✅ Frontend: Served over HTTP (not file://)
- ✅ Browser: Modern browser (Chrome, Firefox, Safari, Edge)

---

## 🎉 You're Ready!

Once both servers are running:
1. Frontend ✅ at `http://localhost:8000`
2. Backend ✅ at `http://127.0.0.1:5000`

The dashboard is fully functional with:
- ✅ Real-time search & filtering
- ✅ Add/Delete/Edit books
- ✅ Mark as issued
- ✅ Professional UI
- ✅ Zero page reloads
