
import { confirmAlert } from "/utils/confirmAlert.js";
import { showToast } from "/utils/toast.js";

document.addEventListener("DOMContentLoaded", () => {
});

window.removeOrder = async function (e, orderId) {
    const confirmed = await confirmAlert({
        title: "Cancel Order?",
        text: "Are you sure you want to cancel this order?",
        icon: "warning",
        confirmText: "Yes, cancel it!"
    });

    if (!confirmed) return;

    try {
        const response = await axios.delete(`/removeOrder/${orderId}`);
        showToast(response.data.msg, response.data.ok ? "success" : "error");
        if (response.data.ok) {
            setTimeout(() => window.location.reload(), 1000);
        }
    } catch (error) {
        showToast("Error removing order", "error");
    }
};

window.deleteOrderItem = async function (orderId, productId, size) {
    const result = await Swal.fire({
        title: 'Remove Item?',
        text: 'Do you want to remove this item from the order?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, remove it!'
    });

    if (!result.isConfirmed) return;

    try {
        const response = await axios.put(`/delete-order-item/${orderId}/${productId}`, { size: size });
        if (!response.data.ok) {
            showToast(response.data.msg, "error");
            return;
        }

        await Swal.fire({
            icon: 'success',
            title: 'Removed!',
            text: 'Item has been removed from your order.',
            confirmButtonText: 'OK'
        });

        showToast(response.data.msg, "success");
        setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
        showToast("Failed to remove item", "error");
    }
};

window.retryPayment = async function (orderId) {
    try {
        const response = await axios.post("/payment/retry-payment", { orderId });
        const { amount, currency, newOderId } = response.data;

        const options = {
            "key": "rzp_test_0NNl9o6nbS0KBP",
            "amount": amount,
            "currency": currency,
            "name": "ST SHOP",
            "description": "Retry Order Payment",
            "order_id": newOderId,
            "handler": async function (responseV) {
                showToast("Payment Authorized", "success");
                try {
                    await axios.post('/payment/retry-veryfy-payment', {
                        id: orderId,
                        orderId: newOderId,
                        paymentId: responseV.razorpay_payment_id,
                        signature: responseV.razorpay_signature
                    });
                    showToast("Payment Verified Successfully", "success");
                    setTimeout(() => window.location.href = '/orders', 1000);
                } catch (err) {
                    showToast("Payment verification failed.", "error");
                }
            },
            "prefill": {
                "name": "Customer",
                "email": "customer@example.com",
                "contact": "9999999999"
            },
            "theme": {
                "color": "#F37254"
            }
        };

        const rzp1 = new Razorpay(options);
        rzp1.open();
    } catch (err) {
        showToast("Failed to initiate retry payment.", "error");
    }
};

window.returnHandler = async function (orderId, productId, size, qty) {
    const { value: reason } = await Swal.fire({
        title: 'Return Item',
        text: 'Please provide a reason for the return:',
        input: 'text',
        inputPlaceholder: 'Reason for return',
        inputValidator: (val) => {
            if (!val) return 'Reason is required!';
            const trimmed = val.trim();
            if (trimmed.length < 8) return 'Reason must be at least 8 characters long!';
        },
        showCancelButton: true,
        confirmButtonText: 'Submit Return',
        cancelButtonText: 'Cancel',
    });

    if (!reason) return;

    try {
        const data = { orderId, productId, size, reason, qty };
        const response = await axios.post('/orders/return', data);

        if (response.data.ok) {
            await Swal.fire({
                icon: 'success',
                title: 'Request Submitted',
                text: response.data.msg,
            });
            setTimeout(() => window.location.reload(), 1000);
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: response.data.msg,
            });
        }
    } catch (error) {
        showToast("Error processing return request", "error");
    }
};
