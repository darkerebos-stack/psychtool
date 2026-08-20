import Fastify from "fastify";
import cors from "@fastify/cors";
import cookie from "@fastify/cookie";
import bcrypt from "bcrypt";
import { prisma } from "./db.js";
const server = Fastify({
    logger: true,
});
const SESSION_COOKIE = "psychotool_session";
async function getCurrentUser(request) {
    const userId = request.cookies[SESSION_COOKIE];
    if (!userId) {
        return null;
    }
    const user = await prisma.user.findUnique({
        where: {
            id: userId,
        },
    });
    return user;
}
async function start() {
    await server.register(cors, {
        origin: "http://localhost:5173",
        credentials: true,
        methods: [
            "GET",
            "POST",
            "PUT",
            "DELETE",
            "OPTIONS",
        ],
    });
    await server.register(cookie);
    // ==========================================================
    // HEALTH CHECK
    // ==========================================================
    server.get("/api/health", async () => {
        return {
            status: "ok",
        };
    });
    // ==========================================================
    // LOGIN
    // ==========================================================
    server.post("/api/auth/login", async (request, reply) => {
        const body = request.body;
        if (!body.email || !body.password) {
            return reply.code(400).send({
                error: "Email a heslo sú povinné",
            });
        }
        const user = await prisma.user.findUnique({
            where: {
                email: body.email,
            },
        });
        if (!user) {
            return reply.code(401).send({
                error: "Nesprávny email alebo heslo",
            });
        }
        const passwordValid = await bcrypt.compare(body.password, user.passwordHash);
        if (!passwordValid) {
            return reply.code(401).send({
                error: "Nesprávny email alebo heslo",
            });
        }
        reply.setCookie(SESSION_COOKIE, user.id, {
            httpOnly: true,
            sameSite: "lax",
            secure: false,
            path: "/",
        });
        return {
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
            },
        };
    });
    // ==========================================================
    // CURRENT USER
    // ==========================================================
    server.get("/api/auth/me", async (request, reply) => {
        const user = await getCurrentUser(request);
        if (!user) {
            return reply.code(401).send({
                error: "Nie ste prihlásený",
            });
        }
        return {
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
            },
        };
    });
    // ==========================================================
    // LOGOUT
    // ==========================================================
    server.post("/api/auth/logout", async (_request, reply) => {
        reply.clearCookie(SESSION_COOKIE, {
            path: "/",
        });
        return {
            status: "ok",
        };
    });
    // ==========================================================
    // GET CLIENTS
    // ==========================================================
    server.get("/api/clients", async (request, reply) => {
        const user = await getCurrentUser(request);
        if (!user) {
            return reply.code(401).send({
                error: "Nie ste prihlásený",
            });
        }
        const clients = await prisma.client.findMany({
            where: {
                userId: user.id,
            },
            orderBy: {
                lastName: "asc",
            },
        });
        return clients;
    });
    // ==========================================================
    // CREATE CLIENT
    // ==========================================================
    server.post("/api/clients", async (request, reply) => {
        const body = request.body;
        if (!body.firstName || !body.lastName) {
            return reply.code(400).send({
                error: "firstName a lastName sú povinné",
            });
        }
        const user = await getCurrentUser(request);
        if (!user) {
            return reply.code(401).send({
                error: "Nie ste prihlásený",
            });
        }
        const client = await prisma.client.create({
            data: {
                userId: user.id,
                firstName: body.firstName,
                lastName: body.lastName,
                dateOfBirth: body.dateOfBirth
                    ? new Date(body.dateOfBirth)
                    : null,
                sex: body.sex ?? "NOT_SPECIFIED",
                email: body.email?.trim() || null,
                phone: body.phone?.trim() || null,
                notes: body.notes?.trim() || null,
            },
        });
        return reply.code(201).send(client);
    });
    // ==========================================================
    // UPDATE CLIENT
    // ==========================================================
    server.put("/api/clients/:id", async (request, reply) => {
        const { id } = request.params;
        const body = request.body;
        if (!body.firstName || !body.lastName) {
            return reply.code(400).send({
                error: "firstName a lastName sú povinné",
            });
        }
        const user = await getCurrentUser(request);
        if (!user) {
            return reply.code(401).send({
                error: "Nie ste prihlásený",
            });
        }
        const client = await prisma.client.findFirst({
            where: {
                id,
                userId: user.id,
            },
        });
        if (!client) {
            return reply.code(404).send({
                error: "Klient neexistuje",
            });
        }
        const updatedClient = await prisma.client.update({
            where: {
                id: client.id,
            },
            data: {
                firstName: body.firstName.trim(),
                lastName: body.lastName.trim(),
                dateOfBirth: body.dateOfBirth
                    ? new Date(body.dateOfBirth)
                    : null,
                sex: body.sex ?? "NOT_SPECIFIED",
                email: body.email?.trim() || null,
                phone: body.phone?.trim() || null,
                notes: body.notes?.trim() || null,
            },
        });
        return updatedClient;
    });
    // ==========================================================
    // GET ACTIVE QUESTIONNAIRES
    // ==========================================================
    server.get("/api/questionnaires", async (request, reply) => {
        const user = await getCurrentUser(request);
        if (!user) {
            return reply.code(401).send({
                error: "Nie ste prihlásený",
            });
        }
        const questionnaires = await prisma.questionnaire.findMany({
            where: {
                status: "ACTIVE",
            },
            include: {
                versions: {
                    orderBy: {
                        version: "desc",
                    },
                    take: 1,
                    include: {
                        questions: {
                            orderBy: {
                                order: "asc",
                            },
                        },
                    },
                },
            },
            orderBy: {
                name: "asc",
            },
        });
        return questionnaires;
    });
    // ==========================================================
    // CREATE QUESTIONNAIRE ADMINISTRATION - TABLET
    // ==========================================================
    server.post("/api/clients/:clientId/administrations", async (request, reply) => {
        const { clientId } = request.params;
        const body = request.body;
        if (!body.questionnaireVersionId) {
            return reply.code(400).send({
                error: "Verzia dotazníka je povinná",
            });
        }
        // ------------------------------------------------------
        // PRIHLÁSENÝ POUŽÍVATEĽ
        // ------------------------------------------------------
        const user = await getCurrentUser(request);
        if (!user) {
            return reply.code(401).send({
                error: "Nie ste prihlásený",
            });
        }
        // ------------------------------------------------------
        // KLIENT
        // ------------------------------------------------------
        const client = await prisma.client.findFirst({
            where: {
                id: clientId,
                userId: user.id,
            },
        });
        if (!client) {
            return reply.code(404).send({
                error: "Klient neexistuje",
            });
        }
        // ------------------------------------------------------
        // VERZIA DOTAZNÍKA
        // ------------------------------------------------------
        const questionnaireVersion = await prisma.questionnaireVersion.findUnique({
            where: {
                id: body.questionnaireVersionId,
            },
            include: {
                questionnaire: true,
            },
        });
        if (!questionnaireVersion) {
            return reply.code(404).send({
                error: "Verzia dotazníka neexistuje",
            });
        }
        if (questionnaireVersion.questionnaire.status !==
            "ACTIVE") {
            return reply.code(400).send({
                error: "Dotazník nie je aktívny",
            });
        }
        // ------------------------------------------------------
        // VEK KLIENTA
        // ------------------------------------------------------
        let ageAtAdministration = null;
        if (client.dateOfBirth) {
            const birth = new Date(client.dateOfBirth);
            const today = new Date();
            ageAtAdministration =
                today.getFullYear() -
                    birth.getFullYear();
            const monthDiff = today.getMonth() -
                birth.getMonth();
            if (monthDiff < 0 ||
                (monthDiff === 0 &&
                    today.getDate() < birth.getDate())) {
                ageAtAdministration--;
            }
        }
        // ------------------------------------------------------
        // VYTVORENIE ADMINISTRÁCIE
        // ------------------------------------------------------
        const administration = await prisma.administration.create({
            data: {
                clientId: client.id,
                questionnaireVersionId: questionnaireVersion.id,
                mode: "TABLET",
                status: "CREATED",
                ageAtAdministration,
                sexAtAdministration: client.sex,
            },
            include: {
                questionnaireVersion: {
                    include: {
                        questionnaire: true,
                        questions: {
                            orderBy: {
                                order: "asc",
                            },
                            include: {
                                options: {
                                    orderBy: {
                                        order: "asc",
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });
        return reply.code(201).send(administration);
    });
    // ==========================================================
    // GET EXAMINATIONS FOR CLIENT
    // ==========================================================
    server.get("/api/clients/:clientId/examinations", async (request, reply) => {
        const { clientId } = request.params;
        // ------------------------------------------------------
        // OVERENIE PRIHLÁSENÉHO POUŽÍVATEĽA
        // ------------------------------------------------------
        const user = await getCurrentUser(request);
        if (!user) {
            return reply.code(401).send({
                error: "Nie ste prihlásený",
            });
        }
        // ------------------------------------------------------
        // OVERENIE, ŽE KLIENT PATRÍ TOMUTO POUŽÍVATEĽOVI
        // ------------------------------------------------------
        const client = await prisma.client.findFirst({
            where: {
                id: clientId,
                userId: user.id,
            },
        });
        if (!client) {
            return reply.code(404).send({
                error: "Klient neexistuje",
            });
        }
        // ------------------------------------------------------
        // NAČÍTANIE VYŠETRENÍ
        // ------------------------------------------------------
        const examinations = await prisma.examination.findMany({
            where: {
                clientId: client.id,
            },
            orderBy: {
                date: "desc",
            },
        });
        return examinations;
    });
    // ==========================================================
    // CREATE EXAMINATION
    // ==========================================================
    server.post("/api/clients/:clientId/examinations", async (request, reply) => {
        const { clientId } = request.params;
        const body = request.body;
        // ------------------------------------------------------
        // VALIDÁCIA
        // ------------------------------------------------------
        if (!body.date || !body.type) {
            return reply.code(400).send({
                error: "Dátum a typ vyšetrenia sú povinné",
            });
        }
        // ------------------------------------------------------
        // OVERENIE PRIHLÁSENÉHO POUŽÍVATEĽA
        // ------------------------------------------------------
        const user = await getCurrentUser(request);
        if (!user) {
            return reply.code(401).send({
                error: "Nie ste prihlásený",
            });
        }
        // ------------------------------------------------------
        // OVERENIE, ŽE KLIENT PATRÍ TOMUTO POUŽÍVATEĽOVI
        // ------------------------------------------------------
        const client = await prisma.client.findFirst({
            where: {
                id: clientId,
                userId: user.id,
            },
        });
        if (!client) {
            return reply.code(404).send({
                error: "Klient neexistuje",
            });
        }
        // ------------------------------------------------------
        // VYTVORENIE VYŠETRENIA
        // ------------------------------------------------------
        const examination = await prisma.examination.create({
            data: {
                clientId: client.id,
                date: new Date(body.date),
                type: body.type.trim(),
                status: body.status ?? "PLANNED",
                notes: body.notes?.trim() || null,
            },
        });
        return reply.code(201).send(examination);
    });
    // ==========================================================
    // START SERVER
    // ==========================================================
    try {
        await server.listen({
            port: 3000,
            host: "0.0.0.0",
        });
    }
    catch (error) {
        server.log.error(error);
        process.exit(1);
    }
}
start();
//# sourceMappingURL=server.js.map