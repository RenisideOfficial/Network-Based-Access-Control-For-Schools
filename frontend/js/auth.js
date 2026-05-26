// frontend/js/auth.js
const BACKEND_URL = "http://localhost:5000";

document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const employeeId = urlParams.get("employee_id");
  if (employeeId) {
    const emailInput = document.getElementById("email");
    emailInput.value = `${employeeId}@company.com`;
    const infoMsg = document.createElement("div");
    infoMsg.className = "info";
    infoMsg.textContent = `Email prefilled for ${employeeId}`;
    document.getElementById("loginForm").prepend(infoMsg);
    setTimeout(() => infoMsg.remove(), 3000);
  }

  // Login form handler
  document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const errorDiv = document.getElementById("errorMsg");

    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      // Normalize role to lowercase to avoid case mismatch
      const normalizedUser = {
        id: data.user.id,
        full_name: data.user.full_name,
        role: data.user.role.toLowerCase(),
      };
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(normalizedUser));

      if (normalizedUser.role === "admin") {
        window.location.href = "/frontend/pages/dashboard.html";
      } else {
        window.location.href = "/frontend/pages/staff-dashboard.html";
      }
    } catch (err) {
      errorDiv.textContent = err.message;
    }
  });
});
