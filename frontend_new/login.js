// API Base URL (adjust based on your backend)
const API_BASE_URL = 'https://library-management-lawg.onrender.com';

const form = document.getElementById('loginForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const errorMessage = document.getElementById('errorMessage');
const successMessage = document.getElementById('successMessage');

/**
 * Clear error/success messages
 */
function clearMessages() {
  errorMessage.style.display = 'none';
  errorMessage.textContent = '';
  successMessage.style.display = 'none';
  successMessage.textContent = '';
}

/**
 * Show error message
 */
function showError(message) {
  clearMessages();
  errorMessage.textContent = message;
  errorMessage.style.display = 'block';
}

/**
 * Show success message
 */
function showSuccess(message) {
  clearMessages();
  successMessage.textContent = message;
  successMessage.style.display = 'block';
}

/**
 * Validate email format
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Handle form submission
 */
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearMessages();

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  
  if (!email || !password) {
    showError('Please fill in all fields.');
    return;
  }

  if (!isValidEmail(email)) {
    showError('Please enter a valid email address.');
    return;
  }

  if (password.length < 6) {
    showError('Password must be at least 6 characters.');
    return;
  }

 
  const submitBtn = form.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;
  submitBtn.disabled = true;
  submitBtn.textContent = 'Signing in...';

  try {
    // Make actual API call to backend
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    console.log('Login response status:', response.status);
    console.log('Login response ok:', response.ok);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Login error response:', errorData);
      throw new Error(errorData.error || 'Login failed');
    }

    const data = await response.json();
    console.log('Login response data:', data);
    console.log('Token from backend:', data.token);
    console.log('User from backend:', data.user);

    // Store token and user in localStorage
    localStorage.setItem('authToken', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));

    // Verify it was stored
    console.log('Token stored in localStorage:', localStorage.getItem('authToken'));
    console.log('User stored in localStorage:', localStorage.getItem('user'));

    showSuccess('Login successful! Redirecting to dashboard...');
    
    // Redirect to dashboard after 1.5 seconds with cache buster
    setTimeout(() => {
      window.location.href = 'dashboard.html?v=' + new Date().getTime();
    }, 1500);
  } catch (error) {
    console.error('Login error:', error);
    showError(error.message || 'An error occurred. Please check your connection and try again.');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
  }
});


window.addEventListener('load', () => {
 
  const token = localStorage.getItem('authToken');
  
});


window.addEventListener('beforeunload', () => {
  form.reset();
});
