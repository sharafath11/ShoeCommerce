
import { confirmAlert } from "/utils/confirmAlert.js";
import { showToast } from "/utils/toast.js";
import { isValidPincode, validateField } from "/utils/validation.js";

document.addEventListener("DOMContentLoaded", () => {
});

window.addAddress = async function (event, userId) {
    event.preventDefault();

    const type = document.getElementById("type").value.trim();
    const streetAddress = document.getElementById("streetAddress").value.trim();
    const city = document.getElementById("city").value.trim();
    const state = document.getElementById("state").value.trim();
    const postalCode = document.getElementById("postalCode").value.trim();
    const country = document.getElementById("country").value.trim();
    const name = document.getElementById("name").value.trim();

    const validations = [
        { value: name, name: "Name", minLength: 1 },
        { value: type, name: "Type", minLength: 3 },
        { value: streetAddress, name: "Street address", minLength: 5 },
        { value: city, name: "City", minLength: 1, alphaOnly: true },
        { value: state, name: "State", minLength: 1, alphaOnly: true },
        { value: country, name: "Country", minLength: 1, alphaOnly: true }
    ];

    for (const v of validations) {
        const result = validateField(v);
        if (!result.isValid) {
            showToast(result.message, "warning");
            return;
        }
    }

    if (!isValidPincode(postalCode)) {
        showToast("Invalid postal code", "warning");
        return;
    }

    const formData = {
        name, type, streetAddress, city, state, postalCode, country, userId
    };

    const confirmed = await confirmAlert({
        title: "Add Address",
        text: "Synchronize this record with your profile?",
        icon: "question"
    });

    if (!confirmed) return;

    try {
        const response = await axios.post("/addAddress", formData);
        if (response.data.ok) {
            showToast(response.data.msg, "success");
            setTimeout(() => window.location.reload(), 1000);
        } else {
            showToast(response.data.msg, "error");
        }
    } catch (error) {
        showToast("Critical sync failure", "error");
    }
};

window.removeAddress = async function (addressId) {
    const confirmed = await confirmAlert({
        title: "Revoke Address",
        text: "This record will be permanently purged from our registry.",
        icon: "warning",
        confirmText: "Yes, Purge it"
    });

    if (!confirmed) return;

    try {
        const response = await axios.delete(`/removeAddress/${addressId}`);
        if (response.data.ok) {
            showToast(response.data.msg, "success");
            setTimeout(() => window.location.reload(), 1000);
        } else {
            showToast(response.data.msg, "error");
        }
    } catch (error) {
        showToast("Operation failed", "error");
    }
};

window.UpdateAddress = async function (event, addressId, index) {
    event.preventDefault();

    const type = document.getElementById(`type${index}`).value.trim();
    const streetAddress = document.getElementById(`streetAddress${index}`).value.trim();
    const city = document.getElementById(`city${index}`).value.trim();
    const postalCode = document.getElementById(`zip${index}`).value.trim();
    const state = document.getElementById(`state${index}`).value.trim();
    const country = document.getElementById(`country${index}`).value.trim();
    const name = document.getElementById(`name${index}`).value.trim();

    const validations = [
        { value: name, name: "Name", minLength: 1 },
        { value: type, name: "Type", minLength: 3 },
        { value: streetAddress, name: "Street address", minLength: 5 },
        { value: city, name: "City", minLength: 1, alphaOnly: true },
        { value: state, name: "State", minLength: 1, alphaOnly: true },
        { value: country, name: "Country", minLength: 1, alphaOnly: true }
    ];

    for (const v of validations) {
        const result = validateField(v);
        if (!result.isValid) {
            showToast(result.message, "warning");
            return;
        }
    }

    if (!isValidPincode(postalCode)) {
        showToast("Invalid postal code", "warning");
        return;
    }

    const formData = {
        name, type, streetAddress, city, state, postalCode, country, addressId
    };

    const confirmed = await confirmAlert({
        title: "Update Registry",
        text: "Synchronize modifications with the live environment?",
        icon: "info"
    });

    if (!confirmed) return;

    try {
        const response = await axios.post("/updateAddress", formData);
        if (response.data.ok) {
            showToast(response.data.msg, "success");
            setTimeout(() => window.location.reload(), 1000);
        } else {
            showToast(response.data.msg, "error");
        }
    } catch (error) {
        showToast("Critical update error", "error");
    }
};
