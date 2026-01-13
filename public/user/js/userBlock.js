
document.addEventListener("DOMContentLoaded", function () {
    const logoutBtn = document.getElementById("logoutBtn");
    const messageContainer = document.getElementById("message-container");

    logoutBtn.addEventListener("click", function (e) {
        e.preventDefault();

        logoutBtn.disabled = true;
        logoutBtn.innerHTML =
            '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Loading...';

        messageContainer.innerHTML = `
              <div class="skeleton mb-2" style="height: 20px; width: 100%;"></div>
              <div class="skeleton mb-4" style="height: 20px; width: 80%;"></div>
          `;

        setTimeout(function () {
            axios
                .post("/logout")
                .then((response) => {
                    messageContainer.innerHTML = `
            <p class="text-success mb-4 message-enter">
              Successfully logged out. Redirecting...
            </p>
          `;
                    setTimeout(() => {
                        window.location.href = "/";
                    }, 1500);
                })
                .catch((error) => {
                    console.error(error);
                    messageContainer.innerHTML = `
            <p class="text-danger mb-4 message-enter">
              Error logging out. Please try again.
            </p>
          `;
                    logoutBtn.disabled = false;
                    logoutBtn.innerHTML =
                        '<i class="fas fa-sign-out-alt me-2"></i><span>Logout</span>';
                });
        }, 2000);
    });
});
