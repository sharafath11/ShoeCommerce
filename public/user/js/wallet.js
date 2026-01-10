/**
 * Antigravity UI: User Wallet
 * Target: /public/user/js/wallet.js
 */

import { showToast } from "/utils/toast.js";

document.addEventListener("DOMContentLoaded", () => {
    // Initialization
});

window.addMoneyInWallet = async function () {
    const { value: amount } = await Swal.fire({
        title: "Add Funds",
        text: "Enter the amount you wish to add to your wallet (Min: ₹10):",
        input: "number",
        inputPlaceholder: "Amount",
        inputAttributes: {
            min: 10,
            max: 10000,
        },
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Proceed",
    });

    if (amount && amount >= 10) {
        try {
            const orderResponse = await axios.post("/wallet/create-order", { amount });
            const { orderId, currency } = orderResponse.data;

            const options = {
                key: "rzp_test_0NNl9o6nbS0KBP",
                amount: amount * 100, // Razorpay expects paise
                currency: currency,
                name: "ST SHOPE",
                description: "Add money to wallet",
                order_id: orderId,
                handler: async function (response) {
                    try {
                        const paymentResponse = await axios.post("/wallet/add/money", {
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_signature: response.razorpay_signature,
                            amount,
                        });

                        if (paymentResponse.data.ok) {
                            showToast(paymentResponse.data.msg, "success");
                            setTimeout(() => window.location.reload(), 2000);
                        } else {
                            Swal.fire({
                                icon: "error",
                                title: "Payment Failed",
                                text: paymentResponse.data.msg,
                            });
                        }
                    } catch (error) {
                        showToast("Failed to confirm wallet deposit", "error");
                    }
                },
                theme: {
                    color: "#3399cc",
                },
            };

            const rzp = new Razorpay(options);
            rzp.open();
        } catch (error) {
            showToast("Unable to initiate payment request", "error");
        }
    } else if (amount && amount < 10) {
        showToast("Minimum deposit is ₹10", "warning");
    }
};
