export type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
};

export type Client = {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string | null;
  sex: "MALE" | "FEMALE" | "OTHER" | "NOT_SPECIFIED";
  email: string | null;
  phone: string | null;
  notes: string | null;
};

export type NewClient = {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  sex: "MALE" | "FEMALE" | "OTHER" | "NOT_SPECIFIED";
  email: string;
  phone: string;
  notes: string;
};

export type ExaminationStatus =
  | "PLANNED"
  | "COMPLETED"
  | "CANCELLED";

export type Examination = {
  id: string;
  clientId: string;
  date: string;
  type: string;
  status: ExaminationStatus;
  notes: string | null;
};

export type NewExamination = {
  date: string;
  type: string;
  status: ExaminationStatus;
  notes: string;
};