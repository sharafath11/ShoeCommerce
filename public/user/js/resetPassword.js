/**
 * Antigravity UI: Reset Password
 * Target: /public/user/js/resetPassword.js
 */

import { showToast } from "/utils/toast.js";
import { validatePassword } from "/utils/validation.js";

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById('resetPasswordForm');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const newPassword = document.getElementById('newPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            const token = document.getElementById('token').value;

            const validation = validatePassword(newPassword);
            if (!validation.isValid) {
                showToast(validation.message, "warning");
                return;
            }

            if (newPassword !== confirmPassword) {
                showToast("Passwords do not match", "warning");
                return;
            }

            try {
                const { isConfirmed } = await Swal.fire({
                    title: 'Are you sure?',
                    text: 'You are about to reset your password!',
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonText: 'Yes, Reset it!',
                });

                if (isConfirmed) {
                    const response = await axios.post('/reset-password', {
                        token: token,
                        newPassword: newPassword
                    });

                    if (response.data.ok) {
                        showToast(response.data.msg, "success");
                        setTimeout(() => {
                            window.location.href = response.data.red;
                        }, 1000);
                    } else {
                        showToast(response.data.msg, "error");
                    }
                }
            } catch (error) {
                const msg = error.response?.data?.msg || 'An error occurred. Please try again.';
                showToast(msg, "error");
            }
        });
    }
});
