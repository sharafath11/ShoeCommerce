/**
 * Antigravity UI: Add Product
 * Target: /public/admin/js/addProducts.js
 */

import { confirmAlert } from "/utils/confirmAlert.js";
import { showToast } from "/utils/toast.js";

let croppers = [];
let croppedImages = [];

document.addEventListener('DOMContentLoaded', () => {
    initSizeStockManager();
    initImageUploader();
    initProductForm();
});

/**
 * Manage Dynamic Size/Stock Rows
 */
function initSizeStockManager() {
    const container = document.getElementById("sizeContainer");
    const addBtn = document.getElementById("addSizeStockBtn");

    if (!container || !addBtn) return;

    addBtn.addEventListener("click", () => {
        const row = document.createElement("div");
        row.className = "d-flex align-items-center gap-2 mb-2 p-2 bg-light rounded-3";
        row.innerHTML = `
            <input type="text" name="size" class="form-control" placeholder="Size (e.g. 9)" required style="width: 120px;">
            <input type="number" name="stock" class="form-control" placeholder="Quantity" required style="width: 120px;" min="1">
            <button type="button" class="btn btn-link text-danger remove-size-stock p-0 ms-auto">
                <i class="bi bi-trash"></i>
            </button>
        `;
        container.appendChild(row);
    });

    container.addEventListener("click", (e) => {
        if (e.target.closest(".remove-size-stock")) {
            e.target.closest(".remove-size-stock").parentElement.remove();
        }
    });
}

/**
 * Handle Image Uploads and Cropping
 */
function initImageUploader() {
    const imageInput = document.getElementById("productImages");
    const cropContainer = document.getElementById("imageCropContainer");

    if (!imageInput || !cropContainer) return;

    imageInput.addEventListener("change", function (event) {
        const files = event.target.files;
        cropContainer.innerHTML = "";
        croppers = [];
        croppedImages = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const reader = new FileReader();

            const itemDiv = document.createElement("div");
            itemDiv.className = "crop-item shadow-sm";
            itemDiv.innerHTML = `
                <div class="mb-2" style="height: 300px;">
                    <img id="imagePreview_${i}" style="max-width: 100%; display: block;">
                </div>
                <button type="button" class="btn btn-sm btn-primary w-100 mt-2" id="cropButton_${i}">
                    <i class="bi bi-crop me-1"></i>Confirm Crop
                </button>
            `;
            cropContainer.appendChild(itemDiv);

            reader.onload = function (e) {
                const img = document.getElementById(`imagePreview_${i}`);
                img.src = e.target.result;

                const cropper = new Cropper(img, {
                    aspectRatio: 1,
                    viewMode: 2,
                    guides: true,
                    background: false,
                    autoCropArea: 1,
                    zoomable: true
                });
                croppers[i] = cropper;

                document.getElementById(`cropButton_${i}`).addEventListener("click", function () {
                    const canvas = cropper.getCroppedCanvas({ width: 800, height: 800 });
                    croppedImages[i] = canvas.toDataURL("image/jpeg", 0.9);
                    this.textContent = "✓ Cropped";
                    this.className = "btn btn-sm btn-success w-100 mt-2";
                    showToast(`Image ${i + 1} ready`, "success");
                });
            };
            reader.readAsDataURL(file);
        }
    });
}

/**
 * Handle Form Submission
 */
function initProductForm() {
    const form = document.getElementById("addProductForm");
    if (!form) return;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const formData = new FormData();

        // Basic fields
        const fields = ['name', 'brand', 'color', 'description', 'price', 'originalPrice', 'category'];
        fields.forEach(f => {
            const val = form.querySelector(`[name="${f}"]`).value.trim();
            formData.append(f, val);
        });

        // Size & Stock
        const sizeStockData = [];
        const rows = document.querySelectorAll("#sizeContainer > div");
        rows.forEach(row => {
            const size = row.querySelector('input[name="size"]').value.trim();
            const stock = row.querySelector('input[name="stock"]').value.trim();
            if (size && stock) sizeStockData.push({ size, stock });
        });

        if (sizeStockData.length === 0) {
            showToast("At least one size/stock entry is required", "error");
            return;
        }
        formData.append("availableSize", JSON.stringify(sizeStockData));

        // Images
        const validImages = croppedImages.filter(img => img);
        if (validImages.length < 3) {
            showToast("Please crop at least 3 images", "error");
            return;
        }

        validImages.forEach((imgBase64, index) => {
            const blob = dataURItoBlob(imgBase64);
            formData.append(`images`, blob, `product_${index}.jpg`);
        });

        const confirmed = await confirmAlert({
            title: "Add Product",
            text: "Are you sure you want to save this product?",
            icon: "question"
        });

        if (!confirmed) return;

        try {
            const response = await axios.post("/admin/products/add-products", formData);

            if (response.data.ok) {
                showToast("Product added successfully", "success");
                setTimeout(() => window.location.href = response.data.red, 1500);
            } else {
                showToast(response.data.msg || "Server error", "error");
            }
        } catch (error) {
            console.error('Error:', error);
            showToast("Failed to connect to server", "error");
        }
    });
}

/**
 * Utility: Convert Data URI to Blob
 */
function dataURItoBlob(dataURI) {
    const byteString = atob(dataURI.split(",")[1]);
    const mimeString = dataURI.split(",")[0].split(":")[1].split(";")[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
}
