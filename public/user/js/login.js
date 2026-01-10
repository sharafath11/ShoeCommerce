/**
 * Antigravity UI: User Authentication (Login)
 * Target: /public/user/js/login.js
 */

import { showToast } from "/utils/toast.js";

document.addEventListener("DOMContentLoaded", () => {
    initPasswordToggle();
    initLoginForm();
});

function initPasswordToggle() {
    const showPasswordCheckbox = document.getElementById("showPassword");
    const passwordInput = document.getElementById("password");
    if (!showPasswordCheckbox || !passwordInput) return;

    showPasswordCheckbox.addEventListener("change", function () {
        passwordInput.type = this.checked ? "text" : "password";
    });
}

function initLoginForm() {
    const loginForm = document.getElementById("loginForm");
    if (!loginForm) return;

    loginForm.addEventListener("submit", async function (e) {
        e.preventDefault();

        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        try {
            const response = await fetch("/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!data.success) {
                showToast(data.msg, "error");
            } else {
                showToast(data.msg, "success");
                setTimeout(() => {
                    window.location.href = data.redirect;
                }, 1000);
            }
        } catch (error) {
            showToast("Critical authentication failure", "error");
        }
    });
}
