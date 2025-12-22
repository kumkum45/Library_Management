# Render Environment Setup Guide

## ⚠️ Current Issue
Render cannot connect to Supabase database due to network configuration.

## ✅ Solution

### Step 1: Get Your Supabase Connection String

1. Go to [Supabase Dashboard](https://supabase.com)
2. Click your project
3. Click **Settings** → **Database**
4. Look for **"Connection string"** section
5. Select **"URI"** tab
6. Copy the full connection string (it looks like):
```
postgresql://postgres:[password]@[host].supabase.co:5432/postgres
```

### Step 2: Add to Render Environment Variables

1. Go to [Render Dashboard](https://render.com)
2. Click your **Backend Service** (library-management-lawg)
3. Go to **Settings** tab
4. Scroll to **Environment**
5. Click **Add Environment Variable**

Add these TWO variables:

| Variable Name | Value |
|---|---|
| `DATABASE_URL` | `postgresql://postgres:[YOUR_PASSWORD]@[YOUR_HOST].supabase.co:5432/postgres` |
| `SECRET_KEY` | `your-secret-key-here` (can be any random string) |

**Example:**
```
DATABASE_URL=postgresql://postgres:supabase!01@db.dzikcpihkcdsblffgldy.supabase.co:5432/postgres
SECRET_KEY=my-super-secret-key-12345
```

### Step 3: Redeploy

After adding environment variables:
1. Go to **Deployments** tab
2. Click the three dots on latest deployment
3. Click **Redeploy**
4. Wait 2-3 minutes for deployment to complete

### Step 4: Verify Connection

1. Check Render logs - should see:
   - `Connecting to database: db.dzikcpihkcdsblffgldy.supabase.co`
   - `✓ Database tables created/verified successfully!` (or warning if already exists)

2. Test health endpoint:
   - Go to: `https://library-management-lawg.onrender.com/health`
   - Should return: `{"status": "running", "database_status": "connected"}`

---

## 🔍 Supabase Connection String Troubleshooting

**Your current URL in code:**
```
postgresql://postgres:supabase!01@db.dzikcpihkcdsblffgldy.supabase.co:5432/postgres
```

**This URL might have special characters** that need URL encoding:
- `!` → `%21`
- `@` → `%40` (but only the one in password, not the host separator)

**Better approach:** Use environment variable instead of hardcoding!

---

## 📋 Required Environment Variables Checklist

- [ ] `DATABASE_URL` is set in Render
- [ ] `SECRET_KEY` is set in Render
- [ ] Database URL uses correct password
- [ ] Database URL includes host and port (5432)
- [ ] Service has been redeployed after adding variables

---

## 🚀 Code Changes Made

1. **database.py** - Now reads `DATABASE_URL` from environment
2. **app.py** - Won't fail if database unreachable on startup
3. **Added health check** - `GET /health` endpoint

This allows the app to start even with temporary database issues!

---

## ❓ Still Getting "Network is unreachable"?

This means Render cannot reach Supabase. Check:

1. **Database is running** - Check Supabase dashboard
2. **Correct credentials** - Double-check password in connection string
3. **Firewall rules** - Supabase may have IP restrictions
4. **Network configuration** - Some hosting providers have networking limits

**Contact Supabase support** if you see persistent connection errors.

---

## 📞 Next Steps

1. Add `DATABASE_URL` and `SECRET_KEY` to Render
2. Redeploy the service
3. Check logs for connection messages
4. Test the `/health` endpoint
5. Try signup again

Let me know when you've added the environment variables!
