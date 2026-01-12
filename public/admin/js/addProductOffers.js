const searchForm = document.getElementById("searchForm");
const searchInput = document.getElementById("searchInput");
const productList = document.getElementById("productList");
const addOfferModal = new bootstrap.Modal(
    document.getElementById("addOfferModal")
);
const productDetails = document.getElementById("productDetails");
const originalPrice = document.getElementById("originalPrice");
const catDiscount = document.getElementById("catDiscount")
const offerName = document.getElementById("offerName")
const discountedPrice = document.getElementById("discountedPrice");
const startDate = document.getElementById("startDate");
const endDate = document.getElementById("endDate");
const offerDescription = document.getElementById("offerDescription");
const submitOfferBtn = document.getElementById("submitOfferBtn");
let productName;
let products = [];
let selectedProduct = null;

$(".datepicker").datepicker({
    format: "yyyy-mm-dd",
    autoclose: true,
    todayHighlight: true,
});

searchForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const searchQuery = searchInput.value;

    try {
        const response = await axios.post(
            `/admin/add/products/offer/search`,
            { searchQuery }
        );
        products = response.data.products;
        displayProducts(products);
    } catch (err) {
        console.error("Error fetching search results:", err);

    }
});

function displayProducts(productsToShow) {
    productList.innerHTML = "";
    productsToShow.forEach((product) => {
        const li = document.createElement("li");
        li.className =
            "list-group-item d-flex justify-content-between align-items-center";
        li.innerHTML = `
            <span>${product.name} - ₹${product.originalPrice.toFixed(2)}</span>
            <button class="btn btn-primary btn-sm select-product" data-product-id="${product._id
            }">Select</button>
        `;
        productList.appendChild(li);
    });

    document.querySelectorAll(".select-product").forEach((button) => {
        button.addEventListener("click", (e) => {
            const productId = e.target.getAttribute("data-product-id");
            selectedProduct = products.find((p) => p._id === productId);
            showAddOfferModal(selectedProduct);
        });
    });
}

function showAddOfferModal(product) {
    productDetails.value = `${product.name} - ${product.description}`;
    originalPrice.value = product.price.toFixed(2);
    catDiscount.value = product.discountApplied
    discountedPrice.value = "";
    startDate.value = "";
    endDate.value = "";
    offerDescription.value = "";
    productName = product.name
    addOfferModal.show();
}

submitOfferBtn.addEventListener("click", async () => {
    if (!selectedProduct) return;

    const originalPriceValue = parseFloat(originalPrice.value);

    const discounted = Number(discountedPrice.value);
    const startDateValue = startDate.value;
    const endDateValue = endDate.value;
    const offerDescriptionValue = offerDescription.value;
    const categoryDiscount = parseInt(catDiscount.value);
    const name = offerName.value.trim()
    if (new Date(startDateValue) > new Date(endDateValue)) {
        showToast("Starting date must be less than or equal to the ending date.");
        return;
    }

    if (!originalPriceValue || isNaN(originalPriceValue)) {
        showToast("Original price is required.");
        return;
    }
    if (!discounted || isNaN(discounted)) {
        showToast("Discounted price is required.");
        return;
    }
    if (!name || name.length < 8) {
        showToast("offer name needed or offername greater than 7");
        return;
    }
    // if (discounted <= originalPriceValue) {
    //   showToast("Discounted price must be less than the original price.");
    //   return;
    // }
    if (discounted < categoryDiscount) {

        showToast("Discounted price must be greater  than the category discount price ");
        return;
    }
    if (!startDateValue) {
        showToast("Start date is required.");
        return;
    }
    if (!endDateValue) {
        showToast("End date is required.");
        return;
    }
    if (!offerDescriptionValue) {
        showToast("Offer description is required.");
        return;
    }

    const { isConfirmed } = await Swal.fire({
        title: "Confirm Offer Submission",
        text: "Are you sure you want to submit this offer?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, submit it!",
        cancelButtonText: "Cancel",
    });

    if (isConfirmed) {
        const offer = {
            name,
            productName,
            productId: selectedProduct._id,
            originalPrice: originalPriceValue,
            discountValue: discounted,
            startDate: startDateValue,
            endDate: endDateValue,
            offerDescription: offerDescriptionValue,
        };

        try {
            const response = await axios.post(
                "/admin/add/product-offers",
                offer
            );

            showToast(response.data.message)

            addOfferModal.hide();
            discountedPrice.value = "";
            startDate.value = "";
            endDate.value = "";
            offerDescription.value = "";
        } catch (error) {
            console.error("Error submitting offer:", error);
            showToast(
                "An error occurred while submitting the offer. Please try again."
            );
        }
    }
});

function showToast(message) {
    Toastify({
        text: message,
        duration: 2000,
        gravity: "top",
        position: "right",
        style: {
            background: "#333",
        },
        stopOnFocus: true,
    }).showToast();
}
