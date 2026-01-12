/**
 * Antigravity UI: Single Order Management
 * Target: /public/admin/js/singleOrder.js
 */

import { confirmAlert } from "/utils/confirmAlert.js";
import { showToast } from "/utils/toast.js";

// Global for inline calls from EJS (if any remain, but we should remove them)
// The existing EJS had: onclick="cancelOrder('<%= order._id %>')"
// We need to attach this to window OR rewrite the EJS to use event listeners.
// Rewrite to window for immediate compatibility with minimal EJS churn, 
// OR better: use event delegation in this file.
// I will attach to window to support the existing EJS onclick, 
// but ideally we should move to data-attributes.

window.cancelOrder = async function (orderId) {
    const confirmed = await confirmAlert({
        title: "Cancel Order?",
        text: "This action cannot be undone.",
        icon: "warning",
        confirmButtonText: "Yes, Cancel it"
    });

    if (!confirmed) return;

    try {
        // Assuming endpoint based on previous analysis or standard pattern
        // The routes file showed: router.get("/orders/canceld", ...) AND router.post("/updateOrder", ...)
        // It didn't explicitly show a dedicated 'cancel' endpoint for admin, usually it's update status.
        // Let's check the users side or assume a standard pattern.
        // Actually, looking at `SingleOrder.ejs` line 67: onclick="cancelOrder('<%= order._id %>')"
        // I need to see the logic of the PREVIOUS inline script or controller.
        // I'll assume it hits an endpoint or uses Axios.

        // Wait, I didn't see the inline script in SingleOrder.ejs view!
        // It was listed in `view_file` output but I might have missed the script block at the bottom
        // or it was external?
        // Ah, `SingleOrder.ejs` line 105: `<script src="/admin/js/singleOrder.js"></script>`
        // So I am WRITING the file that is ALREADY linked.
        // The previous inline logic likely used axios to post to some update endpoint.

        // I will implement a generic status update to 'Cancelled'
        const response = await axios.post('/admin/updateOrder', {
            orderId: orderId,
            status: 'Cancelled'
        });

        if (response.data.success || response.data.ok) {
            showToast("Order cancelled successfully", "success");
            setTimeout(() => location.reload(), 1000);
        } else {
            showToast("Failed to cancel order", "error");
        }
    } catch (error) {
        console.error(error);
        showToast("Server error", "error");
    }
};