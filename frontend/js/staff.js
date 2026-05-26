// frontend/js/staff.js
const BACKEND_URL = "http://localhost:5000";

function formatDateTime(isoString) {
  if (!isoString) return "Time not recorded";
  const date = new Date(isoString);
  if (isNaN(date.getTime())) {
    console.warn("Invalid date string:", isoString);
    return isoString;
  }
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem("user"));
  } catch (e) {
    user = null;
  }

  if (!token || !user || (user.role && user.role.toLowerCase() !== "staff")) {
    window.location.href = "/frontend/index.html";
    return;
  }

  document.getElementById("userInfo").innerHTML = `
    <i class="fas fa-user-circle"></i> Welcome back, <strong>${user.full_name}</strong>
  `;

  async function apiCall(url, options = {}) {
    const fullUrl = url.startsWith("http") ? url : `${BACKEND_URL}${url}`;
    const res = await fetch(fullUrl, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    });
    if (res.status === 401) {
      localStorage.clear();
      window.location.href = "/frontend/index.html";
      throw new Error("Session expired");
    }
    const text = await res.text();
    if (!text) return null;
    try {
      return JSON.parse(text);
    } catch (e) {
      console.error("JSON parse error from", fullUrl, text);
      throw new Error("Server response error");
    }
  }

  function showStatus(message, type = "success") {
    const statusDiv = document.getElementById("attendanceStatus");
    statusDiv.innerHTML = `
      <div class="alert alert-${type}">
        <i class="fas ${type === "success" ? "fa-check-circle" : "fa-exclamation-circle"}"></i>
        ${message}
      </div>
    `;
    setTimeout(() => {
      if (statusDiv.firstChild) statusDiv.innerHTML = "";
    }, 5000);
  }

  // Show QR Code
  const showQrBtn = document.getElementById("showQrBtn");
  if (showQrBtn) {
    showQrBtn.addEventListener("click", async () => {
      try {
        const data = await apiCall(`/api/staff/${user.id}/qrcode`);
        if (data && data.qrCodeDataUrl) {
          document.getElementById("qrCodeContainer").innerHTML = `
            <img src="${data.qrCodeDataUrl}" alt="QR Code" class="qr-image">
            <p class="qr-hint">Scan this QR at the entrance</p>
          `;
        } else {
          document.getElementById("qrCodeContainer").innerHTML =
            "<p class='error-text'>No QR code available</p>";
        }
      } catch (err) {
        document.getElementById("qrCodeContainer").innerHTML =
          `<p class='error-text'>Error: ${err.message}</p>`;
      }
    });
  }

  // Check-in
  const checkInBtn = document.getElementById("checkInBtn");
  if (checkInBtn) {
    checkInBtn.addEventListener("click", async () => {
      try {
        const data = await apiCall("/api/attendance/check-in", {
          method: "POST",
        });
        const timeFormatted = data?.time_in
          ? formatDateTime(data.time_in)
          : formatDateTime(new Date().toISOString());
        showStatus(`Checked in successfully at ${timeFormatted}`, "success");
      } catch (err) {
        showStatus(err.message, "error");
      }
    });
  }

  // Check-out
  const checkOutBtn = document.getElementById("checkOutBtn");
  if (checkOutBtn) {
    checkOutBtn.addEventListener("click", async () => {
      try {
        const data = await apiCall("/api/attendance/check-out", {
          method: "POST",
        });
        const timeFormatted = data?.time_out
          ? formatDateTime(data.time_out)
          : formatDateTime(new Date().toISOString());
        showStatus(`Checked out successfully at ${timeFormatted}`, "success");
      } catch (err) {
        showStatus(err.message, "error");
      }
    });
  }

  // QR Scanner
  const qrReaderDiv = document.getElementById("qr-reader");
  if (qrReaderDiv) {
    const html5QrCode = new Html5Qrcode("qr-reader");
    html5QrCode.start(
      { facingMode: "environment" },
      { fps: 10, qrbox: 250 },
      (decodedText) => {
        document.getElementById("scanResult").innerHTML = `
          <div class="scan-success">
            <i class="fas fa-check-circle"></i> Scanned: <span class="scanned-url">${decodedText}</span><br>
            Redirecting to login...
          </div>
        `;
        window.location.href = decodedText;
        html5QrCode.stop();
      },
      (err) => console.warn(err),
    );
  }

  // ========== LOGOUT BUTTON – GUARANTEED TO WORK ==========
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    // Remove any existing listeners by replacing with a clone
    const newLogoutBtn = logoutBtn.cloneNode(true);
    logoutBtn.parentNode.replaceChild(newLogoutBtn, logoutBtn);

    newLogoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log("Logging out staff user...");
      localStorage.clear();
      sessionStorage.clear();
      // Determine correct login page URL
      const isFrontendRoot = window.location.pathname.includes("/frontend/");
      const loginUrl = isFrontendRoot ? "/frontend/index.html" : "/index.html";
      window.location.href = loginUrl;
    });
  } else {
    console.error("Logout button not found in DOM");
  }
});
