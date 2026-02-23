// personal-website-finals/js/theme.js
(function () {
  const root = document.documentElement;
  const btn = document.getElementById('themeToggle');

  const saved = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = saved || (prefersDark ? 'dark' : 'light');

  root.setAttribute('data-theme', theme);
  if (btn) btn.textContent = theme === 'dark' ? '☀️ Light' : '🌙 Dark';

  if (btn) {
    btn.addEventListener('click', () => {
      const current = root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
      const next = current === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
      btn.textContent = next === 'dark' ? '☀️ Light' : '🌙 Dark';
    });
  }
})();