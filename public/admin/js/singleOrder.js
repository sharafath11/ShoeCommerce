import { confirmAlert, showToast } from '/js/utils.js';

window.cancelOrder = async function(orderId) {
    const confirmed = await confirmAlert({
        title: "Cancel Order?",
        text: "This will remove the order from active processing.",
        confirmText: "Yes, cancel it"
    });

    if (confirmed) {
        try {
            const res = await axios.delete(`/admin/removeOrder/${orderId}`);
            if (res.data.ok) {
                showToast(res.data.msg, "success");
                setTimeout(() => window.location.reload(), 1000);
            } else {
                showToast(res.data.msg, "error");
            }
        } catch (err) {
            showToast("Server error", "error");
        }
    }
}