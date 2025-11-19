document.addEventListener("DOMContentLoaded", function() {
  document.getElementById("startDemo").addEventListener("click", function() {
    document.getElementById("demoModal").style.display = "flex";
    document.body.style.overflow = "hidden";
    document.getElementById("emailForm").style.display = "block";
    document.getElementById("validateForm").style.display = "none";
  });

  document.getElementById("closeModal").addEventListener("click", function() {
    document.getElementById("demoModal").style.display = "none";
    document.body.style.overflow = "";
  });

  document.getElementById("getKeyBtn").addEventListener("click", async function() {
    const email = document.getElementById("userEmail").value.trim();
    if (!email) { alert("Введите email!"); return; }
    const res = await fetch("http://localhost:8000/get-key", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });
    const data = await res.json();
    if (data.accesskey) {
      alert("Ключ отправлен на ваш email!");
      document.getElementById("emailForm").style.display = "none";
      document.getElementById("validateForm").style.display = "block";
    } else {
      alert("Ошибка: " + (data.error || "не удалось отправить ключ"));
    }
  });

  document.getElementById("validateKeyBtn").addEventListener("click", async function() {
    const email = document.getElementById("userEmail2").value.trim();
    const key = document.getElementById("accessKeyInput").value.trim();
    if (!email || !key) { alert("Заполните все поля!"); return; }
    const res = await fetch("http://localhost:8000/validate-key", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, accesskey: key })
    });
    const data = await res.json();
    if (data.valid) {
      window.location.href = "demo.html";
    } else {
      alert("Неверный ключ!");
    }
  });
});
