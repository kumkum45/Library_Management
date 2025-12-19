document.addEventListener('DOMContentLoaded', () => {
  const loginBtn = document.querySelector('[data-action="login"]');
  const signupBtn = document.querySelector('[data-action="signup"]');

  if (loginBtn) {
    loginBtn.addEventListener('click', () => {
      window.location.href = 'login.html';
    });
  }

  if (signupBtn) {
    signupBtn.addEventListener('click', () => {
      window.location.href = 'signup.html';
    });
  }
});
