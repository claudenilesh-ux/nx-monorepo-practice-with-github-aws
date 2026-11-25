import express, { ErrorRequestHandler, RequestHandler } from "express";
import { clerkMiddleware, getAuth } from "@clerk/express";
import { isPublishableKey } from "@clerk/shared/keys";
import { requiredValue } from "@nx-learning/config";
import { loadExpressLocal } from "../config/load-local";
import {
  createProject,
  deleteProject,
  listProjects,
  ProjectError,
  renameProject,
} from "./projects.service";

loadExpressLocal();

export function projectsRouter() {
  const origin = requiredValue("CORS_ORIGIN", process.env.CORS_ORIGIN);
  const parsed = new URL(origin);
  if (
    !["http:", "https:"].includes(parsed.protocol) ||
    parsed.origin !== origin
  )
    throw new Error("Invalid CORS_ORIGIN");
  const publishableKey = requiredValue(
    "CLERK_PUBLISHABLE_KEY",
    process.env.CLERK_PUBLISHABLE_KEY,
  );
  const secretKey = requiredValue(
    "CLERK_SECRET_KEY",
    process.env.CLERK_SECRET_KEY,
  );
  if (
    !isPublishableKey(publishableKey) ||
    !/^sk_(test|live)_\S+$/.test(secretKey) ||
    publishableKey.split("_")[1] !== secretKey.split("_")[1]
  )
    throw new Error("Invalid Clerk configuration");
  const router = express.Router();
  router.use((req, res, next) => {
    res.set("Cache-Control", "no-store");
    res.vary("Origin");
    if (req.get("Origin") === origin) {
      res.set("Access-Control-Allow-Origin", origin);
      res.set(
        "Access-Control-Allow-Methods",
        "GET, POST, PATCH, DELETE, OPTIONS",
      );
      res.set("Access-Control-Allow-Headers", "Authorization, Content-Type");
    }
    if (req.method === "OPTIONS") {
      res.sendStatus(204);
      return;
    }
    next();
  });
  router.use((req, res, next) => {
    if (!/^Bearer\s+\S+$/i.test(req.get("Authorization") || "")) {
      res
        .status(401)
        .json({
          error: { code: "UNAUTHORIZED", message: "Authentication required" },
        });
      return;
    }
    delete req.headers.cookie;
    next();
  });
  router.use(
    clerkMiddleware({ publishableKey, secretKey, authorizedParties: [origin] }),
  );
  router.use((req, res, next) => {
    const auth = getAuth(req, { acceptsToken: "session_token" });
    if (!auth.isAuthenticated || !auth.userId) {
      res
        .status(401)
        .json({
          error: { code: "UNAUTHORIZED", message: "Authentication required" },
        });
      return;
    }
    res.locals.ownerId = auth.userId;
    next();
  });
  router.use(express.json({ limit: "16kb" }));
  const validId: RequestHandler = (req, _res, next) => {
    if (
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        String(req.params.projectId),
      )
    )
      return next(
        new ProjectError(400, "VALIDATION_ERROR", "Invalid project ID"),
      );
    next();
  };
  router.get("/", async (_req, res) => {
    res.json({ projects: await listProjects(res.locals.ownerId) });
  });
  router.post("/", async (req, res) => {
    res
      .status(201)
      .json({ project: await createProject(res.locals.ownerId, req.body) });
  });
  router.patch("/:projectId", validId, async (req, res) => {
    res.json({
      project: await renameProject(
        res.locals.ownerId,
        String(req.params.projectId),
        req.body,
      ),
    });
  });
  router.delete("/:projectId", validId, async (req, res) => {
    await deleteProject(res.locals.ownerId, String(req.params.projectId));
    res.status(204).end();
  });
  const errors: ErrorRequestHandler = (error: unknown, _req, res, _next) => {
    let status = 500,
      code = "INTERNAL_ERROR",
      message = "An unexpected error occurred";
    if (error instanceof ProjectError) ({ status, code, message } = error);
    else if (typeof error === "object" && error !== null) {
      const e = error as { type?: string; code?: string; name?: string };
      if (e.type === "entity.parse.failed") {
        status = 400;
        code = "VALIDATION_ERROR";
        message = "Invalid JSON";
      } else if (e.type === "entity.too.large") {
        status = 413;
        code = "PAYLOAD_TOO_LARGE";
        message = "Payload too large";
      } else if (e.code === "P2002") {
        status = 409;
        code = "SLUG_CONFLICT";
        message = "Project slug already exists";
      } else if (e.code === "P2025") {
        status = 404;
        code = "PROJECT_NOT_FOUND";
        message = "Project not found";
      } else if (
        ["P1001", "P1002", "P1017"].includes(e.code || "") ||
        e.name === "PrismaClientInitializationError"
      ) {
        status = 503;
        code = "DATABASE_UNAVAILABLE";
        message = "Database unavailable";
      }
    }
    res.status(status).json({ error: { code, message } });
  };
  router.use(errors);
  return router;
}
