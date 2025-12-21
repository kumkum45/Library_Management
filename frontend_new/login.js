// API Base URL (adjust based on your backend)
const API_BASE_URL = 'http://127.0.0.1:5000';

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
    // FOR NOW: Direct redirect without backend call
    // Store dummy user data
    localStorage.setItem('authToken', 'dummy-token-for-testing');
    localStorage.setItem('user', JSON.stringify({
      id: 1,
      name: email.split('@')[0],
      email: email,
      role: 'user'
    }));

    showSuccess('Login successful! Redirecting...');
    
    // Redirect to dashboard after 1.5 seconds
    setTimeout(() => {
      window.location.href = 'dashboard.html';
    }, 1500);
  } catch (error) {
    console.error('Login error:', error);
    showError('An error occurred. Please check your connection and try again.');
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
