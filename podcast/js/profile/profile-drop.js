document.addEventListener('DOMContentLoaded', function () {
  const profileBar = document.getElementById('profileBar');
  const logoutBtn = document.querySelector('.logout-btn');

  if (profileBar) {
    profileBar.addEventListener('click', function(e) {
      profileBar.classList.toggle('active');
      e.stopPropagation();
    });

    document.addEventListener('click', function() {
      profileBar.classList.remove('active');
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', function() {
      localStorage.clear();
      sessionStorage.clear();
      window.location.reload();
    });
  }
});