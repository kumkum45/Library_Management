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
      showSuccess();
      form.reset();
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 2000);
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
});
