import type {
  Examination,
  NewExamination,
} from "../types";

const API_URL = "http://localhost:3000/api";

export async function getExaminations(
  clientId: string
): Promise<Examination[]> {
  const response = await fetch(
    `${API_URL}/clients/${clientId}/examinations`,
    {
      credentials: "include",
    }
  );

  if (!response.ok) {
    throw new Error(
      "Nepodarilo sa načítať vyšetrenia."
    );
  }

  return response.json();
}

export async function createExamination(
  clientId: string,
  examination: NewExamination
): Promise<Examination> {
  const response = await fetch(
    `${API_URL}/clients/${clientId}/examinations`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        date: examination.date,
        type: examination.type.trim(),
        status: examination.status,
        notes:
          examination.notes.trim() ||
          undefined,
      }),
    }
  );

  if (!response.ok) {
    const errorText =
      await response.text();

    throw new Error(errorText);
  }

  return response.json();
}