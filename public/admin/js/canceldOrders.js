function searchOrders() {
    const query = document.getElementById('searchOrdersInput').value;
    window.location.href = `/admin/orders/canceld?search=${query}`;
}
