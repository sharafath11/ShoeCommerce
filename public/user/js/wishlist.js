/**
 * Antigravity UI: User Wishlist
 * Target: /public/user/js/wishlist.js
 */

import { showToast } from "/utils/toast.js";

document.addEventListener("DOMContentLoaded", () => {
    // Initialization if needed
});

window.addToCart = async function (event, productId) {
    const sizeSelect = document.getElementById(`size-${productId}`);
    if (!sizeSelect) return;

    const selectedSize = sizeSelect.value;
    if (!selectedSize) {
        showToast("Please select a size :)", "warning");
        return;
    }

    try {
        const response = await axios.post(`/addToCart/${productId}`, { size: selectedSize });
        if (response.data.success) {
            showToast(response.data.message, "success");
            updateCartQuantity();
        } else {
            if (response.data.message) {
                showToast(response.data.message, "error");
            } else {
                window.location.href = '/ShowLoginMsg';
            }
        }
    } catch (error) {
        showToast("Failed to add item to cart", "error");
    }
};

function updateCartQuantity() {
    const cartQtyEl = document.getElementById('cart-quantity');
    if (cartQtyEl) {
        let currentCartQty = parseInt(cartQtyEl.innerText) || 0;
        cartQtyEl.innerText = currentCartQty + 1;
    }
}
