

export function isValidPincode(pincode) {
    const indiaPinPattern = /^\d{6}$/;
    return indiaPinPattern.test(pincode);
}

export function hasNoConsecutiveSpaces(str) {
    return !/\s{2,}/.test(str);
}


export function isAlphaWithSingleSpaces(str) {
    return /^[a-zA-Z\s]+$/.test(str) && hasNoConsecutiveSpaces(str);
}

export function validateField(config) {
    const { value, name, minLength = 1, alphaOnly = false } = config;
    const trimmed = value.trim();

    if (trimmed.length === 0) {
        return { isValid: false, message: `${name} cannot be empty.` };
    }

    if (trimmed.length < minLength) {
        return { isValid: false, message: `${name} must be at least ${minLength} characters long.` };
    }

    if (!hasNoConsecutiveSpaces(value)) {
        return { isValid: false, message: `${name} cannot contain consecutive spaces.` };
    }

    if (alphaOnly && !isAlphaWithSingleSpaces(value)) {
        return { isValid: false, message: `${name} should contain only letters.` };
    }

    return { isValid: true };
}


export function isValidEmail(email) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
}


export function validatePassword(password) {
    if (password.length < 8) {
        return { isValid: false, message: "Password must be at least 8 characters long" };
    }
    if (!/[A-Z]/.test(password)) {
        return { isValid: false, message: "Password must contain at least one uppercase letter" };
    }
    if (!/[a-z]/.test(password)) {
        return { isValid: false, message: "Password must contain at least one lowercase letter" };
    }
    if (!/[0-9]/.test(password)) {
        return { isValid: false, message: "Password must contain at least one number" };
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        return { isValid: false, message: "Password must contain at least one special character" };
    }
    return { isValid: true };
}

export function validateMobileNumber(phoneNumber) {
    const mobileRegex = /^[6-9]\d{9}$/;
    return mobileRegex.test(phoneNumber);
}
