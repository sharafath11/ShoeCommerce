/**
 * Antigravity UI: Coupon Management
 * Target: /public/admin/js/coupen.js
 */

import { confirmAlert } from "/utils/confirmAlert.js";
import { showToast } from "/utils/toast.js";

// Global exposure for EJS onclick (edit modal population)
window.populateEditModal = function (code, discountType, discountValue, startingDate, expiryDate, minimumPrice, isActive, cid, cname) {
    document.getElementById("editcname").value = cname;
    document.getElementById("cid").value = cid;
    document.getElementById('editCouponCode').value = code;
    document.getElementById('editDiscountType').value = discountType;
    document.getElementById('editDiscountValue').value = discountValue;
    document.getElementById('editMinimumPrice').value = minimumPrice;
    document.getElementById('editStartingDate').value = startingDate;
    document.getElementById('editExpiryDate').value = expiryDate;
    document.getElementById('editIsActive').value = isActive.toString();
};

document.addEventListener('DOMContentLoaded', () => {
    initEditForm();
    initAddForm();
});

function initEditForm() {
    const editForm = document.getElementById('editForm');
    if (!editForm) return;

    editForm.addEventListener('submit', async function (event) {
        event.preventDefault();

        // Values
        const cid = document.getElementById("cid").value;
        const couponCode = document.getElementById('editCouponCode').value;
        const cname = document.getElementById('editcname').value;
        const discountType = document.getElementById('editDiscountType').value;
        const discountValue = document.getElementById('editDiscountValue').value;
        const minimumPrice = document.getElementById('editMinimumPrice').value;
        const startingDate = document.getElementById('editStartingDate').value;
        const endingDate = document.getElementById('editExpiryDate').value;
        const isActive = document.getElementById('editIsActive').value === 'true';

        if (new Date(startingDate) >= new Date(endingDate)) {
            showToast("Expiry Date must be after Starting Date!", "error");
            return;
        }

        const data = {
            _id: cid,
            name: cname,
            code: couponCode,
            discountType,
            discountValue: Number(discountValue),
            minimumPrice: Number(minimumPrice),
            startingDate: new Date(startingDate),
            endingDate: new Date(endingDate),
            isActive
        };

        const confirmed = await confirmAlert({
            title: 'Update Coupon',
            text: 'Do you want to update this coupon?',
            icon: 'question',
            confirmButtonText: 'Yes, update it!'
        });

        if (!confirmed) return;

        try {
            const response = await axios.put('/admin/coupons/update', data);

            if (response.data.ok) {
                showToast(response.data.msg, "success");
                setTimeout(() => location.reload(), 1000);
            } else {
                showToast(response.data.msg, "error");
            }
        } catch (error) {
            console.error(error);
            showToast("Error updating coupon!", "error");
        }
    });
}

function initAddForm() {
    const addForm = document.getElementById('couponForm');
    if (!addForm) return;

    addForm.addEventListener('submit', async function (event) {
        event.preventDefault();

        const couponCode = document.getElementById('couponCode').value.trim();
        const cname = document.getElementById("cname").value;
        const discountType = document.getElementById('discountType').value.trim();
        const discountValue = document.getElementById('discountValue').value;
        const minimumPrice = document.getElementById('minimumPrice').value;
        const startingDate = document.getElementById('startingDate').value;
        const endingDate = document.getElementById('endingDate').value;

        if (!cname) {
            showToast('Coupon name is required', "error");
            return;
        }
        if (!couponCode || couponCode.length < 8) {
            showToast('Coupon Code must be at least 8 characters long', "error");
            return;
        }
        if (!discountType || !discountValue || discountValue <= 0 || !minimumPrice || minimumPrice <= 0 || !startingDate || !endingDate) {
            showToast('All fields are required and values must be valid', "error");
            return;
        }

        const currentDate = new Date().toISOString().split('T')[0];
        if (startingDate < currentDate || endingDate <= startingDate) {
            showToast('Invalid date range', "error");
            return;
        }

        const confirmed = await confirmAlert({
            title: 'Add Coupon',
            text: 'Do you want to add this coupon?',
            icon: 'question',
            confirmButtonText: 'Yes, add it!'
        });

        if (!confirmed) return;

        try {
            const response = await axios.post('/admin/coupons/addCoupen', {
                code: couponCode,
                name: cname,
                discountType,
                discountValue,
                minimumPrice,
                startingDate,
                endingDate
            });

            if (response.data.ok) {
                showToast(response.data.msg, "success");
                setTimeout(() => window.location.reload(), 1000);
            } else {
                showToast(response.data.msg, "error");
            }
        } catch (err) {
            showToast('Failed to add coupon. Try again.', "error");
        }
    });
}
