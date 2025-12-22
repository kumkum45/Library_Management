# API Usage Guide - Token Management & Authentication

## 📋 Overview
Your Library Management System uses JWT (JSON Web Token) based authentication. After login, the token is stored in `localStorage` and used for all subsequent API calls.

---

## 🔐 How It Works

### 1. **Login Flow**
```javascript
// User logs in via login.html
// Backend returns token and user data

const response = await fetch('https://library-management-lawg.onrender.com/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});

const data = await response.json();

// Token is stored in localStorage
localStorage.setItem('authToken', data.token);
localStorage.setItem('user', JSON.stringify(data.user));
```

### 2. **Token Storage**
```javascript
// Token is stored as plain text in localStorage
localStorage.getItem('authToken');  // Returns: "eyJhbGc..."

// User info is stored as JSON
JSON.parse(localStorage.getItem('user'));
// Returns: { id: 1, name: "John", email: "john@example.com", role: "user" }
```

### 3. **Using Token for API Calls**
```javascript
// Use the built-in fetchWithToken() helper in dashboard.js
const response = await fetchWithToken('https://library-management-lawg.onrender.com/books/search', {
  method: 'GET'
});

const books = await response.json();
console.log(books);
```

---

## 🛠️ Helper Function: fetchWithToken()

Location: `frontend_new/dashboard.js` (Lines 4-45)

### What it does:
✅ Automatically adds `Authorization: Bearer <token>` header  
✅ Handles 401 Unauthorized responses (token expired)  
✅ Redirects to login if token is missing or invalid  
✅ Maintains consistent error handling  

### Usage Examples:

#### GET Request (Fetch Books)
```javascript
const response = await fetchWithToken(`${API_BASE_URL}/books/search`);
if (response) {
  const books = await response.json();
  console.log(books);
}
```

#### POST Request (Add Book)
```javascript
const response = await fetchWithToken(`${API_BASE_URL}/books`, {
  method: 'POST',
  body: JSON.stringify({
    title: 'The Great Gatsby',
    author_id: 5,
    category: 'Fiction',
    isbn: '978-0-7432-7356-5'
  })
});
```

#### DELETE Request (Remove Book)
```javascript
const response = await fetchWithToken(`${API_BASE_URL}/books/123`, {
  method: 'DELETE'
});
```

#### PUT Request (Update Book)
```javascript
const response = await fetchWithToken(`${API_BASE_URL}/books/123`, {
  method: 'PUT',
  body: JSON.stringify({
    title: 'Updated Title',
    category: 'Fiction'
  })
});
```

---

## 🔌 Available API Endpoints

### Authentication Routes
| Endpoint | Method | Headers | Description |
|----------|--------|---------|-------------|
| `/signup` | POST | Content-Type | Register new user |
| `/login` | POST | Content-Type | Get JWT token |

### Protected Routes (Require Token)
| Endpoint | Method | Headers | Description |
|----------|--------|---------|-------------|
| `/books/search` | GET | Authorization | List all books |
| `/books` | POST | Authorization | Add new book |
| `/books/{id}` | DELETE | Authorization | Delete book |
| `/authors` | GET | Authorization | List authors |
| `/authors` | POST | Authorization | Add author |
| `/users` | GET | Authorization | List users |
| `/users` | POST | Authorization | Add user |
| `/issued_books` | GET | Authorization | List issued books |

---

## 📝 Complete Example: Fetch and Display Books

```javascript
// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Check if token exists
    const token = localStorage.getItem('authToken');
    if (!token) {
      window.location.href = 'login.html';
      return;
    }

    // Fetch books with authentication
    const response = await fetchWithToken(`${API_BASE_URL}/books/search`);
    if (!response) return;

    const books = await response.json();

    // Display books
    books.forEach(book => {
      console.log(`${book.title} by ${book.author_name}`);
    });

  } catch (error) {
    console.error('Error fetching books:', error);
  }
});
```

---

## 🔄 Token Lifecycle

```
Login
  ↓
Token Generated (24-hour expiry)
  ↓
Stored in localStorage
  ↓
Sent with each API request in Authorization header
  ↓
Backend verifies token
  ↓
If valid → Allow access
If invalid/expired → Return 401 → Redirect to login
```

---

## ⚠️ Important Notes

### Token Expiry
- **Duration**: 24 hours from login
- **On Expiry**: Browser redirected to login.html
- **Clear Token**: Run `localStorage.removeItem('authToken')`

### Security
- Tokens stored in localStorage are accessible via JavaScript
- Never store sensitive data beyond the token
- Use HTTPS in production
- Implement CSRF protection for forms

### Logout
```javascript
function logout() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
  window.location.href = 'login.html';
}
```

---

## 🐛 Debugging

### Check Token Status
```javascript
// In browser console
localStorage.getItem('authToken');
JSON.parse(localStorage.getItem('user'));
```

### Decode Token (Without Verification)
```javascript
const token = localStorage.getItem('authToken');
const payload = JSON.parse(atob(token.split('.')[1]));
console.log(payload);  // Shows: user_id, email, iat, exp
```

### Check Token Expiration
```javascript
const token = localStorage.getItem('authToken');
const payload = JSON.parse(atob(token.split('.')[1]));
const expiryDate = new Date(payload.exp * 1000);
console.log(`Token expires at: ${expiryDate}`);
```

---

## ✅ Checklist for Using Authenticated APIs

- [ ] User logged in successfully (token in localStorage)
- [ ] Using `fetchWithToken()` helper for all protected routes
- [ ] Adding `Authorization: Bearer {token}` header
- [ ] Handling 401 responses (redirect to login)
- [ ] Clearing token on logout
- [ ] Testing with real backend API calls

---

## 📚 Quick Reference

```javascript
// Get token
const token = localStorage.getItem('authToken');

// Get user info
const user = JSON.parse(localStorage.getItem('user'));

// Make authenticated request
const response = await fetchWithToken(url, options);

// Handle errors
if (!response || response.status === 401) {
  // Redirect to login
}

// Logout
localStorage.removeItem('authToken');
localStorage.removeItem('user');
```

