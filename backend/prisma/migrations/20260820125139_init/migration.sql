-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('PSYCHOLOGIST', 'ADMIN');

-- CreateEnum
CREATE TYPE "Sex" AS ENUM ('MALE', 'FEMALE', 'OTHER', 'NOT_SPECIFIED');

-- CreateEnum
CREATE TYPE "QuestionnaireStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'SCALE', 'TEXT', 'NUMBER', 'BOOLEAN');

-- CreateEnum
CREATE TYPE "AdministrationMode" AS ENUM ('TABLET', 'LINK');

-- CreateEnum
CREATE TYPE "AdministrationStatus" AS ENUM ('CREATED', 'STARTED', 'COMPLETED', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ScoringMethod" AS ENUM ('SUM', 'MEAN', 'WEIGHTED_SUM', 'WEIGHTED_MEAN');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'PSYCHOLOGIST',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Client" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMP(3),
    "sex" "Sex" NOT NULL DEFAULT 'NOT_SPECIFIED',
    "externalId" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgeRange" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "minAge" INTEGER NOT NULL,
    "maxAge" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AgeRange_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Questionnaire" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" "QuestionnaireStatus" NOT NULL DEFAULT 'DRAFT',
    "language" TEXT,
    "license" TEXT,
    "copyright" TEXT,
    "source" TEXT,
    "estimatedMinutes" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Questionnaire_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionnaireVersion" (
    "id" TEXT NOT NULL,
    "questionnaireId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuestionnaireVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Question" (
    "id" TEXT NOT NULL,
    "questionnaireVersionId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "type" "QuestionType" NOT NULL,
    "order" INTEGER NOT NULL,
    "required" BOOLEAN NOT NULL DEFAULT true,
    "minValue" DOUBLE PRECISION,
    "maxValue" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionOption" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "QuestionOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Scale" (
    "id" TEXT NOT NULL,
    "questionnaireVersionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "scoringMethod" "ScoringMethod" NOT NULL DEFAULT 'SUM',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Scale_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScaleQuestion" (
    "id" TEXT NOT NULL,
    "scaleId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "reverseScoring" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ScaleQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScoreMapping" (
    "id" TEXT NOT NULL,
    "scaleQuestionId" TEXT NOT NULL,
    "inputValue" DOUBLE PRECISION NOT NULL,
    "outputValue" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "ScoreMapping_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NormTable" (
    "id" TEXT NOT NULL,
    "scaleId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NormTable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NormRow" (
    "id" TEXT NOT NULL,
    "normTableId" TEXT NOT NULL,
    "minAge" INTEGER,
    "maxAge" INTEGER,
    "sex" "Sex",
    "rawScore" DOUBLE PRECISION NOT NULL,
    "standardScore" DOUBLE PRECISION,
    "percentile" DOUBLE PRECISION,
    "sten" DOUBLE PRECISION,

    CONSTRAINT "NormRow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InterpretationRule" (
    "id" TEXT NOT NULL,
    "scaleId" TEXT NOT NULL,
    "minScore" DOUBLE PRECISION,
    "maxScore" DOUBLE PRECISION,
    "label" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "InterpretationRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Battery" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Battery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BatteryItem" (
    "id" TEXT NOT NULL,
    "batteryId" TEXT NOT NULL,
    "questionnaireId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "BatteryItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionnaireAgeRange" (
    "id" TEXT NOT NULL,
    "questionnaireId" TEXT NOT NULL,
    "ageRangeId" TEXT NOT NULL,

    CONSTRAINT "QuestionnaireAgeRange_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionnaireCategory" (
    "id" TEXT NOT NULL,
    "questionnaireId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,

    CONSTRAINT "QuestionnaireCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Administration" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "questionnaireVersionId" TEXT NOT NULL,
    "mode" "AdministrationMode" NOT NULL,
    "status" "AdministrationStatus" NOT NULL DEFAULT 'CREATED',
    "accessToken" TEXT,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "ageAtAdministration" INTEGER,
    "sexAtAdministration" "Sex",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Administration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Answer" (
    "id" TEXT NOT NULL,
    "administrationId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Answer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Result" (
    "id" TEXT NOT NULL,
    "administrationId" TEXT NOT NULL,
    "scaleId" TEXT NOT NULL,
    "rawScore" DOUBLE PRECISION,
    "standardScore" DOUBLE PRECISION,
    "percentile" DOUBLE PRECISION,
    "sten" DOUBLE PRECISION,
    "interpretation" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Result_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Client_userId_idx" ON "Client"("userId");

-- CreateIndex
CREATE INDEX "Client_lastName_idx" ON "Client"("lastName");

-- CreateIndex
CREATE UNIQUE INDEX "QuestionnaireVersion_questionnaireId_version_key" ON "QuestionnaireVersion"("questionnaireId", "version");

-- CreateIndex
CREATE INDEX "Question_questionnaireVersionId_idx" ON "Question"("questionnaireVersionId");

-- CreateIndex
CREATE INDEX "Question_questionnaireVersionId_order_idx" ON "Question"("questionnaireVersionId", "order");

-- CreateIndex
CREATE INDEX "QuestionOption_questionId_idx" ON "QuestionOption"("questionId");

-- CreateIndex
CREATE INDEX "Scale_questionnaireVersionId_idx" ON "Scale"("questionnaireVersionId");

-- CreateIndex
CREATE UNIQUE INDEX "ScaleQuestion_scaleId_questionId_key" ON "ScaleQuestion"("scaleId", "questionId");

-- CreateIndex
CREATE UNIQUE INDEX "ScoreMapping_scaleQuestionId_inputValue_key" ON "ScoreMapping"("scaleQuestionId", "inputValue");

-- CreateIndex
CREATE INDEX "NormTable_scaleId_idx" ON "NormTable"("scaleId");

-- CreateIndex
CREATE INDEX "NormRow_normTableId_idx" ON "NormRow"("normTableId");

-- CreateIndex
CREATE INDEX "InterpretationRule_scaleId_idx" ON "InterpretationRule"("scaleId");

-- CreateIndex
CREATE INDEX "BatteryItem_batteryId_order_idx" ON "BatteryItem"("batteryId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "BatteryItem_batteryId_questionnaireId_key" ON "BatteryItem"("batteryId", "questionnaireId");

-- CreateIndex
CREATE UNIQUE INDEX "QuestionnaireAgeRange_questionnaireId_ageRangeId_key" ON "QuestionnaireAgeRange"("questionnaireId", "ageRangeId");

-- CreateIndex
CREATE UNIQUE INDEX "QuestionnaireCategory_questionnaireId_categoryId_key" ON "QuestionnaireCategory"("questionnaireId", "categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "Administration_accessToken_key" ON "Administration"("accessToken");

-- CreateIndex
CREATE INDEX "Administration_clientId_idx" ON "Administration"("clientId");

-- CreateIndex
CREATE INDEX "Administration_status_idx" ON "Administration"("status");

-- CreateIndex
CREATE INDEX "Answer_administrationId_idx" ON "Answer"("administrationId");

-- CreateIndex
CREATE UNIQUE INDEX "Answer_administrationId_questionId_key" ON "Answer"("administrationId", "questionId");

-- CreateIndex
CREATE INDEX "Result_administrationId_idx" ON "Result"("administrationId");

-- CreateIndex
CREATE UNIQUE INDEX "Result_administrationId_scaleId_key" ON "Result"("administrationId", "scaleId");

-- AddForeignKey
ALTER TABLE "Client" ADD CONSTRAINT "Client_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionnaireVersion" ADD CONSTRAINT "QuestionnaireVersion_questionnaireId_fkey" FOREIGN KEY ("questionnaireId") REFERENCES "Questionnaire"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_questionnaireVersionId_fkey" FOREIGN KEY ("questionnaireVersionId") REFERENCES "QuestionnaireVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionOption" ADD CONSTRAINT "QuestionOption_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Scale" ADD CONSTRAINT "Scale_questionnaireVersionId_fkey" FOREIGN KEY ("questionnaireVersionId") REFERENCES "QuestionnaireVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScaleQuestion" ADD CONSTRAINT "ScaleQuestion_scaleId_fkey" FOREIGN KEY ("scaleId") REFERENCES "Scale"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScaleQuestion" ADD CONSTRAINT "ScaleQuestion_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScoreMapping" ADD CONSTRAINT "ScoreMapping_scaleQuestionId_fkey" FOREIGN KEY ("scaleQuestionId") REFERENCES "ScaleQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NormTable" ADD CONSTRAINT "NormTable_scaleId_fkey" FOREIGN KEY ("scaleId") REFERENCES "Scale"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NormRow" ADD CONSTRAINT "NormRow_normTableId_fkey" FOREIGN KEY ("normTableId") REFERENCES "NormTable"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterpretationRule" ADD CONSTRAINT "InterpretationRule_scaleId_fkey" FOREIGN KEY ("scaleId") REFERENCES "Scale"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BatteryItem" ADD CONSTRAINT "BatteryItem_batteryId_fkey" FOREIGN KEY ("batteryId") REFERENCES "Battery"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BatteryItem" ADD CONSTRAINT "BatteryItem_questionnaireId_fkey" FOREIGN KEY ("questionnaireId") REFERENCES "Questionnaire"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionnaireAgeRange" ADD CONSTRAINT "QuestionnaireAgeRange_questionnaireId_fkey" FOREIGN KEY ("questionnaireId") REFERENCES "Questionnaire"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionnaireAgeRange" ADD CONSTRAINT "QuestionnaireAgeRange_ageRangeId_fkey" FOREIGN KEY ("ageRangeId") REFERENCES "AgeRange"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionnaireCategory" ADD CONSTRAINT "QuestionnaireCategory_questionnaireId_fkey" FOREIGN KEY ("questionnaireId") REFERENCES "Questionnaire"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionnaireCategory" ADD CONSTRAINT "QuestionnaireCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Administration" ADD CONSTRAINT "Administration_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Administration" ADD CONSTRAINT "Administration_questionnaireVersionId_fkey" FOREIGN KEY ("questionnaireVersionId") REFERENCES "QuestionnaireVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_administrationId_fkey" FOREIGN KEY ("administrationId") REFERENCES "Administration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Result" ADD CONSTRAINT "Result_administrationId_fkey" FOREIGN KEY ("administrationId") REFERENCES "Administration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Result" ADD CONSTRAINT "Result_scaleId_fkey" FOREIGN KEY ("scaleId") REFERENCES "Scale"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
