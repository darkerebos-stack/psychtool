import { useEffect, useState } from "react";

import type { Client, NewClient } from "../types";

import ClientEditForm from "./ClientEditForm";

import { getQuestionnaires } from "../api/clients";

type ClientDetailProps = {
  client: Client;
  onBack: () => void;
  onEdit: (data: NewClient) => void;
};

type Questionnaire = {
  id: string;
  name: string;
  description: string | null;
  estimatedMinutes: number | null;
  versions: {
    id: string;
    version: number;
    questions: {
      id: string;
      text: string;
      type: string;
      order: number;
      required: boolean;
    }[];
  }[];
};

function calculateAge(dateOfBirth: string | null) {
  if (!dateOfBirth) return "";

  const birth = new Date(dateOfBirth);
  const today = new Date();

  let age =
    today.getFullYear() -
    birth.getFullYear();

  const monthDiff =
    today.getMonth() -
    birth.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 &&
      today.getDate() < birth.getDate())
  ) {
    age--;
  }

  return age;
}

function formatDate(date: string | null) {
  if (!date) return "Neuvedený";

  return new Date(date).toLocaleDateString(
    "sk-SK"
  );
}

export default function ClientDetail({
  client,
  onBack,
  onEdit,
}: ClientDetailProps) {
  const [editing, setEditing] = useState(false);
  const [questionnaires, setQuestionnaires] = useState<
  Questionnaire[]
	>([]);

  const [showQuestionnaires, setShowQuestionnaires] =
	useState(false);

  const [loadingQuestionnaires, setLoadingQuestionnaires] =
	useState(false);

  const [questionnaireError, setQuestionnaireError] =
    useState("");
  async function handleShowQuestionnaires() {
	  setShowQuestionnaires(true);
	  setQuestionnaireError("");
	  setLoadingQuestionnaires(true);

	  try {
		const data = await getQuestionnaires();
		setQuestionnaires(data);
	  } catch (error) {
		setQuestionnaireError(
		  error instanceof Error
			? error.message
			: "Nepodarilo sa načítať dotazníky."
		);
	  } finally {
		setLoadingQuestionnaires(false);
	}
	}
  return (
    <div>
      {editing ? (
        <ClientEditForm
          client={client}
          onCancel={() => setEditing(false)}
          onSave={async (data) => {
			await onEdit(data);
			setEditing(false);
			}}
        />
      ) : (
        <>
          <button
            style={styles.secondaryButton}
            onClick={onBack}
          >
            ← Späť na klientov
          </button>

          <div style={styles.clientHeader}>
            <div>
              <h1 style={styles.title}>
                {client.firstName}{" "}
                {client.lastName}
              </h1>

              <p style={styles.subtitle}>
                Karta klienta
              </p>
            </div>

            <button
              style={styles.primaryButton}
              onClick={() => setEditing(true)}
            >
              ✏️ Editácia údajov
            </button>
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
                  {client.firstName}
                </div>
              </div>

              <div>
                <div style={styles.detailLabel}>
                  Priezvisko
                </div>

                <div style={styles.detailValue}>
                  {client.lastName}
                </div>
              </div>

              <div>
                <div style={styles.detailLabel}>
                  Dátum narodenia
                </div>

                <div style={styles.detailValue}>
                  {formatDate(client.dateOfBirth)}
                </div>
              </div>

              <div>
                <div style={styles.detailLabel}>
                  Vek
                </div>

                <div style={styles.detailValue}>
                  {calculateAge(
                    client.dateOfBirth
                  )}
                </div>
              </div>

              <div>
                <div style={styles.detailLabel}>
                  Pohlavie
                </div>

                <div style={styles.detailValue}>
                  {client.sex === "MALE"
                    ? "Muž"
                    : client.sex === "FEMALE"
                    ? "Žena"
                    : client.sex === "OTHER"
                    ? "Iné"
                    : "Neuvedené"}
                </div>
              </div>
            </div>
          </section>

          <section style={styles.card}>
            <h2 style={styles.sectionTitle}>
              Kontaktné údaje
            </h2>

            <div style={styles.detailGrid}>
              <div>
                <div style={styles.detailLabel}>
                  Email
                </div>

                <div style={styles.detailValue}>
                  {client.email || "Neuvedený"}
                </div>
              </div>

              <div>
                <div style={styles.detailLabel}>
                  Telefón
                </div>

                <div style={styles.detailValue}>
                  {client.phone || "Neuvedený"}
                </div>
              </div>
            </div>
          </section>
		<section style={styles.card}>
		  <div style={styles.questionnaireHeader}>
			<div>
			  <h2 style={styles.sectionTitle}>
				Dotazníky
			  </h2>

			  <p style={styles.questionnaireDescription}>
				Administrácia psychologického dotazníka
			  </p>
			</div>

			<button
			  style={styles.primaryButton}
			  onClick={handleShowQuestionnaires}
			>
			  📝 Administrovať dotazník
			</button>
		  </div>

		  {showQuestionnaires && (
			<div style={styles.questionnaireBox}>
			  <h3 style={styles.questionnaireTitle}>
				Vyberte dotazník
			  </h3>

			  {loadingQuestionnaires && (
				<div style={styles.placeholder}>
				  Načítavam dotazníky...
				</div>
			  )}

			  {questionnaireError && (
				<div style={styles.errorBox}>
				  {questionnaireError}
				</div>
			  )}

			  {!loadingQuestionnaires &&
				!questionnaireError &&
				questionnaires.length === 0 && (
				  <div style={styles.placeholder}>
					Zatiaľ nie sú dostupné žiadne aktívne
					dotazníky.
				  </div>
				)}

			  {!loadingQuestionnaires &&
				questionnaires.map((questionnaire) => (
				  <div
					key={questionnaire.id}
					style={styles.questionnaireItem}
				  >
					<div>
					  <div style={styles.questionnaireName}>
						{questionnaire.name}
					  </div>

					  {questionnaire.description && (
						<div style={styles.questionnaireDescription}>
						  {questionnaire.description}
						</div>
					  )}

					  {questionnaire.versions[0] && (
						<div style={styles.questionnaireMeta}>
						  Verzia{" "}
						  {questionnaire.versions[0].version}
						  {" · "}
						  {questionnaire.versions[0].questions.length}{" "}
						  otázok
						  {questionnaire.estimatedMinutes
							? ` · približne ${questionnaire.estimatedMinutes} min`
							: ""}
						</div>
					  )}
					</div>

					<button
					  style={styles.secondaryButton}
					  onClick={() =>
						alert(
						  `Vybraný dotazník: ${questionnaire.name}`
						)
					  }
					>
					  Vybrať
					</button>
				  </div>
				))}

			  <div style={styles.questionnaireActions}>
				<button
				  style={styles.secondaryButton}
				  onClick={() => setShowQuestionnaires(false)}
				>
				  Zrušiť
				</button>
			  </div>
			</div>
		  )}
		</section>
          <section style={styles.card}>
            <h2 style={styles.sectionTitle}>
              Poznámky
            </h2>

            {client.notes ? (
              <div style={styles.notesBox}>
                {client.notes}
              </div>
            ) : (
              <div style={styles.placeholder}>
                Zatiaľ nie sú uvedené žiadne
                poznámky.
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}

const styles: Record<
  string,
  React.CSSProperties
> = {
  main: {
    flex: 1,
    padding: "36px 44px",
    maxWidth: "1400px",
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

  clientHeader: {
    marginTop: "28px",
    marginBottom: "28px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  title: {
    margin: 0,
    fontSize: "30px",
  },

  subtitle: {
    marginTop: "6px",
    color: "#6b7280",
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
  
  questionnaireHeader: {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "20px",
},

questionnaireDescription: {
  marginTop: "4px",
  color: "#6b7280",
  fontSize: "14px",
},

questionnaireBox: {
  marginTop: "20px",
  padding: "20px",
  background: "#f9fafb",
  border: "1px solid #e5e7eb",
  borderRadius: "10px",
},

questionnaireTitle: {
  marginTop: 0,
  marginBottom: "16px",
  fontSize: "17px",
},

questionnaireItem: {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "20px",
  padding: "16px",
  background: "white",
  border: "1px solid #e5e7eb",
  borderRadius: "8px",
  marginBottom: "10px",
},

questionnaireName: {
  fontSize: "15px",
  fontWeight: 600,
},

questionnaireMeta: {
  marginTop: "6px",
  fontSize: "12px",
  color: "#9ca3af",
},

questionnaireActions: {
  display: "flex",
  justifyContent: "flex-end",
  marginTop: "16px",
},

errorBox: {
  padding: "12px 14px",
  background: "#fef2f2",
  border: "1px solid #fecaca",
  borderRadius: "8px",
  color: "#b91c1c",
  fontSize: "14px",
  marginBottom: "12px",
},

};