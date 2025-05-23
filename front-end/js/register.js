document.querySelector('form').addEventListener('submit', async function (e) {
      e.preventDefault();

      const firstName = document.querySelector('#firstName').value;
      const lastName = document.querySelector('#lastName').value;
      const email = document.querySelector('#email').value;
      const password = document.querySelector('#password').value;

      const response = await fetch(`${API_BASE}/httptriggerregisteruser`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, email, password })
      });

      if (response.ok) {
        alert('Registration successful! Redirecting to login...');
        window.location.href = './index.html';
      } else {
        const error = await response.text();
        alert('Registration failed: ' + error);
      }
    });