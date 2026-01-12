/**
 * Antigravity UI: Reviews Management
 * Target: /public/admin/js/reviews.js
 */

import { confirmAlert } from "/utils/confirmAlert.js";
import { showToast } from "/utils/toast.js";

// Global for inline onclick in reviews.ejs
// <button onclick="changeReviewStatus('<%= review._id %>', boolean)">
window.changeReviewStatus = async function (reviewId, shouldBlock) {
    const action = shouldBlock ? "Reject" : "Approve";

    const confirmed = await confirmAlert({
        title: `${action} Review?`,
        text: `Are you sure you want to ${action.toLowerCase()} this review?`,
        icon: "warning",
        confirmButtonText: "Yes",
        cancelButtonText: "No"
    });

    if (!confirmed) return;

    try {
        const response = await axios.patch(`/admin/reviews/${reviewId}`, {
            isBlocked: shouldBlock,
        });

        if (response.data.ok) {
            showToast(`Review ${action.toLowerCase()}ed successfully`, "success");
            setTimeout(() => location.reload(), 1000);
        } else {
            showToast(response.data.msg || "Action failed", "error");
        }
    } catch (error) {
        console.error(error);
        showToast("Server error", "error");
    }
};

window.showToast = showToast; // Legacy support if needed, but redundant with direct import use above.
