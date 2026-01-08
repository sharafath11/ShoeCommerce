
export async function confirmAlert({
  title = "Confirmation",
  text = "Are you sure?",
  icon = "warning",
  confirmText = "Yes",
  cancelText = "Cancel",
} = {}) {
  const result = await Swal.fire({
    title,
    text,
    icon,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    reverseButtons: true,
  });

  return result.isConfirmed;
}
