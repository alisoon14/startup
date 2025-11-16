document.getElementById('startDemo').addEventListener('click', function() {
  document.getElementById('demoModal').style.display = 'flex';
});

document.getElementById('closeModal').addEventListener('click', function() {
  document.getElementById('demoModal').style.display = 'none';
  document.getElementById('tgForm').style.display = 'none'; // скрываем форму если была видна
});

document.getElementById('noKeyBtn').addEventListener('click', function() {
  document.getElementById('tgForm').style.display = 'block';
});

// запрос на валидацию ключа: username и ключ (просто по локальному серверу)
document.getElementById('accessKeyBtn').addEventListener('click', async function() {
  const key = document.getElementById('accessKeyInput').value;
  
  // Для пользовательского ввода telegram username можно добавить отдельное поле, в примере его нет, либо использовать из формы ниже
  let tg_username = document.getElementById('tgUsername').value || 'anonymous';

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

// отправка запроса на генерацию ключа по username
document.getElementById('sendTgBtn').addEventListener('click', async function() {
  const username = document.getElementById('tgUsername').value;
  const res = await fetch('http://localhost:3333/get-key', {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({tg_username: username})
  });
  const data = await res.json();
  alert(`Ключ для доступа:\n${data.access_key}\n(Скопируйте и вставьте его сверху)`);
});
function showModal() {
  document.getElementById('demoModal').style.display = 'flex';
  document.getElementById('tgForm').style.display = 'none';
  document.body.style.overflow = 'hidden'; // блокируем прокрутку
}

function hideModal() {
  document.getElementById('demoModal').style.display = 'none';
  document.getElementById('tgForm').style.display = 'none';
  document.body.style.overflow = ''; // снимаем блокировку прокрутки
}

document.getElementById('startDemo').addEventListener('click', showModal);

document.getElementById('closeModal').addEventListener('click', hideModal);

// "нет ключа" - показываем форму
document.getElementById('noKeyBtn').addEventListener('click', function(e) {
  e.preventDefault();
  document.getElementById('tgForm').style.display = 'block';
});

// закрытие по esc
document.addEventListener('keydown', function(e){
  if (e.key === "Escape" && document.getElementById('demoModal').style.display === 'flex') {
    hideModal();
  }
});
