document.addEventListener("DOMContentLoaded", function () {
    const logoutBtn = document.getElementById("logoutBtn");
    const messageContainer = document.getElementById("message-container");

    logoutBtn.addEventListener("click", function (e) {
        e.preventDefault(); // Prevent default form submission

        // Disable button and show loading state
        logoutBtn.disabled = true;
        logoutBtn.innerHTML =
            '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Loading...';

        // Show skeleton loading animation
        messageContainer.innerHTML = `
              <div class="skeleton mb-2" style="height: 20px; width: 100%;"></div>
              <div class="skeleton mb-4" style="height: 20px; width: 80%;"></div>
          `;

        // Simulate logout process
        setTimeout(function () {
            axios
                .post("/logout")
                .then((response) => {
                    // Update message container with success message
                    messageContainer.innerHTML = `
            <p class="text-success mb-4 message-enter">
              Successfully logged out. Redirecting...
            </p>
          `;
                    // Redirect after a short delay
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
                    // Re-enable the button if an error occurs
                    logoutBtn.disabled = false;
                    logoutBtn.innerHTML =
                        '<i class="fas fa-sign-out-alt me-2"></i><span>Logout</span>';
                });
        }, 2000);
    });
});
