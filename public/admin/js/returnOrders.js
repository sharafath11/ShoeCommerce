function acceptHandler(username, itemName, reason, price, orderId, size, qty, productId) {
    Swal.fire({
        title: 'Are you sure?',
        text: `You are about to accept the return of ${itemName} for ${username}.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, accept it!',
        cancelButtonText: 'Cancel'
    }).then((result) => {
        if (result.isConfirmed) {
            axios.post('/admin/accept-return', {
                username: username,
                itemName: itemName,
                reason: reason,
                price: price,
                orderId: orderId,
                size,
                qty,
                productId
            })
                .then(response => {
                    Toastify({
                        text: "Return accepted successfully!",
                        duration: 3000,
                        close: true,
                        gravity: "top",
                        position: 'right',
                        backgroundColor: "green",
                    }).showToast();

                    setTimeout(() => {
                        window.location.reload();
                    }, 1000);
                })
                .catch(error => {
                    Toastify({
                        text: "Error accepting return. Please try again.",
                        duration: 3000,
                        close: true,
                        gravity: "top",
                        position: 'right',
                        backgroundColor: "red",
                    }).showToast();
                    console.error("Error accepting return:", error);
                });
        }
    });
}

function rejectHandler(itemName, username, orderId, size, qty, productId) {
    Swal.fire({
        title: 'Are you sure?',
        text: `You are about to reject the return of ${itemName} for ${username}.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, reject it!',
        cancelButtonText: 'Cancel'
    }).then((result) => {
        if (result.isConfirmed) {
            axios.post('/admin/reject-return', {
                username: username,
                itemName: itemName,
                orderId: orderId,
                size,
                qty,
                productId
            })
                .then(response => {
                    Toastify({
                        text: "Return rejected successfully!",
                        duration: 3000,
                        close: true,
                        gravity: "top",
                        position: 'right',
                        backgroundColor: "red",
                    }).showToast();
                    setTimeout(() => {
                        window.location.reload();
                    }, 1000);
                })
                .catch(error => {
                    Toastify({
                        text: "Error rejecting return. Please try again.",
                        duration: 3000,
                        close: true,
                        gravity: "top",
                        position: 'right',
                        backgroundColor: "red",
                    }).showToast();
                    console.error("Error rejecting return:", error);
                });
        }
    });
}

function resetFilter() {
    window.location.href = "/admin/orders/return"
}

// Global exposure
window.acceptHandler = acceptHandler;
window.rejectHandler = rejectHandler;
window.resetFilter = resetFilter;

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('filter-btn').addEventListener('click', function () {
        const dateRange = document.getElementById('date-filter').value;
        const status = document.getElementById('status-filter').value;
        const priceSort = document.getElementById('price-sort').value;
        const url = `/admin/orders/return?dateRange=${encodeURIComponent(dateRange)}&status=${encodeURIComponent(status)}&priceSort=${encodeURIComponent(priceSort)}`;
        window.location.href = url;
    });

    document.getElementById('search-order-btn').addEventListener('click', function () {
        const orderId = document.getElementById('order-id-filter').value;

        if (!orderId) {
            Toastify({
                text: "Please enter an Order ID to search.",
                duration: 3000,
                close: true,
                gravity: "top",
                position: 'right',
                backgroundColor: "red",
            }).showToast();
            return;
        }
        window.location.href = `/admin/orders/return?orderId=${orderId}`
    });
});
