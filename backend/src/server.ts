import Fastify from "fastify";
import cors from "@fastify/cors";
import { prisma } from "./db.js";

const server = Fastify({
  logger: true,
});

// Zatiaľ testovací psychológ.
// Neskôr ho nahradí userId získané z prihlásenia.
const TEST_USER_ID = "ed15ea12-26f2-47e5-a784-65c1f317f07b";

async function start() {
  await server.register(cors, {
    origin: true,
  });

  // ==========================================================
  // HEALTH CHECK
  // ==========================================================

  server.get("/api/health", async () => {
    return {
      status: "ok",
    };
  });

  // ==========================================================
  // GET CLIENTS
  // ==========================================================

  server.get("/api/clients", async () => {
    const clients = await prisma.client.findMany({
      where: {
        userId: TEST_USER_ID,
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
    const body = request.body as {
      firstName: string;
      lastName: string;
      dateOfBirth?: string;
      sex?: "MALE" | "FEMALE" | "OTHER" | "NOT_SPECIFIED";
    };

    if (!body.firstName || !body.lastName) {
      return reply.code(400).send({
        error: "firstName a lastName sú povinné",
      });
    }

    const client = await prisma.client.create({
      data: {
        userId: TEST_USER_ID,
        firstName: body.firstName,
        lastName: body.lastName,
        dateOfBirth: body.dateOfBirth
          ? new Date(body.dateOfBirth)
          : null,
        sex: body.sex ?? "NOT_SPECIFIED",
      },
    });

    return reply.code(201).send(client);
  });

  try {
    await server.listen({
      port: 3000,
      host: "0.0.0.0",
    });
  } catch (error) {
    server.log.error(error);
    process.exit(1);
  }
}

start();