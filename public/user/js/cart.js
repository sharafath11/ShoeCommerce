/**
 * Antigravity UI: Shopping Cart
 * Target: /public/user/js/cart.js
 */

import { confirmAlert } from "/utils/confirmAlert.js";
import { showToast } from "/utils/toast.js";

document.addEventListener("DOMContentLoaded", () => {
    initRemoveHandlers();
});

window.proceedToCheckout = function (cartProducts) {
    const allSizesAvailable = cartProducts.every(item => item.isSizeAvailable);

    if (allSizesAvailable) {
        window.location.href = "/checkout";
    } else {
        showToast("One or more items in your cart are out of stock. Please update your cart.", "warning");
    }
};

window.updateQuantity = async function (productId, action, index) {
    const qtyInput = document.getElementById("sst-" + index);
    let currentQty = parseInt(qtyInput.value);
    const sizeElement = document.getElementById(`display-size-${index}`);
    const size = sizeElement ? sizeElement.innerText.trim() : null;

    if (!size || size === "Out of Stock") {
        showToast("Please select valid size", "warning");
        return;
    }

    const MAX_QUANTITY = 3;

    if (action === "increase") {
        if (currentQty < MAX_QUANTITY) {
            currentQty++;
        } else {
            showToast("Maximum quantity is " + MAX_QUANTITY, "warning");
            return;
        }
    } else if (action === "decrease" && currentQty > 1) {
        currentQty--;
    } else {
        return;
    }

    // Optimistically update UI
    qtyInput.value = currentQty;

    try {
        const response = await axios.post("/cart/update-quantity", {
            productId: productId,
            quantity: currentQty,
            size: size,
        });

        if (response.data.success) {
            const pricePerUnit = parseFloat(qtyInput.dataset.pricePerUnit);
            const totalCell = qtyInput.closest("tr").querySelector(".total-price");
            totalCell.textContent = "₹" + (currentQty * pricePerUnit).toFixed(2);
            updateCartTotal();
        } else {
            showToast(response.data.message, "error");
            // Revert UI
            qtyInput.value = currentQty - (action === "increase" ? 1 : -1);
        }
    } catch (error) {
        showToast("Requested quantity exceeds available stock !", "error");
        qtyInput.value = currentQty - (action === "increase" ? 1 : -1);
    }
};

function updateCartTotal() {
    let totalAmount = 0;
    document.querySelectorAll(".total-price").forEach((totalCell) => {
        const totalPrice = parseFloat(totalCell.textContent.replace("₹", ""));
        totalAmount += totalPrice;
    });

    const totalDisplay = document.getElementById("cartTotalAmount");
    if (totalDisplay) {
        totalDisplay.textContent = "₹" + totalAmount.toFixed(2);
    }
}

function initRemoveHandlers() {
    const removeCartButtons = document.querySelectorAll(".remove-cart-btn");

    removeCartButtons.forEach(button => {
        button.addEventListener("click", async function (event) {
            event.preventDefault();

            const productId = this.getAttribute("data-id");
            const size = this.getAttribute("data-size");

            const confirmed = await confirmAlert({
                title: "Remove Item?",
                text: "Do you want to remove this item from your cart?",
                icon: "warning",
                confirmText: "Yes, remove it"
            });

            if (!confirmed) return;

            try {
                const response = await axios.delete(`/cart/remove/${productId}?size=${size}`);
                if (response.data.success) {
                    const tableRow = this.closest("tr");
                    if (tableRow) tableRow.remove();
                    showToast(response.data.message, "success");
                    updateCartTotal();
                } else {
                    showToast(response.data.message || "Failed to remove item", "error");
                }
            } catch (error) {
                showToast("Server error during removal", "error");
            }
        });
    });
}

window.updateSize = async function (productId) {
    const selectedSize = document.getElementById(`size-${productId}`).value;

    if (!selectedSize) return;

    try {
        const response = await axios.post(`/cart/updateSize/${productId}`, {
            size: selectedSize,
        });

        if (response.data.success) {
            showToast("Size updated successfully!", "success");
            setTimeout(() => window.location.reload(), 1000);
        } else {
            showToast("Failed to update size!", "error");
        }
    } catch (error) {
        showToast("Error updating size!", "error");
    }
};
