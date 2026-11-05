import Swal, { type SweetAlertOptions } from "sweetalert2";

const baseOptions: SweetAlertOptions = {
  background: "#ffffff",
  color: "#252139",
  confirmButtonColor: "#7c3aed",
  heightAuto: false,
};

export const taskAlerts = {
  success(title: string, text: string) {
    return Swal.fire({ ...baseOptions, icon: "success", iconColor: "#7c3aed", title, text, confirmButtonText: "Got it" });
  },
  error(title: string, text: string) {
    return Swal.fire({ ...baseOptions, icon: "error", title, text, confirmButtonText: "Try again" });
  },
  confirmDelete(taskTitle: string) {
    return Swal.fire({
      ...baseOptions,
      icon: "warning",
      title: "Delete this task?",
      text: `“${taskTitle}” will be permanently removed.`,
      showCancelButton: true,
      confirmButtonText: "Delete task",
      cancelButtonText: "Keep task",
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#64748b",
      reverseButtons: true,
    });
  },
};
