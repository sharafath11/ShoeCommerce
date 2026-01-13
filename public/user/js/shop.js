
import { showToast } from "/utils/toast.js";

document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const totalPagesEl = document.getElementById("tala");
    const totalPages = totalPagesEl ? parseInt(totalPagesEl.value) : 1;
    const currentPage = parseInt(urlParams.get('page')) || 1;

    createPagination(totalPages, currentPage);
});

window.addToWishList = async function (productId) {
    try {
        const response = await axios.post(`/whislistAdd/${productId}`);
        if (response.data.success) {
            showToast(response.data.message, "success");
            addWishlistQty();
        } else {
            if (response.data.message) {
                showToast(response.data.message, "error");
            } else {
                window.location.href = '/ShowLoginMsg';
            }
        }
    } catch (error) {
        showToast("Please login :)", "info");
    }
};

function addWishlistQty() {
    const qtyEl = document.getElementById('w-qty');
    if (qtyEl) {
        let currentWtQty = parseInt(qtyEl.innerText) || 0;
        qtyEl.innerText = currentWtQty + 1;
    }
}

window.filterHandler = function (page = 1) {
    const urlParams = new URLSearchParams(window.location.search);
    const selectedBrand = document.querySelector('input[name="brand"]:checked')?.value;
    const selectedColor = document.querySelector('input[name="color"]:checked')?.value;
    const selectedSorting = document.getElementById('mySelect').value;
    const searchInput = document.getElementById('search_input').value.trim();

    const filterData = {
        brand: selectedBrand || urlParams.get('brand') || '',
        color: selectedColor || urlParams.get('color') || '',
        sort: selectedSorting || urlParams.get('sort') || '1',
        category: urlParams.get('category') || '',
        search: searchInput || urlParams.get('search') || '',
        page: page,
    };

    Object.keys(filterData).forEach(key => !filterData[key] && delete filterData[key]);

    const queryString = new URLSearchParams(filterData).toString();
    window.location.href = `/shop?${queryString}`;
};

function createPagination(totalPages, currentPage) {
    const paginationContainer = document.getElementById('page-numbers');
    if (!paginationContainer) return;

    paginationContainer.innerHTML = '';

    const prevArrow = document.getElementById('prev-arrow');
    if (prevArrow) {
        prevArrow.style.display = currentPage > 1 ? 'inline-block' : 'none';
        prevArrow.onclick = (e) => { e.preventDefault(); filterHandler(currentPage - 1); };
    }

    const nextArrow = document.getElementById('next-arrow');
    if (nextArrow) {
        nextArrow.style.display = currentPage < totalPages ? 'inline-block' : 'none';
        nextArrow.onclick = (e) => { e.preventDefault(); filterHandler(currentPage + 1); };
    }

    for (let i = 1; i <= totalPages; i++) {
        const pageLink = document.createElement('a');
        pageLink.className = 'page-number' + (i === currentPage ? ' active' : '');
        pageLink.textContent = i;
        pageLink.href = '#';
        pageLink.addEventListener('click', (e) => {
            e.preventDefault();
            filterHandler(i);
        });
        paginationContainer.appendChild(pageLink);
    }
}

window.toggleCategories = function () {
    const list = document.getElementById('categoriesList');
    if (list) list.style.display = list.style.display === 'none' ? 'block' : 'none';
};

window.toggleFilter = function (className) {
    const filter = document.querySelector(`.${className}`);
    if (filter) filter.style.display = filter.style.display === 'none' ? 'block' : 'none';
};
