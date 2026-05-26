// frontend/js/dashboard.js - DEBUG (shows errors on page, no redirect)
const BACKEND_URL = "http://localhost:5000";

function showDebugError(msg) {
  const debugDiv = document.getElementById("debug-container");
  if (debugDiv) {
    debugDiv.style.display = "block";
    debugDiv.innerHTML += `<div>⚠️ ${new Date().toLocaleTimeString()} - ${msg}</div>`;
  }
  console.error(msg);
}

console.log("dashboard.js loaded");

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOMContentLoaded fired");
  const token = localStorage.getItem("token");
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem("user"));
  } catch (e) {
    user = null;
  }

  console.log("Token exists?", !!token);
  console.log("User:", user);

  // Validation – show error on page, do NOT redirect
  if (!token) {
    showDebugError(
      "No token found. localStorage.user = " + localStorage.getItem("user"),
    );
    return;
  }
  if (!user) {
    showDebugError(
      "No user object. Raw user string: " + localStorage.getItem("user"),
    );
    return;
  }
  if (!user.role || user.role.toLowerCase() !== "admin") {
    showDebugError(`Invalid role: "${user.role}" (should be "admin")`);
    return;
  }

  console.log("Validation passed – initializing dashboard");

  async function apiCall(url, options = {}) {
    const fullUrl = url.startsWith("http") ? url : `${BACKEND_URL}${url}`;
    console.log(`apiCall: ${options.method || "GET"} ${fullUrl}`);
    const res = await fetch(fullUrl, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    });
    console.log(`Response status: ${res.status}`);
    if (res.status === 401) {
      showDebugError("Received 401 – token invalid or expired");
      localStorage.clear();
      return null;
    }
    const text = await res.text();
    if (!text) return null;
    try {
      return JSON.parse(text);
    } catch (e) {
      showDebugError("JSON parse error from " + fullUrl);
      return null;
    }
  }

  // Tab switching
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document
        .querySelectorAll(".tab-btn")
        .forEach((b) => b.classList.remove("active"));
      document
        .querySelectorAll(".tab-content")
        .forEach((c) => c.classList.remove("active"));
      btn.classList.add("active");
      document.getElementById(`${btn.dataset.tab}-tab`).classList.add("active");
      if (btn.dataset.tab === "stats") loadStats();
      if (btn.dataset.tab === "staff") loadStaff();
      if (btn.dataset.tab === "visitors") loadVisitors();
      if (btn.dataset.tab === "logs") loadLogs();
    });
  });

  async function loadStats() {
    try {
      const stats = await apiCall("/api/dashboard/stats");
      if (stats) {
        document.getElementById("stats").innerHTML = `
          <div class="stat-card"><i class="fas fa-users"></i><span>Total Staff</span><p>${stats.totalStaff}</p></div>
          <div class="stat-card"><i class="fas fa-calendar-check"></i><span>Today's Attendance</span><p>${stats.todayAttendance}</p></div>
          <div class="stat-card"><i class="fas fa-user-clock"></i><span>Active Now</span><p>${stats.activeNow}</p></div>
          <div class="stat-card"><i class="fas fa-user-plus"></i><span>Today's Visitors</span><p>${stats.todayVisitors}</p></div>
        `;
      } else {
        document.getElementById("stats").innerHTML =
          "<p>No stats available</p>";
      }
    } catch (err) {
      showDebugError("loadStats error: " + err.message);
    }
  }

  async function loadStaff() {
    try {
      const staff = await apiCall("/api/staff");
      const tbody = document.querySelector("#staffTable tbody");
      if (staff && staff.length) {
        tbody.innerHTML = staff
          .map(
            (s) => `
          <tr><td>${s.id}</td><td>${s.full_name}</td><td>${s.employee_id}</td><td>${s.email}</td><td><button class="btn delete-staff" data-id="${s.id}">Delete</button></td></tr>
        `,
          )
          .join("");
        document.querySelectorAll(".delete-staff").forEach((btn) => {
          btn.addEventListener("click", () => deleteStaff(btn.dataset.id));
        });
      } else {
        tbody.innerHTML = '<tr><td colspan="5">No staff found</td></tr>';
      }
    } catch (err) {
      console.error(err);
    }
  }

  window.deleteStaff = async (id) => {
    if (confirm("Delete staff?")) {
      await apiCall(`/api/staff/${id}`, { method: "DELETE" });
      loadStaff();
      loadStats();
    }
  };

  document
    .getElementById("createStaffForm")
    ?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const full_name = document.getElementById("full_name").value;
      const employee_id = document.getElementById("employee_id").value;
      const email = document.getElementById("email").value;
      await apiCall("/api/staff", {
        method: "POST",
        body: JSON.stringify({ full_name, employee_id, email }),
      });
      e.target.reset();
      loadStaff();
      loadStats();
      alert("Staff created. Credentials sent to email.");
    });

  async function loadVisitors() {
    try {
      const visitors = await apiCall("/api/visitors");
      const tbody = document.querySelector("#visitorTable tbody");
      if (visitors && visitors.length) {
        tbody.innerHTML = visitors
          .map(
            (v) => `
          <tr><td>${v.full_name}</td><td>${v.phone_number || ""}</td><td>${v.purpose}</td><td>${v.host_name || ""}</td><td>${new Date(v.time_in).toLocaleString()}</td><td>${v.time_out ? new Date(v.time_out).toLocaleString() : "Not yet"}</td><td>${!v.time_out ? `<button class="btn exit-visitor" data-id="${v.id}">Exit</button>` : ""}</td></tr>
        `,
          )
          .join("");
        document.querySelectorAll(".exit-visitor").forEach((btn) => {
          btn.addEventListener("click", () => exitVisitor(btn.dataset.id));
        });
      } else {
        tbody.innerHTML = '<tr><td colspan="7">No visitors</td></tr>';
      }
    } catch (err) {
      console.error(err);
    }
  }

  window.exitVisitor = async (id) => {
    await apiCall(`/api/visitors/${id}/exit`, { method: "PUT" });
    loadVisitors();
    loadStats();
  };

  document
    .getElementById("visitorForm")
    ?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const full_name = document.getElementById("visitor_name").value;
      const phone_number = document.getElementById("phone").value;
      const purpose = document.getElementById("purpose").value;
      const host_name = document.getElementById("host").value;
      await apiCall("/api/visitors", {
        method: "POST",
        body: JSON.stringify({ full_name, phone_number, purpose, host_name }),
      });
      e.target.reset();
      loadVisitors();
      loadStats();
    });

  async function loadLogs() {
    try {
      const logs = await apiCall("/api/attendance/logs");
      const tbody = document.querySelector("#logsTable tbody");
      if (logs && logs.length) {
        tbody.innerHTML = logs
          .map(
            (l) => `
          <tr><td>${l.User?.full_name || "N/A"}</td><td>${l.User?.employee_id || "N/A"}</td><td>${new Date(l.time_in).toLocaleString()}</td><td>${l.time_out ? new Date(l.time_out).toLocaleString() : "Active"}</td><td>${l.network_ip || ""}</td></tr>
        `,
          )
          .join("");
      } else {
        tbody.innerHTML = '<tr><td colspan="5">No logs found</td></tr>';
      }
    } catch (err) {
      console.error(err);
    }
  }

  document.getElementById("exportCsv")?.addEventListener("click", () => {
    window.location.href = `${BACKEND_URL}/api/reports/attendance/csv?token=${token}`;
  });

  document.getElementById("logoutBtn")?.addEventListener("click", () => {
    localStorage.clear();
    window.location.href = "/frontend/index.html";
  });

  // Start with stats tab
  loadStats();
});
