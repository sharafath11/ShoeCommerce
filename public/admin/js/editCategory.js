/**
 * Antigravity UI: Edit Category
 * Target: /public/admin/js/editCategory.js
 */

import { confirmAlert } from "/utils/confirmAlert.js";
import { showToast } from "/utils/toast.js";

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('editCategoryForm');
    if (!form) return;

    const categoryNameInput = document.getElementById('categoryName');
    const categoryDescriptionInput = document.getElementById('categoryDescription');
    const categoryNameError = document.getElementById('categoryNameError');
    const categoryDescriptionError = document.getElementById('categoryDescriptionError');
    const categoryId = form.dataset.categoryId; // Check if this dataset attr exists in EJS

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        if (categoryNameError) categoryNameError.textContent = '';
        if (categoryDescriptionError) categoryDescriptionError.textContent = '';

        const categoryName = categoryNameInput.value.trim();
        const categoryDescription = categoryDescriptionInput.value.trim();
        let isValid = true;

        if (categoryName.length < 3 || !/^[A-Za-z'\s]+$/.test(categoryName)) {
            if (categoryNameError) categoryNameError.textContent = 'Category name must be at least 3 characters long and contain only letters and spaces.';
            isValid = false;
        }

        if (categoryDescription.length < 5 || /[^A-Za-z0-9'\s.,!?]/.test(categoryDescription)) {
            if (categoryDescriptionError) categoryDescriptionError.textContent = 'Description must be at least 5 characters long and may only contain letters, numbers, and punctuation.';
            isValid = false;
        }

        if (!isValid) return;

        const confirmed = await confirmAlert({
            title: `Update Category?`,
            text: "Are you sure you want to update this category?",
            icon: 'warning',
            confirmButtonText: 'Yes, update it!'
        });

        if (!confirmed) return;

        try {
            // Ensure categoryId comes from EJS or URL
            const targetId = categoryId || window.location.pathname.split('/').pop();

            const response = await axios.post(`/admin/category/edit-category/${targetId}`, {
                name: categoryName,
                description: categoryDescription
            });

            if (response.data.ok) {
                showToast("Category updated successfully!", "success");
                setTimeout(() => window.location.href = response.data.red, 1000);
            } else {
                showToast(response.data.msg || "Update failed", "error");
            }
        } catch (error) {
            console.error(error);
            showToast('Error updating category. Please try again.', "error");
        }
    });
});
