import { useEffect, useState } from "react";

type Client = {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string | null;
  sex: "MALE" | "FEMALE" | "OTHER" | "NOT_SPECIFIED";
};

type NewClient = {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  sex: "MALE" | "FEMALE" | "OTHER" | "NOT_SPECIFIED";
};

function calculateAge(dateOfBirth: string | null) {
  if (!dateOfBirth) return "";

  const birth = new Date(dateOfBirth);
  const today = new Date();

  let age = today.getFullYear() - birth.getFullYear();

  const monthDiff = today.getMonth() - birth.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birth.getDate())
  ) {
    age--;
  }

  return age;
}

function App() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<NewClient>({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    sex: "NOT_SPECIFIED",
  });

  async function loadClients() {
    try {
      const response = await fetch("http://localhost:3000/api/clients");

      if (!response.ok) {
        throw new Error("Nepodarilo sa načítať klientov");
      }

      const data = await response.json();
      setClients(data);
    } catch (error) {
      console.error("Chyba pri načítaní klientov:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadClients();
  }, []);

  function handleChange(
    field: keyof NewClient,
    value: string
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!form.firstName.trim() || !form.lastName.trim()) {
      alert("Vyplňte meno a priezvisko.");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(
        "http://localhost:3000/api/clients",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            firstName: form.firstName.trim(),
            lastName: form.lastName.trim(),
            dateOfBirth: form.dateOfBirth || undefined,
            sex: form.sex,
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }

      setForm({
        firstName: "",
        lastName: "",
        dateOfBirth: "",
        sex: "NOT_SPECIFIED",
      });

      setShowForm(false);

      await loadClients();
    } catch (error) {
      console.error("Chyba pri vytváraní klienta:", error);
      alert("Klienta sa nepodarilo vytvoriť.");
    } finally {
      setSaving(false);
    }
  }
if (selectedClient) {
  return (
    <div style={styles.app}>
      <header style={styles.header}>
        <div style={styles.logo}>Psychotool</div>

        <div style={styles.headerRight}>
          Psychológ
        </div>
      </header>

      <div style={styles.layout}>
        <aside style={styles.sidebar}>
          <nav>
            <div
              style={{ ...styles.menuItem, ...styles.menuItemActive }}
              onClick={() => setSelectedClient(null)}
            >
              👥 Klienti
            </div>

            <div style={styles.menuItem}>
              📋 Dotazníky
            </div>

            <div style={styles.menuItem}>
              🧠 Vyšetrenia
            </div>

            <div style={styles.menuItem}>
              📊 Výsledky
            </div>
          </nav>
        </aside>

        <main style={styles.main}>
          <button
            style={styles.secondaryButton}
            onClick={() => setSelectedClient(null)}
          >
            ← Späť na klientov
          </button>

          <div style={styles.clientHeader}>
            <div>
              <h1 style={styles.title}>
                {selectedClient.firstName}{" "}
                {selectedClient.lastName}
              </h1>

              <p style={styles.subtitle}>
                Karta klienta
              </p>
            </div>
          </div>

          <section style={styles.card}>
            <h2 style={styles.sectionTitle}>
              Základné údaje
            </h2>

            <div style={styles.detailGrid}>
              <div>
                <div style={styles.detailLabel}>
                  Meno
                </div>
                <div style={styles.detailValue}>
                  {selectedClient.firstName}
                </div>
              </div>

              <div>
                <div style={styles.detailLabel}>
                  Priezvisko
                </div>
                <div style={styles.detailValue}>
                  {selectedClient.lastName}
                </div>
              </div>

              <div>
                <div style={styles.detailLabel}>
                  Dátum narodenia
                </div>
                <div style={styles.detailValue}>
                  {selectedClient.dateOfBirth
                    ? new Date(
                        selectedClient.dateOfBirth
                      ).toLocaleDateString("sk-SK")
                    : "Neuvedený"}
                </div>
              </div>

              <div>
                <div style={styles.detailLabel}>
                  Vek
                </div>
                <div style={styles.detailValue}>
                  {calculateAge(
                    selectedClient.dateOfBirth
                  )}
                </div>
              </div>

              <div>
                <div style={styles.detailLabel}>
                  Pohlavie
                </div>
                <div style={styles.detailValue}>
                  {selectedClient.sex === "MALE"
                    ? "Muž"
                    : selectedClient.sex === "FEMALE"
                    ? "Žena"
                    : selectedClient.sex === "OTHER"
                    ? "Iné"
                    : "Neuvedené"}
                </div>
              </div>
            </div>
          </section>

          <section style={styles.card}>
            <h2 style={styles.sectionTitle}>
              Vyšetrenia
            </h2>

            <div style={styles.placeholder}>
              Zatiaľ žiadne vyšetrenia.
            </div>
          </section>

          <section style={styles.card}>
            <h2 style={styles.sectionTitle}>
              Dotazníky
            </h2>

            <div style={styles.placeholder}>
              Zatiaľ žiadne vyplnené dotazníky.
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
  return (
    <div style={styles.app}>
      <header style={styles.header}>
        <div style={styles.logo}>Psychotool</div>

        <div style={styles.headerRight}>
          Psychológ
        </div>
      </header>

      <div style={styles.layout}>
        <aside style={styles.sidebar}>
          <nav>
            <div style={{ ...styles.menuItem, ...styles.menuItemActive }}>
              👥 Klienti
            </div>

            <div style={styles.menuItem}>
              📋 Dotazníky
            </div>

            <div style={styles.menuItem}>
              🧠 Vyšetrenia
            </div>

            <div style={styles.menuItem}>
              📊 Výsledky
            </div>
          </nav>
        </aside>

        <main style={styles.main}>
          <div style={styles.pageHeader}>
            <div>
              <h1 style={styles.title}>Klienti</h1>

              <p style={styles.subtitle}>
                Zoznam klientov a ich psychologických vyšetrení
              </p>
            </div>

            <button
              style={styles.primaryButton}
              onClick={() => setShowForm(true)}
            >
              + Nový klient
            </button>
          </div>

          {showForm && (
            <section style={styles.formCard}>
              <h2 style={styles.formTitle}>
                Nový klient
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
                      placeholder="Meno"
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
                      placeholder="Priezvisko"
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
                </div>

                <div style={styles.formActions}>
                  <button
                    type="button"
                    style={styles.secondaryButton}
                    onClick={() => setShowForm(false)}
                    disabled={saving}
                  >
                    Zrušiť
                  </button>

                  <button
                    type="submit"
                    style={styles.primaryButton}
                    disabled={saving}
                  >
                    {saving
                      ? "Ukladám..."
                      : "Uložiť klienta"}
                  </button>
                </div>
              </form>
            </section>
          )}

          <section style={styles.card}>
            {loading ? (
              <p>Načítavam klientov...</p>
            ) : clients.length === 0 ? (
              <div style={styles.empty}>
                <div style={styles.emptyIcon}>
                  👤
                </div>

                <h2>
                  Zatiaľ nemáte žiadnych klientov
                </h2>

                <p>
                  Vytvorte prvého klienta pomocou tlačidla
                  „Nový klient“.
                </p>
              </div>
            ) : (
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Meno</th>
                    <th style={styles.th}>
                      Dátum narodenia
                    </th>
                    <th style={styles.th}>Vek</th>
                    <th style={styles.th}>Pohlavie</th>
                  </tr>
                </thead>

                <tbody>
                  {clients.map((client) => (
                    <tr
                     key={client.id}
                     onClick={() => setSelectedClient(client)}
                     style={styles.tableRow}
                    >
                      <td style={styles.td}>
                        <strong>
                          {client.firstName}{" "}
                          {client.lastName}
                        </strong>
                      </td>

                      <td style={styles.td}>
                        {client.dateOfBirth
                          ? new Date(
                              client.dateOfBirth
                            ).toLocaleDateString("sk-SK")
                          : "—"}
                      </td>

                      <td style={styles.td}>
                        {calculateAge(
                          client.dateOfBirth
                        )}
                      </td>

                      <td style={styles.td}>
                        {client.sex === "MALE"
                          ? "Muž"
                          : client.sex === "FEMALE"
                          ? "Žena"
                          : client.sex === "OTHER"
                          ? "Iné"
                          : "Neuvedené"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  app: {
    minHeight: "100vh",
    background: "#f5f7fa",
    color: "#1f2937",
    fontFamily:
      "Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
  },

  header: {
    height: "64px",
    background: "#ffffff",
    borderBottom: "1px solid #e5e7eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 28px",
  },

  logo: {
    fontSize: "22px",
    fontWeight: 700,
  },

  headerRight: {
    color: "#6b7280",
    fontSize: "14px",
  },

  layout: {
    display: "flex",
    minHeight: "calc(100vh - 64px)",
  },

  sidebar: {
    width: "230px",
    background: "#ffffff",
    borderRight: "1px solid #e5e7eb",
    padding: "24px 12px",
  },

  menuItem: {
    padding: "12px 16px",
    marginBottom: "6px",
    borderRadius: "8px",
    fontSize: "15px",
    cursor: "pointer",
  },

  menuItemActive: {
    background: "#eef2ff",
    fontWeight: 600,
  },

  main: {
    flex: 1,
    padding: "36px 44px",
    maxWidth: "1400px",
  },

  pageHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "28px",
  },

  title: {
    margin: 0,
    fontSize: "30px",
  },

  subtitle: {
    marginTop: "6px",
    color: "#6b7280",
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

  card: {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    padding: "24px",
    boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
  },

  formCard: {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    padding: "24px",
    marginBottom: "24px",
    boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
  },

  formTitle: {
    marginTop: 0,
    marginBottom: "24px",
    fontSize: "20px",
  },

  formGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(2, minmax(200px, 1fr))",
    gap: "20px",
  },

  label: {
    display: "block",
    marginBottom: "7px",
    fontSize: "14px",
    fontWeight: 600,
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "10px 12px",
    border: "1px solid #d1d5db",
    borderRadius: "7px",
    fontSize: "14px",
    background: "#ffffff",
  },

  formActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    marginTop: "24px",
  },

  empty: {
    textAlign: "center",
    padding: "70px 20px",
    color: "#6b7280",
  },

  emptyIcon: {
    fontSize: "42px",
    marginBottom: "15px",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
  },

  th: {
    textAlign: "left",
    padding: "12px",
    borderBottom: "1px solid #e5e7eb",
    color: "#6b7280",
    fontSize: "13px",
    fontWeight: 600,
  },

  td: {
    padding: "16px 12px",
    borderBottom: "1px solid #f0f0f0",
    fontSize: "14px",
  },
    tableRow: {
    cursor: "pointer",
  },

  clientHeader: {
    marginTop: "28px",
    marginBottom: "28px",
  },

  sectionTitle: {
    marginTop: 0,
    marginBottom: "22px",
    fontSize: "19px",
  },

  detailGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(3, minmax(180px, 1fr))",
    gap: "24px",
  },

  detailLabel: {
    fontSize: "13px",
    color: "#6b7280",
    marginBottom: "6px",
  },

  detailValue: {
    fontSize: "15px",
    fontWeight: 500,
  },

  placeholder: {
    padding: "30px",
    background: "#f9fafb",
    borderRadius: "8px",
    color: "#6b7280",
    textAlign: "center",
  },
};

export default App;