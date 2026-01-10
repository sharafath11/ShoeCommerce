/**
 * Antigravity UI: Forgot Password
 * Target: /public/user/js/forgotPassword.js
 */

import { showToast } from "/utils/toast.js";

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById('forgotPasswordForm');
    if (form) {
        form.addEventListener('submit', async function (e) {
            e.preventDefault();
            const email = document.getElementById('email').value;

            try {
                const response = await axios.post('/forgot-password', { email });
                showToast(response.data.msg, response.data.ok ? "success" : "error");
            } catch (error) {
                showToast("Failed to send reset link", "error");
            }
        });
    }
});
