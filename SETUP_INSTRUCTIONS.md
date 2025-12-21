# ✅ Library Management Dashboard - Setup Guide

## 🎯 IMPORTANT: Both servers MUST be running!

### Terminal 1: Backend Server ✅
```bash
cd D:\Desktop\Library\Library_Management\backend
python app.py
```
Should see: `Running on http://127.0.0.1:5000`

### Terminal 2: Frontend Server ✅  
```bash
cd D:\Desktop\Library\Library_Management\frontend_new
python serve.py
```
Should see: `Frontend server running at http://localhost:8000`

---

## 🚀 How to Use Dashboard

### Step 1: Login First
1. Open browser: `http://localhost:8000/`
2. You'll see the **Login page**
3. Enter credentials and login
4. ⚠️ **This creates your auth token** (stored in localStorage)

### Step 2: View Dashboard
1. After login, you're redirected to dashboard
2. Dashboard loads books from database
3. You'll see all books in the list

### Step 3: Use Features
- ✅ Search & filter books
- ✅ Add new books
- ✅ Delete books
- ✅ Mark as issued

---

## 🔑 Why "Failed to Fetch"?

The error happens when:

1. ❌ **Frontend served from file://** instead of http://
   - Fix: Use `python serve.py` in frontend_new folder

2. ❌ **Backend not running** 
   - Fix: Start `python app.py` in backend folder

3. ❌ **Not logged in** (no auth token)
   - Fix: Login at `http://localhost:8000/`

4. ❌ **Token is invalid/expired**
   - Fix: Clear localStorage and login again

---

## ✅ Correct Setup Checklist

- [ ] Terminal 1: Backend running at `http://127.0.0.1:5000`
- [ ] Terminal 2: Frontend running at `http://localhost:8000`
- [ ] Logged in with valid credentials
- [ ] Auth token in localStorage (check browser DevTools)
- [ ] Books visible in dashboard

---

## 🔍 Diagnose Issues

### Check 1: Is Backend Running?
```bash
curl http://127.0.0.1:5000/
```
Should return JSON response, not error

### Check 2: Is Frontend Served Over HTTP?
Open browser and go to: `http://localhost:8000/dashboard.html`
- ✅ Works = Frontend served correctly
- ❌ Can't reach = Frontend server not running

### Check 3: Are You Logged In?
Open browser DevTools (F12) → Application → LocalStorage
- ✅ Should see `authToken` key with a value
- ❌ If missing = Need to login first

### Check 4: Check Browser Console
Open DevTools (F12) → Console tab
- Look for error messages
- Check for network errors
- Verify API endpoint URL is correct

---

## 🎬 Complete Workflow

```
1. Start Backend (Terminal 1)
   ↓
2. Start Frontend (Terminal 2)  
   ↓
3. Open http://localhost:8000/
   ↓
4. Login with credentials
   ↓
5. See dashboard with books
   ↓
6. Try: Add book, Delete book, Filter books, etc.
   ↓
7. All should work instantly!
```

---

## 🚨 Troubleshooting

### Symptom: "Failed to fetch" error
**Check List:**
1. Is backend running? `python app.py` in backend folder
2. Is frontend running? `python serve.py` in frontend_new folder
3. Are you logged in? Check localStorage has `authToken`
4. Is URL correct? Should be `http://localhost:8000/` (not file://)

### Symptom: "Cannot POST /books"
1. Backend crashed - restart it
2. Token invalid - logout and login again
3. Network issue - check console for CORS errors

### Symptom: No books showing
1. Database empty - add books from dashboard
2. Backend not running - start backend server
3. Wrong view - try switching between "All Books" and "Available Books"

### Symptom: Page doesn't load
1. Frontend server not running - start `python serve.py`
2. Port 8000 in use - kill process or use different port
3. URL wrong - go to `http://localhost:8000/dashboard.html`

---

## 📝 Database Setup (If Needed)

### Create tables:
```bash
cd Library_Management/backend
python migrate.py
```

### Insert sample data:
The backend's login endpoint automatically validates/creates users.

---

## 🎯 Quick Reference

| Component | URL | Command |
|-----------|-----|---------|
| Frontend | `http://localhost:8000` | `python serve.py` |
| Backend API | `http://127.0.0.1:5000` | `python app.py` |
| Dashboard | `http://localhost:8000/dashboard.html` | After login |
| Login | `http://localhost:8000/index.html` | First time |

---

## ✨ Once Running

You should see:
- ✅ Login page loads
- ✅ Successful login redirects to dashboard
- ✅ Books load from database
- ✅ Search/filter works instantly
- ✅ Add book creates new entry
- ✅ Delete book removes from database
- ✅ No page reloads needed

---

## 🆘 Still Having Issues?

1. **Check browser console** (F12 → Console)
   - Look for error messages
   - Check network tab for failed requests

2. **Check backend logs** (Terminal 1)
   - Look for error messages
   - Check response status codes

3. **Verify both servers running**
   - Terminal 1 shows "Running on http://127.0.0.1:5000"
   - Terminal 2 shows "Frontend server running at http://localhost:8000"

4. **Clear browser cache**
   - CTRL+SHIFT+Delete (or CMD+SHIFT+DELETE on Mac)
   - Select "All time"
   - Clear cache and cookies

5. **Check token in LocalStorage**
   - F12 → Application → LocalStorage → http://localhost:8000
   - Should see `authToken` key with long string value

---

**If you've followed all steps above, the dashboard should work perfectly!**

All features (add, delete, search, filter) work instantly with zero page reloads.
