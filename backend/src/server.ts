import Fastify from "fastify";
import cors from "@fastify/cors";
import bcrypt from "bcrypt";
import { prisma } from "./db.js";

const server = Fastify({
  logger: true,
});

async function getTestUser() {
  const user = await prisma.user.findUnique({
    where: {
      email: "psycholog@test.sk",
    },
  });

  return user;
}

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
  // LOGIN
  // ==========================================================

  server.post("/api/auth/login", async (request, reply) => {
    const body = request.body as {
      email: string;
      password: string;
    };

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

    const passwordValid = await bcrypt.compare(
      body.password,
      user.passwordHash
    );

    if (!passwordValid) {
      return reply.code(401).send({
        error: "Nesprávny email alebo heslo",
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
  // GET CLIENTS
  // ==========================================================

  server.get("/api/clients", async (request, reply) => {
    const user = await getTestUser();

    if (!user) {
      return reply.code(500).send({
        error: "Testovací používateľ neexistuje",
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

    const user = await getTestUser();

    if (!user) {
      return reply.code(500).send({
        error: "Testovací používateľ neexistuje",
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