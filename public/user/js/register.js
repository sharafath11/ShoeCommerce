
import { showToast } from "/utils/toast.js";
import { isValidEmail, validatePassword } from "/utils/validation.js";

let timerInterval;

document.addEventListener("DOMContentLoaded", () => {
    initOtpHandler();
    initRegisterForm();
    loadPersistedData();
    checkExistingTimer();
});

window.togglePasswordVisibility = function () {
    const passwordField = document.getElementById("password");
    const confirmPasswordField = document.getElementById("confirmPassword");
    const type = passwordField.type === "password" ? "text" : "password";
    passwordField.type = type;
    confirmPasswordField.type = type;
};

function initOtpHandler() {
    const getOtpBtn = document.getElementById("getOtpBtn");
    if (!getOtpBtn) return;

    getOtpBtn.addEventListener("click", async (event) => {
        event.preventDefault();
        const email = document.getElementById("email").value;
        const emailErrorMessage = document.getElementById("email-error-message");

        if (!isValidEmail(email)) {
            emailErrorMessage.style.display = "block";
            return;
        }
        emailErrorMessage.style.display = "none";

        try {
            const res = await axios.post("/send-otp", { email });
            if (res.data.success) {
                document.getElementById("otpField").style.display = "block";
                document.getElementById("otpTimer").style.display = "block";

                const duration = 60;
                startTimer(duration);
                persisteData();
                getOtpBtn.disabled = true;
                showToast(res.data.msg || "OTP sent successfully", "success");
            } else {
                showToast("Failed to send OTP", "error");
            }
        } catch (error) {
            showToast("Server error during OTP request", "error");
        }
    });
}

function initRegisterForm() {
    const registerForm = document.getElementById("registerForm");
    if (!registerForm) return;

    registerForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const username = document.getElementById("username").value.trim();
        const email = document.getElementById("email").value.trim();
        const otp = document.getElementById("otp").value.trim();
        const password = document.getElementById("password").value;
        const confirmPassword = document.getElementById("confirmPassword").value;

        const passwordResult = validatePassword(password);
        if (!passwordResult.isValid) {
            showToast(passwordResult.message, "warning");
            return;
        }

        if (otp === "") {
            showToast("Please enter the OTP", "warning");
            return;
        }

        if (password !== confirmPassword) {
            showToast("Passwords do not match", "warning");
            return;
        }

        if (!username || !/^[A-Za-z'0-9\s]+$/.test(username)) {
            showToast("Username contains invalid characters", "warning");
            return;
        }

        try {
            const res = await axios.post("/register", { username, email, otp, password });
            if (res.data.success) {
                clearPersistedData();
                showToast(res.data.msg, "success");
                setTimeout(() => {
                    window.location.href = res.data.redirect;
                }, 1000);
            } else {
                showToast(res.data.msg, "error");
            }
        } catch (error) {
            showToast("Registration failed", "error");
        }
    });
}

function startTimer(duration) {
    const getOtpBtn = document.getElementById("getOtpBtn");
    clearInterval(timerInterval);

    timerInterval = setInterval(() => {
        let timer = duration--;
        const minutes = String(Math.floor(timer / 60)).padStart(2, "0");
        const seconds = String(timer % 60).padStart(2, "0");

        document.getElementById("timer").textContent = `${minutes}:${seconds}`;

        if (timer < 0) {
            clearInterval(timerInterval);
            document.getElementById("otpField").style.display = "none";
            getOtpBtn.disabled = false;
            Swal.fire({
                icon: 'error',
                title: 'OTP Expired',
                text: 'Please request a new one.',
                confirmButtonText: 'OK'
            });
            localStorage.removeItem("otpStartTime");
            localStorage.removeItem("otpDuration");
        }
    }, 1000);
}

function persisteData() {
    localStorage.setItem("password", document.getElementById("password").value);
    localStorage.setItem("cpassword", document.getElementById("confirmPassword").value);
    localStorage.setItem("username", document.getElementById("username").value);
    localStorage.setItem("email", document.getElementById("email").value);
    localStorage.setItem("otpStartTime", Date.now());
    localStorage.setItem("otpDuration", 60);
}

function loadPersistedData() {
    const fields = ["username", "email", "password", "confirmPassword"];
    const storageKeys = ["username", "email", "password", "cpassword"];

    fields.forEach((id, i) => {
        const val = localStorage.getItem(storageKeys[i]);
        if (val) document.getElementById(id).value = val;
    });
}

function clearPersistedData() {
    localStorage.clear();
}

function checkExistingTimer() {
    const otpStartTime = localStorage.getItem("otpStartTime");
    const otpDuration = localStorage.getItem("otpDuration");

    if (otpStartTime && otpDuration) {
        const elapsed = Math.floor((Date.now() - otpStartTime) / 1000);
        const remainingTime = otpDuration - elapsed;

        if (remainingTime > 0) {
            startTimer(remainingTime);
            document.getElementById("getOtpBtn").disabled = true;
            document.getElementById("otpField").style.display = "block";
        } else {
            localStorage.removeItem("otpStartTime");
            localStorage.removeItem("otpDuration");
        }
    }
}
