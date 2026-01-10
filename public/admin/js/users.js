import { confirmAlert } from "/utils/confirmAlert.js";
import { showToast } from "/utils/toast.js";
import { debounce } from "/utils/debounce.js";

document.addEventListener("DOMContentLoaded", () => {
    initBlockToggle();
    initUserSearch();
});

function initBlockToggle() {
    const buttons = document.querySelectorAll(".toggle-block-btn");

    if (!buttons.length) return;

    buttons.forEach((button) => {
        button.addEventListener("click", async function () {
            const userId = this.dataset.id;
            const isBlocking = this.textContent.trim() === "Block";

            const confirmed = await confirmAlert({
                text: isBlocking
                    ? "Are you sure you want to block this user?"
                    : "Are you sure you want to unblock this user?",
            });

            if (!confirmed) return;

            try {
                const res = await fetch(`/admin/users/toggle-block/${userId}`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                });

                const data = await res.json();

                if (!data.ok) {
                    showToast("Action failed", "error");
                    return;
                }

                this.textContent = data.block ? "Unblock" : "Block";
                this.className = `btn btn-sm btn-${data.block ? "danger" : "success"
                    } toggle-block-btn`;

                showToast(
                    `User ${data.block ? "blocked" : "unblocked"} successfully`,
                    "success"
                );
            } catch (err) {
                console.error(err);
                showToast("Server error", "error");
            }
        });
    });
}
function initUserSearch() {
    const input = document.getElementById("searchInput");
    const rows = document.querySelectorAll("#userTableBody tr");

    if (!input || !rows.length) return;

    const handleSearch = debounce(() => {
        const term = input.value.trim().toLowerCase();

        rows.forEach((row) => {
            const { username, email } = row.dataset;

            row.style.display =
                username.includes(term) || email.includes(term) ? "" : "none";
        });
    }, 300);

    input.addEventListener("input", handleSearch);
}
