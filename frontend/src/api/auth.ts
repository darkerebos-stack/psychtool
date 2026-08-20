import type { User } from "../types";

const API_URL = "http://localhost:3000/api";

export async function checkSession(): Promise<User | null> {
  try {
    const response = await fetch(
      `${API_URL}/auth/me`,
      {
        credentials: "include",
      }
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    return data.user;
  } catch (error) {
    console.error(
      "Nepodarilo sa overiť prihlásenie:",
      error
    );

    return null;
  }
}

export async function login(
  email: string,
  password: string
): Promise<User> {
  const response = await fetch(
    `${API_URL}/auth/login`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error ||
        "Prihlásenie sa nepodarilo."
    );
  }

  return data.user;
}

export async function logout() {
  await fetch(
    `${API_URL}/auth/logout`,
    {
      method: "POST",
      credentials: "include",
    }
  );
}