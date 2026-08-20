import type { Client, NewClient } from "../types";

const API_URL = "http://localhost:3000/api";

export async function getClients(): Promise<Client[]> {
  const response = await fetch(
    `${API_URL}/clients`,
    {
      credentials: "include",
    }
  );

  if (!response.ok) {
    throw new Error(
      "Nepodarilo sa načítať klientov."
    );
  }

  return response.json();
}

export async function createClient(
  client: NewClient
): Promise<Client> {
  const response = await fetch(
    `${API_URL}/clients`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        firstName: client.firstName.trim(),
        lastName: client.lastName.trim(),
        dateOfBirth:
          client.dateOfBirth || undefined,
        sex: client.sex,
        email:
          client.email.trim() || undefined,
        phone:
          client.phone.trim() || undefined,
        notes:
          client.notes.trim() || undefined,
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

export async function updateClient(
  id: string,
  client: NewClient
): Promise<Client> {
  const response = await fetch(
    `${API_URL}/clients/${id}`,
    {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        firstName: client.firstName.trim(),
        lastName: client.lastName.trim(),
        dateOfBirth:
          client.dateOfBirth || undefined,
        sex: client.sex,
        email:
          client.email.trim() || undefined,
        phone:
          client.phone.trim() || undefined,
        notes:
          client.notes.trim() || undefined,
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

export async function getQuestionnaires() {
  const response = await fetch(
    `${API_URL}/questionnaires`,
    {
      credentials: "include",
    }
  );

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      errorText || "Nepodarilo sa načítať dotazníky."
    );
  }

  return response.json();
}