document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('signupForm');
  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const roleInput = document.getElementById('role');
  const successMessage = document.getElementById('successMessage');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    clearErrors();

    if (validateForm()) {
      sendSignupData();
    }
  });

  nameInput.addEventListener('blur', () => validateName());
  emailInput.addEventListener('blur', () => validateEmail());
  passwordInput.addEventListener('blur', () => validatePassword());
  roleInput.addEventListener('blur', () => validateRole());

  function validateForm() {
    let isValid = true;

    if (!validateName()) isValid = false;
    if (!validateEmail()) isValid = false;
    if (!validatePassword()) isValid = false;
    if (!validateRole()) isValid = false;

    return isValid;
  }

  function validateName() {
    const nameError = document.getElementById('nameError');
    const nameGroup = nameInput.parentElement;
    const name = nameInput.value.trim();

    if (name.length === 0) {
      showError(nameError, 'Name is required', nameGroup);
      return false;
    }

    if (name.length < 2) {
      showError(nameError, 'Name must be at least 2 characters', nameGroup);
      return false;
    }

    clearError(nameError, nameGroup);
    return true;
  }

  function validateEmail() {
    const emailError = document.getElementById('emailError');
    const emailGroup = emailInput.parentElement;
    const email = emailInput.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (email.length === 0) {
      showError(emailError, 'Email is required', emailGroup);
      return false;
    }

    if (!emailRegex.test(email)) {
      showError(emailError, 'Please enter a valid email address', emailGroup);
      return false;
    }

    clearError(emailError, emailGroup);
    return true;
  }

  function validatePassword() {
    const passwordError = document.getElementById('passwordError');
    const passwordGroup = passwordInput.parentElement;
    const password = passwordInput.value;

    if (password.length === 0) {
      showError(passwordError, 'Password is required', passwordGroup);
      return false;
    }

    if (password.length < 6) {
      showError(passwordError, 'Password must be at least 6 characters', passwordGroup);
      return false;
    }

    clearError(passwordError, passwordGroup);
    return true;
  }

  function validateRole() {
    const roleError = document.getElementById('roleError');
    const roleGroup = roleInput.parentElement;
    const role = roleInput.value;

    if (role.length === 0) {
      showError(roleError, 'Please select a role', roleGroup);
      return false;
    }

    clearError(roleError, roleGroup);
    return true;
  }

  function showError(element, message, groupElement) {
    element.textContent = message;
    element.classList.add('show');
    groupElement.classList.add('error');
  }

  function clearError(element, groupElement) {
    element.textContent = '';
    element.classList.remove('show');
    groupElement.classList.remove('error');
  }

  function clearErrors() {
    document.querySelectorAll('.error-message').forEach(msg => {
      msg.textContent = '';
      msg.classList.remove('show');
    });
    document.querySelectorAll('.form-group').forEach(group => {
      group.classList.remove('error');
    });
  }

  function showSuccess() {
    form.style.display = 'none';
    successMessage.classList.add('show');
  }

  function sendSignupData() {
    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const role = roleInput.value;

    const signupData = {
      name: name,
      email: email,
      password: password,
      role: role
    };

    const apiUrl = window.location.protocol === 'file:' 
      ? 'http://127.0.0.1:5000/signup'
      : `${window.location.protocol}//${window.location.hostname}:5000/signup`;

    console.log('Sending signup to:', apiUrl);
    console.log('Data:', signupData);

    fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(signupData)
    })
    .then(response => {
      console.log('Response status:', response.status);
      if (!response.ok) {
        return response.json().then(data => {
          throw new Error(data.error || `HTTP ${response.status}: Signup failed`);
        });
      }
      return response.json();
    })
    .then(data => {
      console.log('Signup successful:', data);
      showSuccess();
      form.reset();
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 2000);
    })
    .catch(error => {
      console.error('Signup error:', error);
      const emailError = document.getElementById('emailError');
      emailError.textContent = error.message || 'Failed to connect to server';
      emailError.classList.add('show');
      emailInput.parentElement.classList.add('error');
    });
  }
});
