/**
 * Antigravity UI: User Profile
 * Target: /public/user/js/profile.js
 */

import { confirmAlert } from "/utils/confirmAlert.js";
import { showToast } from "/utils/toast.js";
import { validateMobileNumber } from "/utils/validation.js";

document.addEventListener("DOMContentLoaded", () => {
    // Initialization if needed
});

window.updtaeUser = async function (event, userId) {
    event.preventDefault();
    const username = document.getElementById("fullName").value.trim();
    const phoneNumber = document.getElementById("phone").value.trim();

    if (!validateMobileNumber(phoneNumber)) {
        showToast("Invalid mobile number", "warning");
        return;
    }

    if (username.length > 15) {
        showToast("Username must be 15 characters or less", "warning");
        return;
    }

    if (username.length < 4) {
        showToast("Username must be at least 4 characters", "warning");
        return;
    }

    const confirmed = await confirmAlert({
        title: "Update Profile",
        text: "Do you want to save these changes to your profile?",
        icon: "question",
        confirmText: "Yes, update it!"
    });

    if (!confirmed) return;

    try {
        const response = await axios.post(`/update-profile/${userId}`, {
            username: username,
            phone: phoneNumber
        });

        if (response.data.ok) {
            showToast(response.data.msg, "success");
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        } else {
            showToast(response.data.msg, "error");
        }
    } catch (error) {
        showToast("Profile update failed", "error");
    }
};
