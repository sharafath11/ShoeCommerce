export function showToast(message, type = "default") {
  const colors = {
    success: "#16a34a",
    error: "#dc2626",
    warning: "#d97706",
    default: "#333",
  };

  Toastify({
    text: message,
    duration: 3000,
    gravity: "top",
    position: "right",
    backgroundColor: colors[type] || colors.default,
    close: true,
  }).showToast();
}
