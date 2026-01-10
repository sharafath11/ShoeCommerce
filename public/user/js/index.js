/**
 * Antigravity UI: Home Page
 * Target: /public/user/js/index.js
 */

import { showToast } from "/utils/toast.js";

document.addEventListener("DOMContentLoaded", () => {
    // Check for server-side message passed via template (if any)
    const serverMessage = document.body.dataset.serverMsg;
    if (serverMessage) {
        showToast(serverMessage, "success");
    }
});

window.addToCart = async function (productId) {
    try {
        const response = await axios.get(`/addToCart/${productId}`);
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
        showToast("Failed to add product to cart", "error");
    }
};

window.addToWishList = async function (productId) {
    try {
        const response = await axios.post(`/whislistAdd/${productId}`);
        if (response.data.success) {
            showToast(response.data.message, "success");
            addWishlistQty();
        } else {
            if (response.data.message) {
                showToast(response.data.message, "error");
            } else {
                window.location.href = '/ShowLoginMsg';
            }
        }
    } catch (error) {
        showToast("Failed to add to wishlist", "error");
    }
};

function updateCartQuantity() {
    const cartQtyEl = document.getElementById('cart-quantity');
    if (cartQtyEl) {
        let currentCartQty = parseInt(cartQtyEl.innerText) || 0;
        cartQtyEl.innerText = currentCartQty + 1;
    }
}

function addWishlistQty() {
    const wishlistQtyEl = document.getElementById('w-qty');
    if (wishlistQtyEl) {
        let currentWtQty = parseInt(wishlistQtyEl.innerText) || 0;
        wishlistQtyEl.innerText = currentWtQty + 1;
    }
}
