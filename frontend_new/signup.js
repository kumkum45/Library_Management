document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('signupForm');
  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const roleInput = document.getElementById('role');
  const successMessage = document.getElementById('successMessage');

  // Form submission
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    clearAllErrors();
    
    if (validateForm()) {
      submitSignup();
    }
  });

  // Real-time validation on blur
  nameInput.addEventListener('blur', validateName);
  emailInput.addEventListener('blur', validateEmail);
  passwordInput.addEventListener('blur', validatePassword);
  roleInput.addEventListener('blur', validateRole);

  // Validation functions
  function validateName() {
    const name = nameInput.value.trim();
    const nameError = document.getElementById('nameError');
    
    if (!name) {
      showError(nameError, nameInput, 'Full name is required');
      return false;
    }
    if (name.length < 2) {
      showError(nameError, nameInput, 'Name must be at least 2 characters');
      return false;
    }
    clearError(nameError, nameInput);
    return true;
  }

  function validateEmail() {
    const email = emailInput.value.trim();
    const emailError = document.getElementById('emailError');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!email) {
      showError(emailError, emailInput, 'Email is required');
      return false;
    }
    if (!emailRegex.test(email)) {
      showError(emailError, emailInput, 'Please enter a valid email address');
      return false;
    }
    clearError(emailError, emailInput);
    return true;
  }

  function validatePassword() {
    const password = passwordInput.value;
    const passwordError = document.getElementById('passwordError');
    
    if (!password) {
      showError(passwordError, passwordInput, 'Password is required');
      return false;
    }
    if (password.length < 6) {
      showError(passwordError, passwordInput, 'Password must be at least 6 characters');
      return false;
    }
    clearError(passwordError, passwordInput);
    return true;
  }

  function validateRole() {
    const role = roleInput.value;
    const roleError = document.getElementById('roleError');
    
    if (!role) {
      showError(roleError, roleInput, 'Please select a role');
      return false;
    }
    clearError(roleError, roleInput);
    return true;
  }

  function validateForm() {
    return validateName() && validateEmail() && validatePassword() && validateRole();
  }

  function showError(errorElement, inputElement, message) {
    errorElement.textContent = message;
    errorElement.classList.add('show');
    inputElement.classList.add('error');
  }

  function clearError(errorElement, inputElement) {
    errorElement.textContent = '';
    errorElement.classList.remove('show');
    inputElement.classList.remove('error');
  }

  function clearAllErrors() {
    document.querySelectorAll('.error-message').forEach(el => {
      el.textContent = '';
      el.classList.remove('show');
    });
    document.querySelectorAll('input, select').forEach(el => {
      el.classList.remove('error');
    });
  }

  // Submit signup data to backend
  function submitSignup() {
    const signupData = {
      name: nameInput.value.trim(),
      email: emailInput.value.trim(),
      password: passwordInput.value,
      role: roleInput.value
    };

    const backendUrl = 'http://127.0.0.1:5000/signup';

    fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(signupData)
    })
    .then(response => {
      if (!response.ok) {
        return response.json().then(errorData => {
          throw new Error(errorData.error || `Error: ${response.status}`);
        });
      }
      return response.json();
    })
    .then(data => {
      // Show success message
      form.style.display = 'none';
      successMessage.style.display = 'block';
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 2000);
    })
    .catch(error => {
      // Show error message
      const emailError = document.getElementById('emailError');
      emailError.textContent = error.message || 'Failed to create account. Please try again.';
      emailError.classList.add('show');
      emailInput.classList.add('error');
    });
  }
});
