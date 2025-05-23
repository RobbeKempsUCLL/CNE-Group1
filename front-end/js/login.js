document.getElementById('loginForm').addEventListener('submit', async function(e) {
      e.preventDefault();
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;

      try {
        const response = await fetch(
          `${API_BASE}/httptriggerauth`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
          }
        );

        if (!response.ok) {
          const msg = await response.text();
          throw new Error(msg || response.statusText);
        }

        const { token } = await response.json();
        localStorage.setItem('jwt', token);
        window.location.href = 'home.html';
      } catch (err) {
        console.error('Login failed:', err);
        alert('Login failed: ' + err.message);
      }
    });