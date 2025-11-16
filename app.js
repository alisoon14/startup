document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('startDemo').addEventListener('click', function() {
    document.getElementById('demoModal').style.display = 'flex';
    document.body.style.overflow = 'hidden';
    document.getElementById('tgForm').style.display = 'none';
  });

  document.getElementById('closeModal').addEventListener('click', function() {
    document.getElementById('demoModal').style.display = 'none';
    document.body.style.overflow = '';
    document.getElementById('tgForm').style.display = 'none';
  });

  document.getElementById('noKeyBtn').addEventListener('click', function() {
    document.getElementById('tgForm').style.display = 'block';
  });

  document.getElementById('accessKeyBtn').addEventListener('click', async function() {
    const key = document.getElementById('accessKeyInput').value.trim();
    const tg_username = document.getElementById('tgUsername').value.trim() || 'anonymous';

    if (!key) {
      alert('Пожалуйста, введите ключ доступа.');
      return;
    }

    const res = await fetch('http://localhost:3333/validate-key', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({tg_username, access_key: key})
    });
    const data = await res.json();
    if (data.valid) {
      window.location.href = "demo.html";
    } else {
      alert("Неверный ключ. Проверьте ввод или получите новый.");
    }
  });

  document.addEventListener('keydown', function(e) {
    if (e.key === "Escape" && document.getElementById('demoModal').style.display === 'flex') {
      document.getElementById('demoModal').style.display = 'none';
      document.body.style.overflow = '';
      document.getElementById('tgForm').style.display = 'none';
    }
  });
});
