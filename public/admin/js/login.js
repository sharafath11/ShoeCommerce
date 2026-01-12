/**
 * Antigravity UI: Admin Login
 * Target: /public/admin/js/login.js
 */

import { showToast } from "/utils/toast.js";

document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('login-form');
    if (!form) return;

    form.addEventListener('submit', async function (event) {
        event.preventDefault();

        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;

        try {
            const response = await axios.post('/admin/login', { email, password });

            if (response.data.success) {
                // showToast("Login successful", "success"); // Optional: usually instant redirect
                window.location.href = '/admin';
            } else {
                showError('Unexpected response status');
            }
        } catch (error) {
            console.error(error);
            if (error.response) {
                showError(error.response.data.message || 'Invalid credentials');
            } else if (error.request) {
                showError('No response from server');
            } else {
                showError('Error during login');
            }
        }
    });

    function showError(msg) {
        const errorDiv = document.getElementById('error-message');
        if (errorDiv) {
            errorDiv.textContent = msg;
            errorDiv.style.display = 'block';
        } else {
            showToast(msg, "error");
        }
    }
});
