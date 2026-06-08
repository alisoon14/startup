document.addEventListener('DOMContentLoaded', function () {
  const startDemoBtn = document.getElementById('startDemo');
  const demoModal = document.getElementById('demoModal');
  const closeModalBtn = document.getElementById('closeModal');
  const noKeyBtn = document.getElementById('noKeyBtn');
  const accessKeyBtn = document.getElementById('accessKeyBtn');
  const tgForm = document.getElementById('tgForm');
  const tgUsernameInput = document.getElementById('tgUsername');
  const accessKeyInput = document.getElementById('accessKeyInput');
  const getKeyBtn = document.getElementById('getKeyBtn'); // кнопка «Отправить»

  // В деве бэкенд крутится на 8000-м порту локально; в проде ожидаем,
  // что бэкенд опубликован на том же хосте под /api (см. boot.md).
  const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:8000'
    : `${window.location.protocol}//${window.location.host}/api`;

  // Открыть модалку по кнопке «Начать демо»
  if (startDemoBtn && demoModal) {
    startDemoBtn.addEventListener('click', function () {
      demoModal.style.display = 'flex';
      document.body.style.overflow = 'hidden';
      if (tgForm) tgForm.style.display = 'none';
    });
  }

  // Закрыть модалку по крестику
  if (closeModalBtn && demoModal) {
    closeModalBtn.addEventListener('click', function () {
      demoModal.style.display = 'none';
      document.body.style.overflow = '';
      if (tgForm) tgForm.style.display = 'none';
    });
  }

  // Показать форму «нет ключа»
  if (noKeyBtn && tgForm) {
    noKeyBtn.addEventListener('click', function () {
      tgForm.style.display = 'block';
    });
  }

  // Валидация ключа и вход в демо
  if (accessKeyBtn) {
    accessKeyBtn.addEventListener('click', async function () {
      const email = tgUsernameInput ? tgUsernameInput.value.trim() : '';
      const key = accessKeyInput ? accessKeyInput.value.trim() : '';

      if (!email || !key) {
        alert('Пожалуйста, введите email и ключ доступа.');
        return;
      }

      try {
        const res = await fetch(`${API_BASE_URL}/validate-key`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, access_key: key, tg_username: email })
        });

        if (!res.ok) {
          throw new Error('Ошибка запроса: ' + res.status);
        }

        const data = await res.json();

        if (data.valid) {
          window.location.href = '../Generator/index.html';
        } else {
          alert('Неверный ключ. Проверьте ввод или получите новый.');
        }
      } catch (e) {
        console.error(e);
        alert('Ошибка соединения с сервером. Проверьте, запущен ли backend.');
      }
    });
  }

  // Кнопка «Отправить» — запрос ключа на почту
  if (getKeyBtn && tgUsernameInput) {
    getKeyBtn.addEventListener('click', async function () {
      const email = tgUsernameInput.value.trim();
      if (!email) {
        alert('Введите email, чтобы получить ключ.');
        return;
      }

      try {
        const res = await fetch(`${API_BASE_URL}/get-key`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, tg_username: email })
        });

        if (!res.ok) {
          throw new Error('Ошибка запроса: ' + res.status);
        }

        const data = await res.json();

        if (data.error) {
          alert(data.error);
        } else if (data.accesskey) {
          alert('Ключ отправлен на почту. Проверьте inbox и спам.');
        } else {
          alert('Неизвестный ответ сервера.');
        }
      } catch (e) {
        console.error(e);
        alert('Ошибка соединения с сервером.');
      }
    });
  }

  // Закрытие модалки по Esc
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && demoModal && demoModal.style.display === 'flex') {
      demoModal.style.display = 'none';
      document.body.style.overflow = '';
      if (tgForm) tgForm.style.display = 'none';
    }
  });
});
