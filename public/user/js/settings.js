const showPasswordCheckbox = document.getElementById("showPasswordCheckbox")
showPasswordCheckbox.addEventListener("change", function () {
    const passwordInput = document.getElementById("newPassword")
    if (this.checked) {
        passwordInput.type = "text";
    } else {
        passwordInput.type = "password";
    }
});
window.changePasswordHandler = function (e) {

    e.preventDefault();
    const currentPassword = document.getElementById("currentPassword").value.trim();
    const newPassword = document.getElementById("newPassword").value.trim();
    const confirmNewPassword = document.getElementById("confirmNewPassword").value.trim();
    if (newPassword === "" || currentPassword === "" || confirmNewPassword === "") {
        showToast("All fileds are required :)");
        return;
    }
    if (newPassword.length < 8) {
        showToast("Password must be at least 8 characters long");
        return;
    }
    if (newPassword !== confirmNewPassword) {
        showToast("New passwords do not match!");
        return;
    }


    confirmAction("Are you sure?", "Change Password?", "Yes, Change it!").then((result) => {
        if (result.isConfirmed) {
            axios
                .post(`/changepassword`, {
                    currentPassword,
                    newPassword
                })
                .then((response) => {
                    console.log(response.data);

                    if (response.data.ok) {
                        showToast(response.data.msg);
                        window.location.reload();
                    } else {
                        showToast(response.data.msg);
                        return;
                    }
                })
                .catch((error) => {
                    showToast("There was an error changing the password: " + error.message);
                });
        }
    });

}

function confirmAction(title, text, confirmButtonText) {
    return Swal.fire({
        title: title,
        text: text,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: confirmButtonText,
    });
}

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

document.getElementById('changePasswordBtn').addEventListener('click', function () {
    const changePasswordSection = document.getElementById('changePasswordSection');
    changePasswordSection.style.display = changePasswordSection.style.display === 'none' || changePasswordSection.style.display === '' ? 'block' : 'none';
});
