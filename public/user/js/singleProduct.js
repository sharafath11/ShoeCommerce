/**
 * Antigravity UI: Product Details
 * Target: /public/user/js/singleProduct.js
 */

import { showToast } from "/utils/toast.js";

document.addEventListener("DOMContentLoaded", () => {
    initZoomEffect();
    initThumbnailClick();
    initReviewForm();
    fetchReviews(1);
});

function initThumbnailClick() {
    document.querySelectorAll(".thumbnail-img").forEach((img) => {
        img.addEventListener("click", function () {
            const mainImage = document.getElementById("main-image");
            const zoomedImage = document.getElementById("zoomed-image");
            mainImage.src = this.src;
            zoomedImage.style.backgroundImage = `url('${this.src}')`;
        });
    });
}

function initZoomEffect() {
    const mainImage = document.getElementById("main-image");
    const zoomedImage = document.getElementById("zoomed-image");
    const focusArea = document.getElementById("focus-area");

    if (!mainImage || !zoomedImage || !focusArea) return;

    mainImage.addEventListener("mousemove", function (e) {
        const rect = mainImage.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        zoomedImage.style.display = "block";
        zoomedImage.style.backgroundImage = `url('${mainImage.src}')`;
        focusArea.style.display = "block";
        focusArea.style.left = `${e.pageX - 50}px`;
        focusArea.style.top = `${e.pageY - 50}px`;

        const zoomFactor = 3;
        zoomedImage.style.backgroundSize = `${mainImage.width * zoomFactor}px ${mainImage.height * zoomFactor}px`;
        zoomedImage.style.backgroundPosition = `-${x * zoomFactor}px -${y * zoomFactor}px`;
    });

    mainImage.addEventListener("mouseleave", function () {
        zoomedImage.style.display = "none";
        focusArea.style.display = "none";
    });
}

window.addToCart = async function (event, productId, selectedSize) {
    if (!selectedSize) {
        showToast("Please select a size :)", "warning");
        return;
    }

    try {
        const response = await axios.post(`/addToCart/${productId}`, { size: selectedSize });
        if (response.data.success) {
            showToast(response.data.message, "success");
            updateCartQuantity();
        } else {
            if (response.data.message) {
                showToast(response.data.message, "error");
            } else {
                window.location.href = "/ShowLoginMsg";
            }
        }
    } catch (error) {
        showToast("Failed to add product to cart", "error");
    }
};

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
                window.location.href = "/ShowLoginMsg";
            }
        }
    } catch (error) {
        showToast("Failed to add to wishlist", "error");
    }
};

function updateCartQuantity() {
    const cartQtyEl = document.getElementById('cart-quantity');
    if (cartQtyEl) {
        let currentCartQty = parseInt(cartQtyEl.innerText) || 0;
        cartQtyEl.innerText = currentCartQty + 1;
    }
}

function addWishlistQty() {
    const wishlistQtyEl = document.getElementById('w-qty');
    if (wishlistQtyEl) {
        let currentWtQty = parseInt(wishlistQtyEl.innerText) || 0;
        wishlistQtyEl.innerText = currentWtQty + 1;
    }
}

function initReviewForm() {
    const reviewForm = document.getElementById("reviewForm");
    if (!reviewForm) return;

    reviewForm.addEventListener("submit", async function (event) {
        event.preventDefault();
        const name = document.getElementById("name").value;
        const rating = document.getElementById("rating").value;
        const review = document.getElementById("review").value;
        const productId = document.getElementById("p-id").value;

        const rCheck = /^[A-Za-z!",.0-9'?\s\p{Emoji}]+$/u;

        if (!rCheck.test(review)) {
            showToast("Review can only contain letters and emojis.", "warning");
            return;
        }

        const formData = new FormData();
        formData.append("productId", productId);
        formData.append("name", name);
        formData.append("rating", rating);
        formData.append("review", review);

        const imageFile = document.getElementById("image").files[0];
        if (imageFile) {
            if (!imageFile.type.startsWith("image/")) {
                showToast("Please select a valid image file.", "error");
                return;
            }
            formData.append("image", imageFile);
        }

        try {
            const confirmed = await Swal.fire({
                title: "Submit Review?",
                text: "Are you sure you want to post this review?",
                icon: "question",
                showCancelButton: true,
                confirmButtonText: "Yes, post it!"
            });

            if (confirmed.isConfirmed) {
                const response = await axios.post("/product/reviews", formData);

                if (response.data.ok) {
                    Swal.fire("Success!", response.data.msg, "success");
                    reviewForm.reset();
                    fetchReviews(1); // Refresh reviews
                } else {
                    Swal.fire("Error", response.data.msg, "error");
                }
            }
        } catch (error) {
            showToast("Error submitting review", "error");
        }
    });
}

let currentReviewPage = 1;

async function fetchReviews(page) {
    const productIdEl = document.getElementById("p-id");
    if (!productIdEl) return;

    const productId = productIdEl.value;
    try {
        const response = await axios.get(`/product/reviews/?page=${page}&pid=${productId}`);
        if (response.data.ok) {
            renderReviews(response.data.reviews);
            updatePagination(response.data.totalPages, page);
        }
    } catch (error) {
        console.error("Error fetching reviews:", error);
    }
}

function renderReviews(reviews) {
    const container = document.getElementById("reviewsContainer");
    if (!container) return;

    container.innerHTML = reviews.map(review => `
        <div class="review-card">
            <p class="reviewer-name">
                ${review.name}<br> 
                <span class="rating">${"★".repeat(review.rating)}</span>
            </p>
            <p>${review.comment}</p>
            ${review.image && review.image.url ? `
                <img class="review-image" src="${review.image.url}" 
                     alt="Review Image" style="max-width: 100px; height:100px; cursor:pointer;">
            ` : ""}
            <p class="review-date">${new Date(review.createdAt).toLocaleDateString()}</p>
        </div>
    `).join('');

    // Modal logic for review images
    document.querySelectorAll(".review-image").forEach(img => {
        img.addEventListener("click", function () {
            const modal = document.getElementById("imageModal");
            const modalImg = document.getElementById("modalImage");
            if (modal && modalImg) {
                modal.style.display = "block";
                modalImg.src = this.src;
            }
        });
    });
}

function updatePagination(totalPages, currentPage) {
    const paginationLinks = document.getElementById("paginationLinks");
    if (!paginationLinks) return;

    paginationLinks.innerHTML = "";
    for (let i = 1; i <= totalPages; i++) {
        const link = document.createElement("a");
        link.href = "#";
        link.className = i === currentPage ? "active" : "";
        link.textContent = i;
        link.onclick = (e) => {
            e.preventDefault();
            fetchReviews(i);
        };
        paginationLinks.appendChild(link);
    }

    const prev = document.getElementById("prevPage");
    const next = document.getElementById("nextPage");
    if (prev) {
        prev.style.display = currentPage > 1 ? "inline" : "none";
        prev.onclick = (e) => { e.preventDefault(); fetchReviews(currentPage - 1); };
    }
    if (next) {
        next.style.display = currentPage < totalPages ? "inline" : "none";
        next.onclick = (e) => { e.preventDefault(); fetchReviews(currentPage + 1); };
    }
}

// Modal closing logic
const closeModal = document.getElementById("closeModal");
if (closeModal) {
    closeModal.onclick = () => document.getElementById("imageModal").style.display = "none";
}
window.onclick = (event) => {
    const modal = document.getElementById("imageModal");
    if (event.target === modal) modal.style.display = "none";
};
