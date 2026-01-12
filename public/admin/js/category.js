/**
 * Antigravity UI: Category Management
 * Target: /public/admin/js/category.js
 */

import { confirmAlert } from "/utils/confirmAlert.js";
import { showToast } from "/utils/toast.js";

document.addEventListener('DOMContentLoaded', () => {
    initStatusToggles();
});

/**
 * Handle Block/Unblock
 */
function initStatusToggles() {
    const buttons = document.querySelectorAll(".toggle-list-status");
    if (!buttons.length) return;

    buttons.forEach((btn) => {
        btn.addEventListener("click", async function (e) {
            e.preventDefault();
            const id = this.dataset.id;
            const currentText = this.textContent.trim().toLowerCase();
            const isBlocking = currentText.includes('block') && !currentText.includes('unblock'); // heuristic

            // Logic check: 'Unblock' text means it is blocked. 'Block' means it is active.
            // If text is 'Block', we are blocking.

            const confirmed = await confirmAlert({
                title: isBlocking ? "Block Category?" : "Unblock Category?",
                text: isBlocking
                    ? "This will hide all products in this category."
                    : "This will make products in this category visible again.",
                icon: "warning"
            });

            if (!confirmed) return;

            try {
                const response = await fetch(`/admin/category/toggle-category/${id}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                });

                const data = await response.json();

                if (response.ok && data.ok) { // Adjust based on controller response structure
                    showToast("Status updated successfully", "success");
                    setTimeout(() => location.reload(), 1000);
                } else {
                    showToast(data.message || "Action failed", "error");
                }
            } catch (error) {
                console.error(error);
                showToast("Server error", "error");
            }
        });
    });
}
