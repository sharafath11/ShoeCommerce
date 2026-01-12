import { confirmAlert } from "/utils/confirmAlert.js";
import { showToast } from "/utils/toast.js";

let croppers = [];
let croppedImages = [];

document.addEventListener('DOMContentLoaded', () => {
    initSizeStockManager();
    initImageUploader();
    initEditForm();
});

function initSizeStockManager() {
    const container = document.getElementById("sizeContainer");
    const addBtn = document.getElementById("addSizeStock");
    if (!container || !addBtn) return;

    addBtn.addEventListener("click", () => {
        const row = document.createElement("div");
        row.className = "d-flex align-items-center gap-2 mb-2 p-2 bg-light rounded-3 size-stock-row";
        row.innerHTML = `
            <input type="text" name="size" class="form-control" placeholder="Size" required style="width: 100px;">
            <input type="number" name="stock" class="form-control" placeholder="Stock" required style="width: 100px;">
            <button type="button" class="btn btn-link text-danger remove-size-stock p-0 ms-auto">
                <i class="bi bi-trash"></i>
            </button>
        `;
        container.appendChild(row);
    });

    container.addEventListener("click", (e) => {
        if (e.target.closest(".remove-size-stock")) {
            e.target.closest(".remove-size-stock").closest(".size-stock-row").remove();
        }
    });
}

function initImageUploader() {
    const imageInput = document.getElementById("imageUpload");
    const previewContainer = document.getElementById("imagePreviewContainer");
    if (!imageInput || !previewContainer) return;

    imageInput.addEventListener("change", function (event) {
        const files = event.target.files;
        if (files.length === 0) return;

        if (files.length !== 3) {
            showToast("Please select exactly 3 images for full replacement.", "warning");
            return;
        }

        previewContainer.innerHTML = "";
        croppers = [];
        croppedImages = [];

        Array.from(files).forEach((file, i) => {
            const reader = new FileReader();
            reader.onload = function (e) {
                const itemDiv = document.createElement("div");
                itemDiv.className = "col-md-4 mb-3";
                itemDiv.innerHTML = `
                    <div class="image-item shadow-sm">
                        <img id="imagePreview_${i}" src="${e.target.result}" class="image-preview">
                    </div>
                `;
                previewContainer.appendChild(itemDiv);

                const img = document.getElementById(`imagePreview_${i}`);
                const cropper = new Cropper(img, {
                    aspectRatio: 1,
                    viewMode: 1,
                    autoCropArea: 1,
                });
                croppers[i] = cropper;
            };
            reader.readAsDataURL(file);
        });
    });
}

async function initEditForm() {
    const form = document.getElementById("edit-product-form");
    if (!form) return;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const formData = new FormData();
        const id = document.getElementById("id").value;
        const name = document.getElementById("name").value.trim();
        const brand = document.getElementById("brand").value.trim();
        const color = document.getElementById("color").value.trim();
        const description = document.getElementById("description").value.trim();
        const price = document.getElementById("price").value.trim();
        const originalPrice = document.getElementById("originalPrice").value.trim();
        const category = document.getElementById("category").value;

        if (parseFloat(price) > parseFloat(originalPrice)) {
            showToast("Listing price cannot exceed original price.", "error");
            return;
        }

        const sizeStockData = [];
        const rows = document.querySelectorAll(".size-stock-row");
        rows.forEach(row => {
            const size = row.querySelector('input[name="size"]').value.trim();
            const stock = row.querySelector('input[name="stock"]').value.trim();
            if (size && stock) sizeStockData.push({ size, stock });
        });

        if (sizeStockData.length === 0) {
            showToast("Add at least one size.", "error");
            return;
        }

        formData.append("id", id);
        formData.append("name", name);
        formData.append("brand", brand);
        formData.append("color", color);
        formData.append("description", description);
        formData.append("price", price);
        formData.append("originalPrice", originalPrice);
        formData.append("category", category);
        formData.append("sizes", JSON.stringify(sizeStockData));

        croppers.forEach((cropper, index) => {
            const canvas = cropper.getCroppedCanvas({ width: 600, height: 600 });
            const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
            const blob = dataURItoBlob(dataUrl);
            formData.append(`images`, blob, `product_${index}.jpg`);
        });

        const confirmed = await confirmAlert({
            title: "Update Product",
            text: "Save changes to this product?",
            icon: "question"
        });

        if (!confirmed) return;

        try {
            const res = await axios.post("/admin/products/edit-products", formData);

            if (res.data.ok) {
                showToast("Product updated successfully", "success");
                setTimeout(() => window.location.href = res.data.red, 1500);
            } else {
                showToast(res.data.msg || "Failed to update", "error");
            }
        } catch (error) {
            console.error(error);
            showToast("An error occurred", "error");
        }
    });
}

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
