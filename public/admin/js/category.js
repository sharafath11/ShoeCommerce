import { confirmAlert } from "/utils/confirmAlert.js";
import { showToast } from "/utils/toast.js";

document.addEventListener('DOMContentLoaded', () => {
    initStatusToggles();
});

function initStatusToggles() {
    const buttons = document.querySelectorAll(".toggle-list-status");
    if (!buttons.length) return;

    buttons.forEach((btn) => {
        btn.addEventListener("click", async function (e) {
            e.preventDefault();
            const id = this.dataset.id;
            const btnText = this.textContent.trim().toLowerCase();
            const isBlocking = btnText.includes('block') && !btnText.includes('unblock');

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

                if (response.ok && data.ok) {
                    showToast(
                        `Category ${isBlocking ? 'blocked' : 'activated'} successfully`,
                        "success"
                    );

                    const row = this.closest('tr');
                    if (row) {
                        const badge = row.querySelector('.badge-status');

                        this.innerHTML = `<i class="bi bi-shield-exclamation me-1"></i>${isBlocking ? 'Unblock' : 'Block'}`;

                        if (badge) {
                            badge.textContent = isBlocking ? 'Blocked' : 'Active';

                            if (isBlocking) {
                                badge.classList.remove('bg-success-subtle');
                                badge.classList.add('bg-danger-subtle');
                            } else {
                                badge.classList.remove('bg-danger-subtle');
                                badge.classList.add('bg-success-subtle');
                            }
                        }
                    }

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
