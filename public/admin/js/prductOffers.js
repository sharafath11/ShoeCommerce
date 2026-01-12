let offerId
let productId;

function openEditModal(offer) {
    offerId = offer._id
    productId = offer.products
    document.getElementById('editOfferTitle').value = offer.offerName;
    document.getElementById('editOfferDescription').value = offer.description;
    document.getElementById('editOfferDiscount').value = offer.discountPercentage;
    document.getElementById('productName').value = offer.productName
    document.getElementById('isActiveTrue').checked = offer.isActive;
    document.getElementById('isActiveFalse').checked = !offer.isActive;
    document.getElementById('editOfferStartDate').value = new Date(offer.startDate).toISOString().split('T')[0];
    document.getElementById('editOfferEndDate').value = new Date(offer.endDate).toISOString().split('T')[0];

    // Show the modal
    const editOfferModal = new bootstrap.Modal(document.getElementById('editOfferModal'));
    editOfferModal.show();
}

function filterOffers() {
    const search = document.getElementById("productNameFilter").value;
    console.log('====================================');
    console.log(search);
    console.log('====================================');

    window.location.href = `/admin/product-offers?productName=${search}`;
}

// Make functions globally available for inline onclick handlers
window.openEditModal = openEditModal;
window.filterOffers = filterOffers;

document.addEventListener('DOMContentLoaded', () => {

    document.getElementById('editOfferForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        // Get input values
        const offerName = document.getElementById('editOfferTitle').value.trim();
        const description = document.getElementById('editOfferDescription').value.trim();
        const discountPercentage = document.getElementById('editOfferDiscount').value.trim();
        const isActive = document.getElementById('isActiveTrue').checked;
        const startDate = document.getElementById('editOfferStartDate').value;
        const endDate = document.getElementById('editOfferEndDate').value;

        if (!offerName) {
            Swal.fire('Validation Error', 'Offer title is required', 'warning');
            return;
        }

        if (!description) {
            Swal.fire('Validation Error', 'Description is required', 'warning');
            return;
        }

        if (!discountPercentage || isNaN(discountPercentage) || discountPercentage < 0 || discountPercentage > 100) {
            Swal.fire('Validation Error', 'Discount percentage must be between 0 and 100', 'warning');
            return;
        }

        if (!startDate) {
            Swal.fire('Validation Error', 'Start date is required', 'warning');
            return;
        }

        if (!endDate) {
            Swal.fire('Validation Error', 'End date is required', 'warning');
            return;
        }

        if (new Date(startDate) > new Date(endDate)) {
            Swal.fire('Validation Error', 'Start date cannot be after end date', 'warning');
            return;
        }

        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'Do you want to save these changes?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, save it!',
        });

        if (result.isConfirmed) {
            const updatedOffer = {
                offerName,
                description,
                discountPercentage,
                isActive,
                startDate,
                endDate,
                productId,
            };

            try {
                const response = await axios.put(`/admin/product/edit/offers/${offerId}`, updatedOffer);

                if (response.data.ok) {
                    Swal.fire('Saved!', 'Your changes have been saved.', 'success');
                    location.reload();
                } else {
                    Swal.fire('Error!', 'An error occurred while saving.', 'error');
                }
            } catch (error) {
                console.error('Error updating offer:', error);
                Swal.fire('Error!', 'Failed to save changes. Please try again.', 'error');
            }
        }
    });

    // Clean up or remove redundant event listeners if any were found in the original code
});
