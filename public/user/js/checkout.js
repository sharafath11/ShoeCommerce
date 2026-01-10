/**
 * Antigravity UI: Checkout
 * Target: /public/user/js/checkout.js
 */

import { confirmAlert } from "/utils/confirmAlert.js";
import { showToast } from "/utils/toast.js";
import { isValidPincode, validateField } from "/utils/validation.js";

let coupenId = null;
let tempTotal = 0;

document.addEventListener("DOMContentLoaded", () => {
    // Initialization if needed
});

window.checkoutHandler = async function (e) {
    const selectedCheckboxes = document.querySelectorAll('input[name="selectedAddresses"]:checked');
    const totalAmountSpan = document.getElementById("totalAmount");
    const totalAmount = totalAmountSpan.innerText;
    const orderTotal = parseFloat(totalAmount.replace(/[₹,]/g, '').trim());

    const addAddress = Array.from(selectedCheckboxes).map(checkbox => {
        const index = checkbox.value;
        return {
            type: document.getElementById(`type${index}`).value,
            streetAddress: document.getElementById(`streetAddress${index}`).value,
            city: document.getElementById(`city${index}`).value,
            state: document.getElementById(`state${index}`).value,
            zip: document.getElementById(`zip${index}`).value,
            country: document.getElementById(`country${index}`).value,
        };
    });

    if (addAddress.length === 0) {
        showToast("Please select an address", "warning");
        return;
    }

    const orderItems = gatherOrderData();
    if (orderItems.length === 0) {
        showToast("Please add some products in Cart", "warning");
        return;
    }

    if (orderTotal > 2500) {
        showToast("Cash on Delivery is only available for orders under ₹2500", "warning");
        return;
    }

    const datas = {
        selectedAddresses: addAddress,
        cartItems: orderItems,
        coupenId: coupenId || "",
        paymentMethod: "COD",
    };

    const confirmed = await confirmAlert({
        title: "Confirm Order",
        text: "Place your order using Cash on Delivery?",
        icon: "question"
    });

    if (!confirmed) return;

    try {
        const response = await axios.post("/checkout/cod", datas);
        if (response.data.ok) {
            showToast(response.data.msg, "success");
            setTimeout(() => {
                window.location.href = response.data.red;
            }, 1000);
        } else {
            showToast(response.data.msg, "error");
        }
    } catch (error) {
        showToast("Checkout failed. Please try again.", "error");
    }
};

window.addAddress = async function (event, userId) {
    event.preventDefault();
    const type = document.getElementById("type").value.trim();
    const streetAddress = document.getElementById("streetAddress").value.trim();
    const city = document.getElementById("city").value.trim();
    const state = document.getElementById("state").value.trim();
    const postalCode = document.getElementById("postalCode").value.trim();
    const country = document.getElementById("country").value.trim();
    const name = document.getElementById("name").value.trim();

    const validations = [
        { value: name, name: "Name", minLength: 1 },
        { value: type, name: "Type", minLength: 3 },
        { value: streetAddress, name: "Street address", minLength: 5 },
        { value: city, name: "City", minLength: 1, alphaOnly: true },
        { value: state, name: "State", minLength: 1, alphaOnly: true },
        { value: country, name: "Country", minLength: 1, alphaOnly: true }
    ];

    for (const v of validations) {
        const result = validateField(v);
        if (!result.isValid) {
            showToast(result.message, "warning");
            return;
        }
    }

    if (!isValidPincode(postalCode)) {
        showToast("Invalid postal code", "warning");
        return;
    }

    const formData = {
        name, type, streetAddress, city, state, postalCode, country, userId
    };

    const confirmed = await confirmAlert({
        title: "Add Address",
        text: "Save this address for checkout?",
        icon: "info"
    });

    if (!confirmed) return;

    try {
        const response = await axios.post("/addAddress", formData);
        if (response.data.ok) {
            showToast(response.data.msg, "success");
            setTimeout(() => window.location.reload(), 1000);
        } else {
            showToast(response.data.msg, "error");
        }
    } catch (error) {
        showToast("Error adding address", "error");
    }
};

window.applyCouponCode = async function () {
    const couponCode = document.getElementById("couponCode").value.trim();
    const messageDiv = document.getElementById("couponMessage");
    const totalAmountSpan = document.getElementById("totalAmount");
    const orderTotal = parseFloat(totalAmountSpan.innerText.replace(/[₹,]/g, '').trim());

    if (!tempTotal) tempTotal = orderTotal;

    if (!couponCode) {
        messageDiv.innerText = "Please enter a coupon code.";
        return;
    }

    try {
        const response = await axios.post("/coupons/apply", {
            code: couponCode,
            orderTotal: orderTotal,
        });

        const result = response.data;
        if (result.ok) {
            messageDiv.innerText = `Coupon applied! Discount: ${result.discountValue}%`;
            totalAmountSpan.innerText = `₹${parseInt(result.newTotal)}`;
            document.getElementById("discount").innerText = `${result.discountValue}%`;
            document.getElementById("coupen-btn").disabled = true;
            coupenId = result.coupon._id;
            showToast(result.msg, "success");
        } else {
            showToast(result.msg, "error");
        }
    } catch (error) {
        const msg = error.response?.data?.message || "Failed to apply coupon.";
        messageDiv.innerText = msg;
        showToast(msg, "error");
    }
};

window.proceedToPayment = async function () {
    const selectedCheckboxes = document.querySelectorAll('input[name="selectedAddresses"]:checked');
    const addAddress = Array.from(selectedCheckboxes).map(checkbox => {
        const index = checkbox.value;
        return {
            type: document.getElementById(`type${index}`).value,
            streetAddress: document.getElementById(`streetAddress${index}`).value,
            city: document.getElementById(`city${index}`).value,
            state: document.getElementById(`state${index}`).value,
            zip: document.getElementById(`zip${index}`).value,
            country: document.getElementById(`country${index}`).value,
        };
    });

    if (addAddress.length === 0) {
        showToast("Please select an address", "warning");
        return;
    }

    if (addAddress.some(addr => !isValidPincode(addr.zip))) {
        showToast("Please enter a valid 6-digit pincode", "warning");
        return;
    }

    const orderItems = gatherOrderData();
    if (orderItems.length === 0) {
        showToast("Please add some products to your cart", "warning");
        return;
    }

    const orderTotal = parseFloat(document.getElementById("totalAmount").innerText.replace(/[₹,]/g, '').trim());

    const confirmed = await confirmAlert({
        title: "Online Payment",
        text: `Proceed to pay ₹${orderTotal}?`,
        icon: "info",
        confirmText: "Yes, Pay Now!"
    });

    if (!confirmed) return;

    try {
        const res = await axios.post('/payment/create-order', {
            amount: orderTotal,
            currency: "INR",
            receipt: "receipt#1",
            selectedAddresses: addAddress,
            cartItems: orderItems,
            coupenId: coupenId
        });

        const { orderId, amount, currency, order } = res.data;

        const options = {
            "key": "rzp_test_0NNl9o6nbS0KBP",
            "amount": amount,
            "currency": currency,
            "name": "ST SHOP",
            "description": "Order Payment",
            "order_id": orderId,
            "handler": async function (responseV) {
                showToast("Payment Authorized", "success");
                try {
                    const vRes = await axios.post('/payment/verify', {
                        _id: order._id,
                        paymentId: responseV.razorpay_payment_id,
                        orderId: responseV.razorpay_order_id,
                        signature: responseV.razorpay_signature
                    });
                    showToast("Verification Successful", "success");
                    setTimeout(() => window.location.href = vRes.data.red, 1000);
                } catch (err) {
                    showToast("Payment verification failed.", "error");
                }
            },
            "modal": {
                "ondismiss": function () {
                    showToast("Payment cancelled", "warning");
                    window.location.reload();
                }
            }
        };

        const rzp1 = new Razorpay(options);
        rzp1.open();
    } catch (err) {
        showToast("Payment initiation failed. Please try again.", "error");
    }
};

window.walletPayHandler = async function () {
    const selectedCheckboxes = document.querySelectorAll('input[name="selectedAddresses"]:checked');
    const addAddress = Array.from(selectedCheckboxes).map(checkbox => {
        const index = checkbox.value;
        return {
            type: document.getElementById(`type${index}`).value,
            streetAddress: document.getElementById(`streetAddress${index}`).value,
            city: document.getElementById(`city${index}`).value,
            state: document.getElementById(`state${index}`).value,
            zip: document.getElementById(`zip${index}`).value,
            country: document.getElementById(`country${index}`).value,
        };
    });

    if (addAddress.length === 0) {
        showToast("Please select an address", "warning");
        return;
    }

    const orderItems = gatherOrderData();
    const orderTotal = parseFloat(document.getElementById("totalAmount").innerText.replace(/[₹,]/g, '').trim());

    const confirmed = await confirmAlert({
        title: "Wallet Payment",
        text: `Pay ₹${orderTotal} using your wallet balance?`,
        icon: "warning",
        confirmText: "Yes, Pay Now!"
    });

    if (!confirmed) return;

    try {
        const orderDetails = {
            amount: orderTotal,
            selectedAddresses: addAddress,
            cartItems: orderItems,
            coupenId: coupenId || ""
        };
        const res = await axios.post("/checkout/wallet/pay", { orderDetails });
        if (res.data.ok) {
            showToast(res.data.msg, "success");
            setTimeout(() => window.location.href = res.data.red, 1000);
        } else {
            showToast(res.data.msg, "error");
        }
    } catch (error) {
        showToast("Error processing wallet payment", "error");
    }
};

window.removeCoupenHandler = function () {
    if (!tempTotal || tempTotal === 0) {
        return showToast("No coupon applied currently", "warning");
    }

    document.getElementById("discount").innerText = "0%";
    document.getElementById("coupen-btn").disabled = false;
    document.getElementById("couponMessage").innerText = "Coupon removed";
    document.getElementById("couponCode").value = "";
    document.getElementById("totalAmount").innerText = `₹${tempTotal}`;
    coupenId = null;
    showToast("Coupon removed", "info");
};

function gatherOrderData() {
    const orderData = [];
    const items = document.querySelectorAll('.list li[id^="product-item-"]');

    items.forEach((item, index) => {
        const productId = document.getElementById(`productId-${index}`).value;
        const sizeElement = document.getElementById(`product-size-${index}`);
        const size = sizeElement ? parseInt(sizeElement.innerText) : NaN;

        if (isNaN(size)) {
            return; // Skip or handle error
        }

        const productName = document.getElementById(`product-name-${index}`).innerText;
        const quantity = parseInt(document.getElementById(`product-quantity-${index}`).innerText, 10);
        const price = parseFloat(document.getElementById(`product-price-${index}`).innerText.replace("₹", ""));

        orderData.push({
            productId,
            name: productName,
            size: size,
            quantity: quantity,
            price: price / quantity, // Calculate unit price if saved as total in UI
            total: price,
        });
    });

    return orderData;
}
