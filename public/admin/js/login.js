import { showToast } from "/utils/toast.js";

document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("login-form");
    if (!form) return;

    form.addEventListener("submit", async function (event) {
        event.preventDefault();

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value.trim();

        try {
            const response = await axios.post(
                "/admin/login",
                { email, password },
                { withCredentials: true }
            );

            if (response.data.success) {
                window.location.href = "/admin";
            }
        } catch (error) {
            console.error(error);

            const msg =
                error.response?.data?.msg ||
                error.response?.data?.message ||
                "Invalid credentials";

            showError(msg);
        }
    });

    function showError(msg) {
        const errorDiv = document.getElementById("error-message");
        if (errorDiv) {
            errorDiv.textContent = msg;
            errorDiv.style.display = "block";
        } else {
            showToast(msg, "error");
        }
    }
});
