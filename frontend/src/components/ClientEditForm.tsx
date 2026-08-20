import { useState } from "react";
import type { Client, NewClient } from "../types";

type ClientEditFormProps = {
  client: Client;
  onCancel: () => void;
  onSave: (data: NewClient) => Promise<void>;
};

export default function ClientEditForm({
  client,
  onCancel,
  onSave,
}: ClientEditFormProps) {
  const [form, setForm] = useState<NewClient>({
    firstName: client.firstName,
    lastName: client.lastName,
    dateOfBirth: client.dateOfBirth
		? client.dateOfBirth.slice(0, 10)
		: "",
    sex: client.sex,
    email: client.email || "",
    phone: client.phone || "",
    notes: client.notes || "",
  });
 const [saving, setSaving] = useState(false);
  function handleChange(
    field: keyof NewClient,
    value: string
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

async function handleSubmit(
  event: React.FormEvent
) {
  event.preventDefault();

  if (saving) {
    return;
  }

  setSaving(true);

  try {
    await onSave(form);
  } finally {
    setSaving(false);
  }
}

  return (
    <section style={styles.card}>
      <h2 style={styles.sectionTitle}>
        Editácia údajov klienta
      </h2>

      <form onSubmit={handleSubmit}>
        <div style={styles.formGrid}>
          <div>
            <label style={styles.label}>
              Meno
            </label>

            <input
              style={styles.input}
              value={form.firstName}
              onChange={(event) =>
                handleChange(
                  "firstName",
                  event.target.value
                )
              }
            />
          </div>

          <div>
            <label style={styles.label}>
              Priezvisko
            </label>

            <input
              style={styles.input}
              value={form.lastName}
              onChange={(event) =>
                handleChange(
                  "lastName",
                  event.target.value
                )
              }
            />
          </div>

          <div>
            <label style={styles.label}>
              Dátum narodenia
            </label>

            <input
              type="date"
              style={styles.input}
              value={form.dateOfBirth}
              onChange={(event) =>
                handleChange(
                  "dateOfBirth",
                  event.target.value
                )
              }
            />
          </div>

          <div>
            <label style={styles.label}>
              Pohlavie
            </label>

            <select
              style={styles.input}
              value={form.sex}
              onChange={(event) =>
                handleChange(
                  "sex",
                  event.target.value
                )
              }
            >
              <option value="NOT_SPECIFIED">
                Neuvedené
              </option>

              <option value="MALE">
                Muž
              </option>

              <option value="FEMALE">
                Žena
              </option>

              <option value="OTHER">
                Iné
              </option>
            </select>
          </div>

          <div>
            <label style={styles.label}>
              Email
            </label>

            <input
              type="email"
              style={styles.input}
              value={form.email}
              onChange={(event) =>
                handleChange(
                  "email",
                  event.target.value
                )
              }
            />
          </div>

          <div>
            <label style={styles.label}>
              Telefón
            </label>

            <input
              style={styles.input}
              value={form.phone}
              onChange={(event) =>
                handleChange(
                  "phone",
                  event.target.value
                )
              }
            />
          </div>
        </div>

        <div style={styles.formSingleField}>
          <label style={styles.label}>
            Poznámky
          </label>

          <textarea
            style={styles.textarea}
            value={form.notes}
            onChange={(event) =>
              handleChange(
                "notes",
                event.target.value
              )
            }
            rows={5}
          />
        </div>

        <div style={styles.formActions}>
          <button
            type="button"
            style={styles.secondaryButton}
            onClick={onCancel}
			disabled={saving}
          >
            Zrušiť
          </button>

          <button
			type="submit"
			style={styles.primaryButton}
			disabled={saving}
			>
			{saving ? "Ukladám..." : "Uložiť zmeny"}
		  </button>
        </div>
      </form>
    </section>
  );
}

const styles: Record<
  string,
  React.CSSProperties
> = {
  card: {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    padding: "24px",
    marginBottom: "24px",
  },

  sectionTitle: {
    marginTop: 0,
    marginBottom: "22px",
    fontSize: "19px",
  },

  formGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(2, minmax(220px, 1fr))",
    gap: "20px",
  },

  formSingleField: {
    marginTop: "20px",
  },

  label: {
    display: "block",
    marginBottom: "6px",
    fontSize: "13px",
    color: "#6b7280",
    fontWeight: 600,
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "11px 12px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "14px",
  },

  textarea: {
    width: "100%",
    boxSizing: "border-box",
    padding: "11px 12px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "14px",
    resize: "vertical",
  },

  formActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    marginTop: "24px",
  },

  secondaryButton: {
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    padding: "11px 18px",
    background: "white",
    color: "#374151",
    fontWeight: 600,
    fontSize: "14px",
    cursor: "pointer",
  },

  primaryButton: {
    border: "none",
    borderRadius: "8px",
    padding: "11px 18px",
    background: "#4f46e5",
    color: "white",
    fontWeight: 600,
    fontSize: "14px",
    cursor: "pointer",
  },
};