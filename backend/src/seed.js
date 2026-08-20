import bcrypt from "bcrypt";
import { prisma } from "./db.js";
async function main() {
    // ==========================================================
    // TESTOVACÍ POUŽÍVATEĽ
    // ==========================================================
    const passwordHash = await bcrypt.hash("test-password", 10);
    const user = await prisma.user.upsert({
        where: {
            email: "psycholog@test.sk",
        },
        update: {
            passwordHash,
        },
        create: {
            email: "psycholog@test.sk",
            passwordHash,
            firstName: "Testovací",
            lastName: "Psychológ",
            role: "PSYCHOLOGIST",
        },
    });
    console.log("Testovací používateľ:");
    console.log({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
    });
    // ==========================================================
    // TESTOVACÍ DOTAZNÍK
    // ==========================================================
    const existingQuestionnaire = await prisma.questionnaire.findFirst({
        where: {
            name: "Krátky dotazník nálady",
        },
    });
    let questionnaire;
    if (existingQuestionnaire) {
        questionnaire = existingQuestionnaire;
        console.log("Testovací dotazník už existuje:", questionnaire.id);
    }
    else {
        questionnaire =
            await prisma.questionnaire.create({
                data: {
                    name: "Krátky dotazník nálady",
                    description: "Jednoduchý testovací dotazník na overenie administrácie.",
                    status: "ACTIVE",
                    language: "sk",
                    estimatedMinutes: 2,
                },
            });
        console.log("Vytvorený testovací dotazník:", questionnaire.id);
    }
    // ==========================================================
    // VERZIA DOTAZNÍKA
    // ==========================================================
    const existingVersion = await prisma.questionnaireVersion.findUnique({
        where: {
            questionnaireId_version: {
                questionnaireId: questionnaire.id,
                version: 1,
            },
        },
    });
    if (existingVersion) {
        console.log("Verzia 1 už existuje:", existingVersion.id);
        return;
    }
    const version = await prisma.questionnaireVersion.create({
        data: {
            questionnaireId: questionnaire.id,
            version: 1,
            notes: "Prvá testovacia verzia.",
        },
    });
    // ==========================================================
    // OTÁZKY
    // ==========================================================
    const questions = [
        {
            text: "Ako sa v posledných dňoch celkovo cítite?",
            order: 1,
            options: [
                "Veľmi zle",
                "Skôr zle",
                "Ani dobre, ani zle",
                "Skôr dobre",
                "Veľmi dobre",
            ],
        },
        {
            text: "Ako často ste sa v posledných dňoch cítili nervózny/nervózna?",
            order: 2,
            options: [
                "Nikdy",
                "Zriedka",
                "Niekedy",
                "Často",
                "Takmer stále",
            ],
        },
        {
            text: "Ako hodnotíte svoju celkovú spokojnosť?",
            order: 3,
            options: [
                "1 – vôbec nie som spokojný/á",
                "2",
                "3",
                "4",
                "5 – som veľmi spokojný/á",
            ],
        },
    ];
    for (const questionData of questions) {
        await prisma.question.create({
            data: {
                questionnaireVersionId: version.id,
                text: questionData.text,
                type: "SINGLE_CHOICE",
                order: questionData.order,
                required: true,
                options: {
                    create: questionData.options.map((text, index) => ({
                        text,
                        value: index + 1,
                        order: index + 1,
                    })),
                },
            },
        });
    }
    console.log("Vytvorená verzia dotazníka:", version.id);
    console.log("Vytvorené 3 testovacie otázky.");
}
main()
    .catch((error) => {
    console.error(error);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map