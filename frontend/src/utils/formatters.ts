import type { ExaminationStatus } from "../types";

export function calculateAge(dateOfBirth: string | null) {
  if (!dateOfBirth) return "";

  const birth = new Date(dateOfBirth);
  const today = new Date();

  let age = today.getFullYear() - birth.getFullYear();

  const monthDiff =
    today.getMonth() - birth.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 &&
      today.getDate() < birth.getDate())
  ) {
    age--;
  }

  return age;
}

export function formatDate(date: string | null) {
  if (!date) return "Neuvedený";

  return new Date(date).toLocaleDateString("sk-SK");
}

export function examinationStatusLabel(
  status: ExaminationStatus
) {
  switch (status) {
    case "PLANNED":
      return "Naplánované";

    case "COMPLETED":
      return "Uskutočnené";

    case "CANCELLED":
      return "Zrušené";

    default:
      return status;
  }
}