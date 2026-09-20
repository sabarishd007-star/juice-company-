/**
 * Modern Authentication Screen Controller
 * Handles visual state interactions, validation hooks, and password visibility without
 * modifying underlying form submitting/action behavior.
 */
document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const submitBtn = document.getElementById('btn-submit');
  const togglePasswordBtn = document.getElementById('toggle-password');
  const globalErrorAlert = document.getElementById('global-error');

  // 1. Password Visibility Toggle
  if (togglePasswordBtn && passwordInput) {
    const eyeShow = togglePasswordBtn.querySelector('.eye-show');
    const eyeHide = togglePasswordBtn.querySelector('.eye-hide');

    togglePasswordBtn.addEventListener('click', () => {
      const isPassword = passwordInput.getAttribute('type') === 'password';
      passwordInput.setAttribute('type', isPassword ? 'text' : 'password');
      
      togglePasswordBtn.setAttribute('aria-label', isPassword ? 'Hide password' : 'Show password');
      togglePasswordBtn.setAttribute('title', isPassword ? 'Hide password' : 'Show password');
      
      if (eyeShow && eyeHide) {
        eyeShow.hidden = isPassword;
        eyeHide.hidden = !isPassword;
      }
    });
  }

  // 2. Real-time Field Validation & Cleanups
  const validateEmail = (email) => {
    return String(email)
      .toLowerCase()
      .match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  };

  const setFieldError = (inputEl, errorElId, message) => {
    const formGroup = inputEl.closest('.form-group');
    const errorEl = document.getElementById(errorElId);
    
    if (formGroup) formGroup.classList.add('has-error');
    if (errorEl) errorEl.textContent = message;
  };

  const clearFieldError = (inputEl, errorElId) => {
    const formGroup = inputEl.closest('.form-group');
    const errorEl = document.getElementById(errorElId);
    
    if (formGroup) formGroup.classList.remove('has-error');
    if (errorEl) errorEl.textContent = '';
  };

  // Clear errors on user input
  emailInput?.addEventListener('input', () => clearFieldError(emailInput, 'email-error'));
  passwordInput?.addEventListener('input', () => clearFieldError(passwordInput, 'password-error'));

  // 3. Form Submission Hook — wired to JWT backend
  // API_BASE is provided by config.js (loaded before this script in login.html)

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      let isValid = true;

      // Reset top error alert
      if (globalErrorAlert) globalErrorAlert.hidden = true;

      // Client-side validation
      if (!emailInput.value.trim()) {
        setFieldError(emailInput, 'email-error', 'Email address is required.');
        isValid = false;
      } else if (!validateEmail(emailInput.value.trim())) {
        setFieldError(emailInput, 'email-error', 'Please enter a valid email address.');
        isValid = false;
      }

      if (!passwordInput.value) {
        setFieldError(passwordInput, 'password-error', 'Password is required.');
        isValid = false;
      }

      if (!isValid) return;

      // Transition button to loading state
      if (submitBtn) {
        submitBtn.classList.add('is-loading');
        submitBtn.disabled = true;
      }

      try {
        const res = await fetch(`${API_BASE}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: emailInput.value.trim(),
            password: passwordInput.value
          })
        });

        const data = await res.json();

        if (res.ok && data.success && data.token) {
          // Persist JWT and user info under the shared nexus_auth_token key
          localStorage.setItem('nexus_auth_token', data.token);
          localStorage.setItem('nexus_user', JSON.stringify(data.user));

          // Brief delay so loading animation plays, then navigate
          setTimeout(() => {
            window.location.href = 'dashboard.html';
          }, 500);
        } else {
          throw new Error(data.message || 'Invalid credentials.');
        }

      } catch (err) {
        // Show inline server error
        if (globalErrorAlert) {
          const errorText = document.getElementById('global-error-text');
          if (errorText) errorText.textContent = err.message || 'Sign-in failed. Please try again.';
          globalErrorAlert.hidden = false;
        }
        if (submitBtn) {
          submitBtn.classList.remove('is-loading');
          submitBtn.disabled = false;
        }
      }
    });
  }

  // 4. Dark / Light Theme Toggle Controller
  const themeToggleBtn = document.getElementById('themeToggle');
  const themeLabel = document.getElementById('themeLabel');

  if (themeToggleBtn) {
    const sunIcon = themeToggleBtn.querySelector('.sun-icon');
    const moonIcon = themeToggleBtn.querySelector('.moon-icon');

    const updateToggleUI = (theme) => {
      document.documentElement.setAttribute('data-theme', theme);
      if (themeLabel) themeLabel.textContent = theme === 'dark' ? 'Dark' : 'Light';
      if (sunIcon && moonIcon) {
        sunIcon.style.display = theme === 'dark' ? 'block' : 'none';
        moonIcon.style.display = theme === 'dark' ? 'none' : 'block';
      }
    };

    // Initial state sync from shared nexus_theme key
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    updateToggleUI(currentTheme);

    themeToggleBtn.addEventListener('click', () => {
      const activeTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = activeTheme === 'dark' ? 'light' : 'dark';
      updateToggleUI(newTheme);
      // Persist using the unified nexus_theme key shared with dashboard.html and index.html
      localStorage.setItem('nexus_theme', newTheme);
    });
  }
});
