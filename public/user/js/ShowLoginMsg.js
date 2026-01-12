window.onload = function () {
    Swal.fire({
        title: "Please log in",
        text: "Would you like to log in to continue or browse without logging in?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Log In",
        cancelButtonText: "Continue Browsing",
    }).then((result) => {
        if (result.isConfirmed) {
            window.location.href = "/login";
        } else {
            window.location.href = "/";
        }
    });
};
