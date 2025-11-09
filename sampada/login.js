document.addEventListener("DOMContentLoaded", () => {
  const authForm = document.getElementById("authForm");
  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");
  const confirmPasswordInput = document.getElementById("confirm-password");
  const toggleLink = document.getElementById("toggle-link");
  const googleBtn = document.getElementById("googleLoginBtn");

  const API_BASE = "http://localhost:8080/api/auth";
  let isLoginMode = true;

  // 🔄 Toggle between Login/Register
  toggleLink.addEventListener("click", e => {
    e.preventDefault();
    isLoginMode = !isLoginMode;

    document.getElementById("confirm-password-group").classList.toggle("hidden");
    document.getElementById("forgot-password-group").classList.toggle("hidden");

    document.getElementById("form-title").innerHTML = isLoginMode
      ? '<i class="bi bi-lock-fill"></i> Secure Login'
      : '<i class="bi bi-person-plus-fill"></i> Create Account';

    document.getElementById("toggle-text").textContent = isLoginMode
      ? "Don't have an account?"
      : "Already have an account?";

    document.getElementById("toggle-link").textContent = isLoginMode
      ? "Register Here"
      : "Log In Here";

    document.getElementById("submit-btn").innerHTML = isLoginMode
      ? '<i class="bi bi-box-arrow-in-right"></i> Log In'
      : '<i class="bi bi-person-fill-add"></i> Register';

    authForm.reset();
  });

  // 🧠 Handle manual Login / Register
  authForm.addEventListener("submit", async e => {
    e.preventDefault();

    const email = usernameInput.value.trim();
    const password = passwordInput.value.trim();
    const confirmPassword = confirmPasswordInput.value.trim();

    if (!email || !password) {
      showMessage("error", "Please fill in all fields.");
      return;
    }

    if (!isLoginMode && password !== confirmPassword) {
      showMessage("error", "Passwords do not match.");
      return;
    }

    const endpoint = isLoginMode
      ? `${API_BASE}/login`
      : `${API_BASE}/register`;

    const body = isLoginMode
      ? { email, password }
      : { name: email.split("@")[0], email, password };

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        credentials: "include"
      });

      const resultText = await response.text();
      const result = safeJson(resultText);

      if (response.ok) {
  showMessage(
    "success",
    result.message || (isLoginMode ? "Login successful!" : "Registration successful!")
  );

  // ✅ Save JWT token if provided
  if (result.token) {
    localStorage.setItem("token", result.token);
  }

  // ✅ Also fetch user info
  setTimeout(async () => {
    const userRes = await fetch(`${API_BASE}/user`, {
      headers: {
        "Authorization": `Bearer ${result.token || localStorage.getItem("token")}`
      }
    });
    const user = await userRes.json();
    if (user && user.email) {
      localStorage.setItem("user", JSON.stringify(user));
    }
    window.location.href = "index.html";
  }, 1000);
}
 else {
        showMessage("error", result.message || "Something went wrong.");
      }
    } catch (error) {
      console.error("Error:", error);
      showMessage("error", "Server error. Try again later.");
    }
  });

  // 🔑 Google Sign-In
  googleBtn.addEventListener("click", () => {
    window.location.href = `${API_BASE.replace("/api/auth", "")}/oauth2/authorization/google`;
  });

  // ✅ If Google login redirect happened
  fetch(`${API_BASE}/user`, { credentials: "include" })
    .then(res => res.json())
    .then(user => {
      if (user && user.email && !user.error) {
        localStorage.setItem("user", JSON.stringify(user));
        setTimeout(() => (window.location.href = "index.html"), 300);
      }
    })
    .catch(() => {});
});

// Utility: Safe JSON parse
function safeJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}

// Utility: Toast Message Box
function showMessage(type, message) {
  const box = document.getElementById("messageBox");
  const icon = document.getElementById("messageIcon");
  const text = document.getElementById("messageText");

  const map = {
    success: ["bi bi-check-circle-fill", "text-green-500"],
    error: ["bi bi-x-octagon-fill", "text-red-500"],
    warning: ["bi bi-exclamation-triangle-fill", "text-yellow-500"],
  };

  const [iconClass, color] = map[type] || map.warning;
  icon.className = `${iconClass} ${color}`;
  text.textContent = message;

  box.classList.add("active");
  setTimeout(() => box.classList.remove("active"), 2000);
}

fetch('/login', {
  method: 'POST',
  body: new FormData(form)
}).then(res => {
  if (res.ok) {
    window.location.href = '/index.html';
  } else {
    alert('Invalid credentials');
  }
});
