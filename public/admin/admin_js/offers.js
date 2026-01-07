/**
 * Admin Offers Logic
 * Handles Modal resets, Validation, and Axios requests
 */

document.addEventListener("DOMContentLoaded", () => {
    const addOfferForm = document.getElementById("addOfferForm");
    const editOfferForm = document.getElementById("editOfferForm");

    // --- 1. Form Reset ---
    window.clearAddForm = () => {
        addOfferForm.reset();
    };

    // --- 2. Validation Engine ---
    const validateOfferData = (data) => {
        const { title, description, discount, category, startDate, endDate } = data;

        if (!title.trim()) return showErr("Offer title is required.");
        if (!description.trim()) return showErr("Description is required.");
        if (discount < 1 || discount > 99) return showErr("Discount must be between 1% and 99%.");
        if (!category || category === "All Categories") return showErr("Please select a valid category.");
        if (!startDate || !endDate) return showErr("Both dates are required.");
        
        if (new Date(startDate) > new Date(endDate)) {
            return showErr("Start date cannot be after the expiration date.");
        }
        return true;
    };

    const showErr = (msg) => {
        Swal.fire({ icon: 'error', title: 'Validation Error', text: msg, confirmButtonColor: '#0f172a' });
        return false;
    };

    // --- 3. Add Offer Handler ---
    addOfferForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const offerData = {
            title: document.getElementById("addOfferTitle").value,
            description: document.getElementById("addOfferDescription").value,
            discount: document.getElementById("addOfferDiscount").value,
            category: document.getElementById("addOfferCategory").value,
            startDate: document.getElementById("addOfferStartDate").value,
            endDate: document.getElementById("addOfferEndDate").value,
            isActive: document.getElementById('addOfferIsActive').checked
        };

        if (!validateOfferData(offerData)) return;

        const result = await Swal.fire({
            title: 'Confirm New Offer',
            text: "Are you sure you want to create this offer?",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#0f172a',
            confirmButtonText: 'Yes, Create it'
        });

        if (result.isConfirmed) {
            try {
                const response = await axios.post("/admin/addCoffers", offerData);
                if (response.data.ok) {
                    successToast(response.data.msg);
                    setTimeout(() => window.location.reload(), 1000);
                }
            } catch (err) {
                errorToast(err.response?.data?.msg || "Failed to add offer");
            }
        }
    });

    // --- 4. Edit Modal Populator ---
    window.editOffer = (id, title, description, discount, categoryId, isActive, startDate, expireDate) => {
        document.getElementById("catOffId").value = id;
        document.getElementById("editOfferTitle").value = title;
        document.getElementById("editOfferDescription").value = description;
        document.getElementById("editOfferDiscount").value = discount;
        document.getElementById("editOfferCategory").value = categoryId;
        document.getElementById("editOfferStartDate").value = startDate;
        document.getElementById("editOfferEndDate").value = expireDate;
        
        // Handle radio buttons
        const activeState = String(isActive) === 'true';
        document.getElementById("isActiveTrue").checked = activeState;
        document.getElementById("isActiveFalse").checked = !activeState;
    };

    // --- 5. Edit Offer Handler ---
    window.editOfferHandler = async (e) => {
        e.preventDefault();
        const id = document.getElementById("catOffId").value;
        const editData = {
            id: id,
            title: document.getElementById("editOfferTitle").value,
            description: document.getElementById("editOfferDescription").value,
            discount: document.getElementById("editOfferDiscount").value,
            category: document.getElementById("editOfferCategory").value,
            startDate: document.getElementById("editOfferStartDate").value,
            endDate: document.getElementById("editOfferEndDate").value,
            isActive: document.querySelector('input[name="isActiveEdit"]:checked').value === 'true'
        };

        if (!validateOfferData(editData)) return;

        try {
            const response = await axios.post(`/admin/editCoffers/${id}`, editData);
            if (response.data.ok) {
                successToast(response.data.msg);
                setTimeout(() => window.location.reload(), 1000);
            }
        } catch (err) {
            errorToast("Failed to update offer");
        }
    };

    // --- 6. Filters ---
    window.filterOffers = () => {
        const cat = document.getElementById('categoryFilter').value;
        const status = document.getElementById('isActiveFilter').value;
        const params = new URLSearchParams();
        if (cat) params.append('category', cat);
        if (status) params.append('isActive', status);
        window.location.href = `/admin/offers?${params.toString()}`;
    };

    // --- 7. Utility Toasts ---
    function successToast(msg) {
        Toastify({
            text: msg,
            duration: 3000,
            gravity: "top",
            position: "right",
            style: { background: "linear-gradient(to right, #10b981, #059669)" }
        }).showToast();
    }

    function errorToast(msg) {
        Toastify({
            text: msg,
            duration: 3000,
            gravity: "top",
            position: "right",
            style: { background: "linear-gradient(to right, #ef4444, #dc2626)" }
        }).showToast();
    }
});