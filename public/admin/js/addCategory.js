import { confirmAlert } from "/utils/confirmAlert.js";
import { showToast } from "/utils/toast.js";

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('addCategoryForm');
    const categoryNameInput = document.getElementById('categoryName');
    const categoryDescriptionInput = document.getElementById('categoryDescription');
    const categoryNameError = document.getElementById('categoryNameError');
    const categoryDescriptionError = document.getElementById('categoryDescriptionError');

    if (!form) return;

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const categoryName = categoryNameInput.value.trim();
        const categoryDescription = categoryDescriptionInput.value.trim();

        if (categoryNameError) categoryNameError.textContent = '';
        if (categoryDescriptionError) categoryDescriptionError.textContent = '';

        let isValid = true;

        if (categoryName.length < 3 || !/^[A-Za-z'\s]+$/.test(categoryName)) {
            if (categoryNameError) categoryNameError.textContent = 'Category name must be at least 3 characters long and contain only letters and spaces.';
            isValid = false;
        }

        if (categoryDescription.length < 5 || /[^A-Za-z0-9\s.,'!?]/.test(categoryDescription)) {
            if (categoryDescriptionError) categoryDescriptionError.textContent = 'Description must be at least 5 characters long and may only contain letters, numbers, and punctuation.';
            isValid = false;
        }

        if (!isValid) return;

        const confirmed = await confirmAlert({
            title: "Are you sure?",
            text: "Do you want to add this category?",
            icon: "warning",
            confirmButtonText: "Yes, add it!"
        });

        if (!confirmed) return;

        try {
            const response = await axios.post('/admin/category/add-category', {
                name: categoryName,
                description: categoryDescription
            });

            if (response.data.ok) {
                showToast("Category added successfully!", "success");
                setTimeout(() => window.location.href = response.data.red, 1500);
            } else {
                showToast(response.data.msg || "Error adding category", "error");
            }
        } catch (error) {
            console.error(error);
            showToast('Error adding category. Please try again.', "error");
        }
    });
});
