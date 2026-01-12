import { confirmAlert } from "/utils/confirmAlert.js";
import { showToast } from "/utils/toast.js";

window.editOffer = function (id, title, description, discount, categoryId, isActive, startDate, expireDate) {
    document.getElementById('catOffId').value = id;
    document.getElementById('editOfferTitle').value = title;

    document.getElementById('editOfferDiscount').value = discount;
    document.getElementById('editOfferCategory').value = categoryId;

    const isActiveBool = (isActive === true || isActive === 'true');
    const trueRadio = document.getElementById('isActiveTrue');
    const falseRadio = document.getElementById('isActiveFalse');

    if (trueRadio) trueRadio.checked = isActiveBool;
    if (falseRadio) falseRadio.checked = !isActiveBool;
};

window.clearAddForm = function () {
    const form = document.getElementById('addOfferForm');
    if (form) form.reset();
};

window.filterOffers = function () {
    const category = document.getElementById('categoryFilter').value;
    const isActive = document.getElementById('isActiveFilter').value;
    window.location.href = `/admin/offers?category=${category}&isActive=${isActive}`;
};

window.editOfferHandler = async function (event) {
    event.preventDefault();
    const id = document.getElementById('catOffId').value;
    const title = document.getElementById('editOfferTitle').value;
    const discount = document.getElementById('editOfferDiscount').value;
    const category = document.getElementById('editOfferCategory').value;

    const radio = document.querySelector('input[name="isActiveEdit"]:checked');
    const isActive = radio ? (radio.value === 'true') : false;

    try {
        const response = await axios.put(`/admin/offers/edit/${id}`, {
            title,
            discount,
            categoryId: category,
            isActive
        });

        if (response.data.success) {
            showToast("Offer updated successfully", "success");
            setTimeout(() => location.reload(), 1000);
        } else {
            showToast(response.data.message || "Update failed", "error");
        }
    } catch (error) {
        console.error(error);
        showToast("Failed to update offer", "error");
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const addForm = document.getElementById('addOfferForm');
    if (addForm) {
        addForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const title = document.getElementById('addOfferTitle').value;
            const description = document.getElementById('addOfferDescription').value;
            const discount = document.getElementById('addOfferDiscount').value;
            const categoryId = document.getElementById('addOfferCategory').value;
            const startDate = document.getElementById('addOfferStartDate').value;
            const endDate = document.getElementById('addOfferEndDate').value;
            const isActiveCheck = document.getElementById('addOfferIsActive');
            const isActive = isActiveCheck ? isActiveCheck.checked : true;

            try {
                const response = await axios.post('/admin/offers/add', {
                    title, description, discount, categoryId, startDate, endDate, isActive
                });

                if (response.data.success) {
                    showToast("Offer added successfully", "success");
                    setTimeout(() => location.reload(), 1000);
                } else {
                    showToast(response.data.message || "Error adding offer", "error");
                }
            } catch (error) {
                console.error(error);
                showToast("Error submitting form", "error");
            }
        });
    }
});
