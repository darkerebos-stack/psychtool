import { useEffect, useState } from "react";

import type {
  User,
  Client,
  NewClient,
  Examination,
  NewExamination,
} from "./types";

import {
  calculateAge,
  formatDate,
  examinationStatusLabel,
} from "./utils/formatters";

import {
  checkSession,
  login,
  logout,
} from "./api/auth";

import {
  getClients,
  createClient,
  updateClient,
} from "./api/clients";

import {
  getExaminations,
  createExamination,
} from "./api/examinations";

import ClientDetail from "./components/ClientDetail";

function App() {
  const [user, setUser] = useState<User | null>(null);

  const [email, setEmail] = useState("psycholog@test.sk");
  const [password, setPassword] = useState("test-password");

  const [loginError, setLoginError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);

  const [selectedClient, setSelectedClient] =
    useState<Client | null>(null);
  const [selectedExamination, setSelectedExamination] =
    useState<Examination | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<NewClient>({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    sex: "NOT_SPECIFIED",
    email: "",
    phone: "",
    notes: "",
  });

  const [examinations, setExaminations] =
    useState<Examination[]>([]);

  const [loadingExaminations, setLoadingExaminations] =
    useState(false);

  const [showExaminationForm, setShowExaminationForm] =
    useState(false);

  const [savingExamination, setSavingExamination] =
    useState(false);

  const [examinationForm, setExaminationForm] =
    useState<NewExamination>({
      date: "",
      type: "",
      status: "PLANNED",
      notes: "",
    });

  // ==========================================================
  // CHECK SESSION
  // ==========================================================

  useEffect(() => {
  async function verifySession() {
    const currentUser = await checkSession();

    setUser(currentUser);
    setCheckingSession(false);
  }

  verifySession();
  }, []);
  // ==========================================================
  // LOGIN
  // ==========================================================

  async function handleLogin(
  event: React.FormEvent
) {
  event.preventDefault();

  setLoginError("");
  setLoggingIn(true);

  try {
    const currentUser = await login(
      email,
      password
    );

    setUser(currentUser);
  } catch (error) {
    setLoginError(
      error instanceof Error
        ? error.message
        : "Prihlásenie sa nepodarilo."
    );
  } finally {
    setLoggingIn(false);
  }
}

  // ==========================================================
  // LOGOUT
  // ==========================================================

  async function handleLogout() {
  try {
    await logout();
  } catch (error) {
    console.error(
      "Nepodarilo sa odhlásiť:",
      error
    );
  } finally {
    setUser(null);
    setSelectedClient(null);
    setSelectedExamination(null);
    setClients([]);
    setExaminations([]);
  }
}

  // ==========================================================
  // LOAD CLIENTS
  // ==========================================================

  async function loadClients() {
  setLoading(true);

  try {
    const data = await getClients();

    setClients(data);
  } catch (error) {
    console.error(
      "Chyba pri načítaní klientov:",
      error
    );
  } finally {
    setLoading(false);
  }
}
  // ==========================================================
  // LOAD CLIENTS AFTER LOGIN
  // ==========================================================

  useEffect(() => {
    if (!user) return;

    loadClients();
  }, [user]);
  
  // ==========================================================
  // LOAD EXAMINATIONS
  // ==========================================================

  async function loadExaminations(
  clientId: string
) {
  setLoadingExaminations(true);

  try {
    const data = await getExaminations(clientId);

    setExaminations(data);
  } catch (error) {
    console.error(
      "Chyba pri načítaní vyšetrení:",
      error
    );

    setExaminations([]);
  } finally {
    setLoadingExaminations(false);
  }
}

  // ==========================================================
  // SELECT CLIENT
  // ==========================================================

  function handleSelectClient(client: Client) {
    setSelectedClient(client);
    setSelectedExamination(null);
    setShowExaminationForm(false);
    loadExaminations(client.id);
  }

  // ==========================================================
  // CLIENT FORM
  // ==========================================================

  function handleClientChange(
    field: keyof NewClient,
    value: string
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  // ==========================================================
  // CREATE CLIENT
  // ==========================================================

  async function handleSubmit(
    event: React.FormEvent
  ) {
    event.preventDefault();

    if (
      !form.firstName.trim() ||
      !form.lastName.trim()
    ) {
      alert("Vyplňte meno a priezvisko.");
      return;
    }

    setSaving(true);

    try {
  await createClient(form);

  setForm({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    sex: "NOT_SPECIFIED",
    email: "",
    phone: "",
    notes: "",
  });

      setShowForm(false);

      await loadClients();
    } catch (error) {
      console.error(
        "Chyba pri vytváraní klienta:",
        error
      );

      alert(
        "Klienta sa nepodarilo vytvoriť."
      );
    } finally {
      setSaving(false);
    }
  }
  
async function handleUpdateClient(
  data: NewClient
) {
  if (!selectedClient) {
    return;
  }

  try {
    const updatedClient = await updateClient(
      selectedClient.id,
      data
    );

    setSelectedClient(updatedClient);

    setClients((current) =>
      current.map((client) =>
        client.id === updatedClient.id
          ? updatedClient
          : client
      )
    );
  } catch (error) {
    console.error(
      "Chyba pri aktualizácii klienta:",
      error
    );

    alert(
      "Údaje klienta sa nepodarilo uložiť."
    );
	throw error;
  }
}
 
  // ==========================================================
  // EXAMINATION FORM
  // ==========================================================

  function handleExaminationChange(
    field: keyof NewExamination,
    value: string
  ) {
    setExaminationForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  // ==========================================================
  // CREATE EXAMINATION
  // ==========================================================

  async function handleExaminationSubmit(
    event: React.FormEvent
  ) {
    event.preventDefault();

    if (!selectedClient) {
      return;
    }

    if (
      !examinationForm.date ||
      !examinationForm.type.trim()
    ) {
      alert(
        "Vyplňte dátum a typ vyšetrenia."
      );
      return;
    }

    setSavingExamination(true);

    try {
      await createExamination(
		selectedClient.id,
		examinationForm
		);

      setExaminationForm({
        date: "",
        type: "",
        status: "PLANNED",
        notes: "",
      });

      setShowExaminationForm(false);

      await loadExaminations(
        selectedClient.id
      );
    } catch (error) {
      console.error(
        "Chyba pri vytváraní vyšetrenia:",
        error
      );

      alert(
        "Vyšetrenie sa nepodarilo vytvoriť."
      );
    } finally {
      setSavingExamination(false);
    }
  }

  // ==========================================================
  // CHECKING SESSION
  // ==========================================================

  if (checkingSession) {
    return (
      <div style={styles.loginPage}>
        <div style={styles.loginCard}>
          <div style={styles.loginLogo}>
            Psychotool
          </div>

          <p style={styles.loginSubtitle}>
            Kontrolujem prihlásenie...
          </p>
        </div>
      </div>
    );
  }

  // ==========================================================
  // LOGIN SCREEN
  // ==========================================================

  if (!user) {
    return (
      <div style={styles.loginPage}>
        <div style={styles.loginCard}>
          <div style={styles.loginLogo}>
            Psychotool
          </div>

          <h1 style={styles.loginTitle}>
            Prihlásenie
          </h1>

          <p style={styles.loginSubtitle}>
            Prihláste sa do svojho účtu psychológa.
          </p>

          <form onSubmit={handleLogin}>
            <div style={styles.loginField}>
              <label style={styles.label}>
                Email
              </label>

              <input
                type="email"
                style={styles.input}
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                placeholder="vas@email.sk"
                autoComplete="email"
              />
            </div>

            <div style={styles.loginField}>
              <label style={styles.label}>
                Heslo
              </label>

              <input
                type="password"
                style={styles.input}
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                placeholder="Heslo"
                autoComplete="current-password"
              />
            </div>

            {loginError && (
              <div style={styles.loginError}>
                {loginError}
              </div>
            )}

            <button
              type="submit"
              style={styles.loginButton}
              disabled={loggingIn}
            >
              {loggingIn
                ? "Prihlasujem..."
                : "Prihlásiť sa"}
            </button>
          </form>

          <div style={styles.loginHint}>
            Testovací účet: psycholog@test.sk
          </div>
        </div>
      </div>
    );
  }

  // ==========================================================
  // CLIENT DETAIL
  // ==========================================================

  if (selectedClient) {
	  if (selectedExamination) {
  return (
    <div style={styles.app}>
      <header style={styles.header}>
        <div style={styles.logo}>
          Psychotool
        </div>

        <div style={styles.headerRight}>
          <span>
            {user.firstName} {user.lastName}
          </span>

          <button
            style={styles.logoutButton}
            onClick={handleLogout}
          >
            Odhlásiť
          </button>
        </div>
      </header>

      <div style={styles.layout}>
        <aside style={styles.sidebar}>
          <nav>
            <div
              style={{
                ...styles.menuItem,
                ...styles.menuItemActive,
              }}
              onClick={() => {
                setSelectedExamination(null);
              }}
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
            onClick={() =>
              setSelectedExamination(null)
            }
          >
            ← Späť na vyšetrenia
          </button>

          <div style={styles.clientHeader}>
            <div>
              <h1 style={styles.title}>
                {selectedExamination.type}
              </h1>

              <p style={styles.subtitle}>
                Vyšetrenie klienta{" "}
                {selectedClient.firstName}{" "}
                {selectedClient.lastName}
              </p>
            </div>
          </div>

          <section style={styles.card}>
            <h2 style={styles.sectionTitle}>
              Základné údaje vyšetrenia
            </h2>

            <div style={styles.detailGrid}>
              <div>
                <div style={styles.detailLabel}>
                  Klient
                </div>

                <div style={styles.detailValue}>
                  {selectedClient.firstName}{" "}
                  {selectedClient.lastName}
                </div>
              </div>

              <div>
                <div style={styles.detailLabel}>
                  Dátum
                </div>

                <div style={styles.detailValue}>
                  {formatDate(
                    selectedExamination.date
                  )}
                </div>
              </div>

              <div>
                <div style={styles.detailLabel}>
                  Typ vyšetrenia
                </div>

                <div style={styles.detailValue}>
                  {selectedExamination.type}
                </div>
              </div>

              <div>
                <div style={styles.detailLabel}>
                  Stav
                </div>

                <div
                  style={styles.examinationStatus}
                >
                  {examinationStatusLabel(
                    selectedExamination.status
                  )}
                </div>
              </div>
            </div>
          </section>

          <section style={styles.card}>
            <h2 style={styles.sectionTitle}>
              Poznámka k vyšetreniu
            </h2>

            {selectedExamination.notes ? (
              <div style={styles.notesBox}>
                {selectedExamination.notes}
              </div>
            ) : (
              <div style={styles.placeholder}>
                K vyšetreniu zatiaľ nie je
                pridaná žiadna poznámka.
              </div>
            )}
          </section>

          <section style={styles.card}>
            <h2 style={styles.sectionTitle}>
              Psychologické vyšetrenie
            </h2>

            <div style={styles.placeholder}>
              <div
                style={{
                  fontSize: "28px",
                  marginBottom: "12px",
                }}
              >
                🧠
              </div>

              <strong>
                Priestor pre obsah vyšetrenia
              </strong>

              <div
                style={{
                  marginTop: "8px",
                }}
              >
                Sem neskôr pridáme anamnézu,
                použité metódy, výsledky testov,
                interpretáciu, záver a odporúčania.
              </div>
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
          <div style={styles.logo}>
            Psychotool
          </div>

          <div style={styles.headerRight}>
            <span>
              {user.firstName} {user.lastName}
            </span>

            <button
              style={styles.logoutButton}
              onClick={handleLogout}
            >
              Odhlásiť
            </button>
          </div>
        </header>

        <div style={styles.layout}>
          <aside style={styles.sidebar}>
            <nav>
              <div
                style={{
                  ...styles.menuItem,
                  ...styles.menuItemActive,
                }}
                onClick={() =>
                  setSelectedClient(null)
                }
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
		 <ClientDetail
			client={selectedClient}
			onBack={() => setSelectedClient(null)}
			onEdit={handleUpdateClient}
			/>
            {/* ==================================================
                EXAMINATIONS
            ================================================== */}

            <section style={styles.card}>
              <div style={styles.sectionHeader}>
                <h2 style={styles.sectionTitle}>
                  Vyšetrenia
                </h2>

                <button
                  style={styles.primaryButton}
                  onClick={() =>
                    setShowExaminationForm(
                      true
                    )
                  }
                >
                  + Nové vyšetrenie
                </button>
              </div>

              {showExaminationForm && (
                <div style={styles.formCard}>
                  <h3 style={styles.formTitle}>
                    Nové vyšetrenie
                  </h3>

                  <form
                    onSubmit={
                      handleExaminationSubmit
                    }
                  >
                    <div
                      style={styles.formGrid}
                    >
                      <div>
                        <label
                          style={styles.label}
                        >
                          Dátum
                        </label>

                        <input
                          type="date"
                          style={styles.input}
                          value={
                            examinationForm.date
                          }
                          onChange={(event) =>
                            handleExaminationChange(
                              "date",
                              event.target.value
                            )
                          }
                        />
                      </div>

                      <div>
                        <label
                          style={styles.label}
                        >
                          Typ vyšetrenia
                        </label>

                        <input
                          style={styles.input}
                          value={
                            examinationForm.type
                          }
                          onChange={(event) =>
                            handleExaminationChange(
                              "type",
                              event.target.value
                            )
                          }
                          placeholder="Napr. psychologické vyšetrenie"
                        />
                      </div>

                      <div>
                        <label
                          style={styles.label}
                        >
                          Stav
                        </label>

                        <select
                          style={styles.input}
                          value={
                            examinationForm.status
                          }
                          onChange={(event) =>
                            handleExaminationChange(
                              "status",
                              event.target.value
                            )
                          }
                        >
                          <option value="PLANNED">
                            Naplánované
                          </option>

                          <option value="COMPLETED">
                            Uskutočnené
                          </option>

                          <option value="CANCELLED">
                            Zrušené
                          </option>
                        </select>
                      </div>
                    </div>

                    <div
                      style={
                        styles.formSingleField
                      }
                    >
                      <label
                        style={styles.label}
                      >
                        Poznámka
                      </label>

                      <textarea
                        style={
                          styles.textarea
                        }
                        value={
                          examinationForm.notes
                        }
                        onChange={(event) =>
                          handleExaminationChange(
                            "notes",
                            event.target.value
                          )
                        }
                        placeholder="Poznámka k vyšetreniu..."
                        rows={4}
                      />
                    </div>

                    <div
                      style={styles.formActions}
                    >
                      <button
                        type="button"
                        style={
                          styles.secondaryButton
                        }
                        onClick={() =>
                          setShowExaminationForm(
                            false
                          )
                        }
                        disabled={
                          savingExamination
                        }
                      >
                        Zrušiť
                      </button>

                      <button
                        type="submit"
                        style={
                          styles.primaryButton
                        }
                        disabled={
                          savingExamination
                        }
                      >
                        {savingExamination
                          ? "Ukladám..."
                          : "Uložiť vyšetrenie"}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {loadingExaminations ? (
                <p>
                  Načítavam vyšetrenia...
                </p>
              ) : examinations.length === 0 ? (
                <div
                  style={styles.placeholder}
                >
                  Zatiaľ žiadne vyšetrenia.
                </div>
              ) : (
                <div
                  style={
                    styles.examinationList
                  }
                >
                  {examinations.map(
                    (examination) => (
                      <div
						key={examination.id}
						style={styles.examinationItem}
						onClick={() =>
						setSelectedExamination(examination)
						}
						>
                        <div
                          style={
                            styles.examinationMain
                          }
                        >
                          <div
                            style={
                              styles.examinationTitle
                            }
                          >
                            {examination.type}
                          </div>

                          <div
                            style={
                              styles.examinationDate
                            }
                          >
                            {formatDate(
                              examination.date
                            )}
                          </div>
                        </div>

                        <div
                          style={
                            styles.examinationStatus
                          }
                        >
                          {examinationStatusLabel(
                            examination.status
                          )}
                        </div>

                        {examination.notes && (
                          <div
                            style={
                              styles.examinationNotes
                            }
                          >
                            {examination.notes}
                          </div>
                        )}
                      </div>
                    )
                  )}
                </div>
              )}
            </section>

            {/* ==================================================
                QUESTIONNAIRES
            ================================================== */}

            <section style={styles.card}>
              <h2 style={styles.sectionTitle}>
                Dotazníky
              </h2>

              <div style={styles.placeholder}>
                Zatiaľ žiadne vyplnené
                dotazníky.
              </div>
            </section>
          </main>
        </div>
      </div>
    );
  }

  // ==========================================================
  // CLIENT LIST
  // ==========================================================
 

  return (
    <div style={styles.app}>
      <header style={styles.header}>
        <div style={styles.logo}>
          Psychotool
        </div>

        <div style={styles.headerRight}>
          <span>
            {user.firstName} {user.lastName}
          </span>

          <button
            style={styles.logoutButton}
            onClick={handleLogout}
          >
            Odhlásiť
          </button>
        </div>
      </header>

      <div style={styles.layout}>
        <aside style={styles.sidebar}>
          <nav>
            <div
              style={{
                ...styles.menuItem,
                ...styles.menuItemActive,
              }}
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
          <div style={styles.pageHeader}>
            <div>
              <h1 style={styles.title}>
                Klienti
              </h1>

              <p style={styles.subtitle}>
                Zoznam klientov a ich
                psychologických vyšetrení
              </p>
            </div>

            <button
              style={styles.primaryButton}
              onClick={() =>
                setShowForm(true)
              }
            >
              + Nový klient
            </button>
          </div>

          {/* ==================================================
              NEW CLIENT FORM
          ================================================== */}

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
                        handleClientChange(
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
                        handleClientChange(
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
                        handleClientChange(
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
                        handleClientChange(
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
                        handleClientChange(
                          "email",
                          event.target.value
                        )
                      }
                      placeholder="email@priklad.sk"
                    />
                  </div>

                  <div>
                    <label style={styles.label}>
                      Telefón
                    </label>

                    <input
                      type="tel"
                      style={styles.input}
                      value={form.phone}
                      onChange={(event) =>
                        handleClientChange(
                          "phone",
                          event.target.value
                        )
                      }
                      placeholder="+421..."
                    />
                  </div>
                </div>

                <div
                  style={
                    styles.formSingleField
                  }
                >
                  <label style={styles.label}>
                    Poznámky
                  </label>

                  <textarea
                    style={styles.textarea}
                    value={form.notes}
                    onChange={(event) =>
                      handleClientChange(
                        "notes",
                        event.target.value
                      )
                    }
                    placeholder="Poznámky ku klientovi..."
                    rows={4}
                  />
                </div>

                <div style={styles.formActions}>
                  <button
                    type="button"
                    style={styles.secondaryButton}
                    onClick={() =>
                      setShowForm(false)
                    }
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

          {/* ==================================================
              CLIENT TABLE
          ================================================== */}

          <section style={styles.card}>
            {loading ? (
              <p>Načítavam klientov...</p>
            ) : clients.length === 0 ? (
              <div style={styles.empty}>
                <div style={styles.emptyIcon}>
                  👤
                </div>

                <h2>
                  Zatiaľ nemáte žiadnych
                  klientov
                </h2>

                <p>
                  Vytvorte prvého klienta
                  pomocou tlačidla „Nový
                  klient“.
                </p>
              </div>
            ) : (
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>
                      Meno
                    </th>

                    <th style={styles.th}>
                      Dátum narodenia
                    </th>

                    <th style={styles.th}>
                      Vek
                    </th>

                    <th style={styles.th}>
                      Pohlavie
                    </th>

                    <th style={styles.th}>
                      Kontakt
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {clients.map((client) => (
                    <tr
                      key={client.id}
                      onClick={() =>
                        handleSelectClient(
                          client
                        )
                      }
                      style={styles.tableRow}
                    >
                      <td style={styles.td}>
                        <strong>
                          {client.firstName}{" "}
                          {client.lastName}
                        </strong>
                      </td>

                      <td style={styles.td}>
                        {formatDate(
                          client.dateOfBirth
                        )}
                      </td>

                      <td style={styles.td}>
                        {calculateAge(
                          client.dateOfBirth
                        )}
                      </td>

                      <td style={styles.td}>
                        {client.sex === "MALE"
                          ? "Muž"
                          : client.sex ===
                            "FEMALE"
                          ? "Žena"
                          : client.sex ===
                            "OTHER"
                          ? "Iné"
                          : "Neuvedené"}
                      </td>

                      <td style={styles.td}>
                        {client.email ||
                        client.phone ? (
                          <div>
                            {client.email && (
                              <div>
                                {client.email}
                              </div>
                            )}

                            {client.phone && (
                              <div
                                style={{
                                  color:
                                    "#6b7280",
                                  marginTop:
                                    "3px",
                                }}
                              >
                                {client.phone}
                              </div>
                            )}
                          </div>
                        ) : (
                          "—"
                        )}
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

// ============================================================
// STYLES
// ============================================================

const styles: Record<
  string,
  React.CSSProperties
> = {
  app: {
    minHeight: "100vh",
    background: "#f5f7fa",
    color: "#1f2937",
    fontFamily:
      "Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
  },

  loginPage: {
    minHeight: "100vh",
    background: "#f5f7fa",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
  },

  loginCard: {
    width: "100%",
    maxWidth: "420px",
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "14px",
    padding: "40px",
    boxShadow:
      "0 10px 30px rgba(0,0,0,0.06)",
    boxSizing: "border-box",
  },

  loginLogo: {
    fontSize: "25px",
    fontWeight: 700,
    marginBottom: "30px",
    textAlign: "center",
  },

  loginTitle: {
    margin: 0,
    fontSize: "27px",
    textAlign: "center",
  },

  loginSubtitle: {
    color: "#6b7280",
    textAlign: "center",
    marginTop: "8px",
    marginBottom: "30px",
  },

  loginField: {
    marginBottom: "18px",
  },

  loginButton: {
    width: "100%",
    border: "none",
    borderRadius: "8px",
    padding: "12px 18px",
    background: "#4f46e5",
    color: "white",
    fontWeight: 600,
    fontSize: "15px",
    cursor: "pointer",
  },

  loginError: {
    background: "#fef2f2",
    border: "1px solid #fecaca",
    color: "#b91c1c",
    borderRadius: "7px",
    padding: "10px 12px",
    marginBottom: "18px",
    fontSize: "14px",
  },

  loginHint: {
    marginTop: "24px",
    color: "#9ca3af",
    fontSize: "12px",
    textAlign: "center",
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
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },

  logoutButton: {
    border: "1px solid #d1d5db",
    borderRadius: "7px",
    padding: "7px 12px",
    background: "#ffffff",
    color: "#374151",
    cursor: "pointer",
    fontSize: "13px",
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
    marginBottom: "24px",
    boxShadow:
      "0 1px 2px rgba(0,0,0,0.03)",
  },

  formCard: {
    background: "#f9fafb",
    border: "1px solid #e5e7eb",
    borderRadius: "10px",
    padding: "24px",
    marginBottom: "24px",
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

  formSingleField: {
    marginTop: "20px",
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

  textarea: {
    width: "100%",
    boxSizing: "border-box",
    padding: "10px 12px",
    border: "1px solid #d1d5db",
    borderRadius: "7px",
    fontSize: "14px",
    background: "#ffffff",
    resize: "vertical",
    fontFamily:
      "Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
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

  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "22px",
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

  notesBox: {
    padding: "16px",
    background: "#f9fafb",
    borderRadius: "8px",
    whiteSpace: "pre-wrap",
    lineHeight: 1.6,
    fontSize: "14px",
  },

  placeholder: {
    padding: "30px",
    background: "#f9fafb",
    borderRadius: "8px",
    color: "#6b7280",
    textAlign: "center",
  },

  examinationList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },

  examinationItem: {
    border: "1px solid #e5e7eb",
    borderRadius: "9px",
    padding: "16px",
    background: "#ffffff",
  },

  examinationMain: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
  },

  examinationTitle: {
    fontSize: "16px",
    fontWeight: 600,
  },

  examinationDate: {
    color: "#6b7280",
    fontSize: "14px",
  },

  examinationStatus: {
    display: "inline-block",
    marginTop: "10px",
    padding: "5px 9px",
    borderRadius: "6px",
    background: "#eef2ff",
    color: "#4338ca",
    fontSize: "12px",
    fontWeight: 600,
  },

  examinationNotes: {
    marginTop: "12px",
    paddingTop: "12px",
    borderTop: "1px solid #f0f0f0",
    color: "#6b7280",
    fontSize: "14px",
    lineHeight: 1.5,
    whiteSpace: "pre-wrap",
  },
};

export default App;