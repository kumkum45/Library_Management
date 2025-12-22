# Debugging 500 Error on /signup Endpoint

## ✅ What I Fixed in Frontend

Updated [frontend_new/signup.js](frontend_new/signup.js):
- ✅ Added `API_BASE_URL` constant (consistent with other files)
- ✅ Added detailed console logging for debugging
- ✅ Improved error message handling
- ✅ Now logs request data and response status

---

## 🔍 How to Debug the 500 Error

### **Step 1: Open Browser DevTools**
1. Go to your Vercel frontend signup page
2. Press `F12` to open DevTools
3. Go to **Console** tab
4. Try signing up again

### **Step 2: Look for Logs**
You should see console logs like:
```
Submitting signup to: https://library-management-lawg.onrender.com/signup
Data: { name: "...", email: "...", password: "...", role: "..." }
Response status: 500
Response ok: false
Backend error: { error: "...", details: "..." }
```

**Copy any error messages** - these tell us what's wrong!

---

## 🔧 Common 500 Errors & Solutions

### **Error: "relation 'users' does not exist"**
**Problem:** Tables not created on Supabase  
**Fix:** Run this SQL in Supabase editor:
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'user'
);
```

### **Error: "secret" variable is not assigned**
**Problem:** SECRET_KEY not set on Render  
**Fix:**
1. Go to Render Dashboard
2. Click your backend service
3. Go to Settings → Environment Variables
4. Add: `SECRET_KEY=your-secret-key-here`

### **Error: Connection refused / timeout**
**Problem:** Can't connect to Supabase database  
**Fix:**
1. Check database.py has correct credentials
2. Verify Supabase database is running
3. Check firewall rules allow Render IP

### **Error: "Email already exists"**
**Status:** ✅ This is GOOD! Database is working!  
**Solution:** Try signing up with a different email address

---

## 📋 Full Debugging Checklist

- [ ] Render logs show "Database tables created/verified successfully!"
- [ ] SECRET_KEY is set in Render environment variables
- [ ] Supabase database is running (check dashboard)
- [ ] Tables exist on Supabase (run SQL if missing)
- [ ] Browser console shows detailed error message
- [ ] Error message reveals the actual problem
- [ ] Backend [app.py](backend/app.py) has error logging enabled

---

## 🚀 Next Steps

1. **Push changes to Render:**
   ```bash
   git add -A
   git commit -m "Improve signup.js logging and error handling"
   git push
   ```

2. **Wait 2-3 minutes** for Render to redeploy

3. **Test signup** and check browser console

4. **If still 500 error:**
   - Paste the console error message here
   - Check Render logs (Dashboard → Logs button)
   - Paste any backend error messages

---

## 🔗 Relevant Files

- **Frontend:** [frontend_new/signup.js](frontend_new/signup.js)
- **Backend Auth:** [backend/auth/token.py](backend/auth/token.py)
- **Backend Models:** [backend/models.py](backend/models.py)
- **Backend App:** [backend/app.py](backend/app.py)
- **Database:** [backend/database.py](backend/database.py)

---

## 📞 Support Info

When reporting the error, provide:
1. **Browser console error message** (F12 → Console)
2. **Render logs output** (Render Dashboard → Logs)
3. **What data you're submitting** (name, email, role, etc.)
4. **Expected vs actual response**

This helps identify the exact problem!
