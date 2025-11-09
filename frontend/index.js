document.addEventListener("DOMContentLoaded", () => {
  const API_BASE = "http://localhost:8080/api/auth";

  const authContainer = document.getElementById("auth-ui-container");
  const userMenuContainer = document.getElementById("userMenuContainer");
  const userNameDisplay = document.getElementById("userNameDisplay");
  const userAvatar = document.getElementById("userAvatar");
  const dropdownName = document.getElementById("dropdownName");
  const dropdownEmail = document.getElementById("dropdownEmail");
  const logoutBtn = document.getElementById("logoutBtn");
  const userMenuBtn = document.getElementById("userMenuBtn");
  const userDropdown = document.getElementById("userDropdown");

  // ✅ Fetch current logged-in user
  async function checkAuthStatus() {
    try {
      const res = await fetch(`${API_BASE}/user`, { credentials: "include" });
      if (!res.ok) throw new Error("Not logged in");

      const user = await res.json();
      if (user.error) throw new Error("No valid session");

      localStorage.setItem("user", JSON.stringify(user));
      showUserUI(user);
    } catch {
      showGuestUI();
    }
  }

  // ✅ Show logged-in user UI
  function showUserUI(user) {
    authContainer.classList.add("hidden");
    userMenuContainer.classList.remove("hidden");

    const profilePic =
      user.profilePicture ||
      user.picture ||
      "https://i.pravatar.cc/150?u=" + user.email;

    userNameDisplay.textContent = user.name || "User";
    userAvatar.src = profilePic;
    dropdownName.textContent = user.name || "User";
    dropdownEmail.textContent = user.email || "";
  }

  // ✅ Show guest UI
  function showGuestUI() {
    userMenuContainer.classList.add("hidden");
    authContainer.classList.remove("hidden");
    localStorage.removeItem("user");
  }

  // ✅ Logout
  logoutBtn.addEventListener("click", async () => {
    try {
      await fetch("http://localhost:8080/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch {
      console.warn("Logout request failed, clearing locally anyway.");
    }
    localStorage.clear();
    showGuestUI();
    window.location.href = "login.html";
  });

  // ✅ Dropdown toggle
  userMenuBtn.addEventListener("click", () => {
    userDropdown.classList.toggle("hidden");
  });

  // ✅ Check on load
  checkAuthStatus();
});


async function loadAuthUI() {
  const authContainer = document.getElementById("auth-ui-container");

  try {
    const response = await fetch("http://localhost:8080/api/auth/user", {
      credentials: "include",
    });

    if (!response.ok) throw new Error("No user logged in");
    const user = await response.json();

    document.getElementById("welcome").textContent = `Welcome, ${user.username}`;
    document.getElementById("userProfilePic").src = user.profilePicUrl;
    document.getElementById("userProfilePic").classList.remove("hidden");
  } catch (error) {
    document.getElementById("welcome").textContent = "";
    document.getElementById("userProfilePic").classList.add("hidden");
  }
}

document.addEventListener("DOMContentLoaded", loadAuthUI);



document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const response = await fetch("/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (response.ok) {
    const data = await response.json();
    alert(data.message); // optional
    window.location.href = "index.html";  // ✅ redirect manually
  } else {
    const err = await response.json();
    alert(err.message);
  }
});
