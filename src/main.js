// main.js (frontend)

// Example: show current year in footer
document.getElementById("year").textContent = new Date().getFullYear();

// Example: attach login redirect
const loginBtn = document.querySelector(".logs button");
if (loginBtn) {
  loginBtn.addEventListener("click", () => {
    window.location.href = "/login";
  });
}
