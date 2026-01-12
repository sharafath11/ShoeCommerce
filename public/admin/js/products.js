import { confirmAlert } from "/utils/confirmAlert.js";
import { showToast } from "/utils/toast.js";
import { debounce } from "/utils/debounce.js";

document.addEventListener("DOMContentLoaded", () => {
    initListToggle();
    initProductSearch();
});

function initListToggle() {
    const buttons = document.querySelectorAll(".btn-toggle-list");

    if (!buttons.length) return;

    buttons.forEach((button) => {
        button.addEventListener("click", async function () {
            const productId = this.dataset.id;
            const currentStatus = this.dataset.status;

            const isListing = currentStatus === 'list';

            const confirmed = await confirmAlert({
                text: isListing
                    ? "Are you sure you want to list this product?"
                    : "Are you sure you want to unlist this product?",
            });

            if (!confirmed) return;

            try {
                const res = await fetch(`/admin/products/${currentStatus}/${productId}`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                });

                if (res.ok) {
                    showToast(
                        `Product ${isListing ? "listed" : "unlisted"} successfully`,
                        "success"
                    );
                    setTimeout(() => window.location.reload(), 1000);
                } else {
                    showToast("Action failed", "error");
                }

            } catch (err) {
                console.error(err);
                showToast("Server error", "error");
            }
        });
    });
}

function initProductSearch() {
    const input = document.getElementById("searchInput");
    const rows = document.querySelectorAll("#productsTable tbody tr");

    if (!input || !rows.length) return;

    const handleSearch = debounce(() => {
        const term = input.value.trim().toLowerCase();

        rows.forEach((row) => {
            const nameEl = row.querySelector(".product-name");
            const brandEl = row.querySelector(".product-brand");

            const name = nameEl ? nameEl.textContent.toLowerCase() : "";
            const brand = brandEl ? brandEl.textContent.toLowerCase() : "";

            row.style.display =
                name.includes(term) || brand.includes(term) ? "" : "none";
        });
    }, 300);

    input.addEventListener("input", handleSearch);
}
