import express, { type Express, type NextFunction, type Request, type Response } from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import pinoHttp from "pino-http";
import session from "express-session";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();
const requestBodyLimit = "10mb";

app.set("trust proxy", 1);

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

app.use(cors({
  origin: true,
  credentials: true,
}));

app.use(express.json({ limit: requestBodyLimit }));
app.use(express.urlencoded({ extended: true, limit: requestBodyLimit }));

const sessionSecret = process.env["SESSION_SECRET"];
if (!sessionSecret) {
  throw new Error("SESSION_SECRET environment variable is required");
}

app.use(session({
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 1000 * 60 * 60 * 24 * 7,
    sameSite: "lax",
  },
}));

app.use("/api", router);

if (process.env.NODE_ENV === "production") {
    const frontendDir = path.resolve(
      path.dirname(fileURLToPath(import.meta.url)),
      process.env["FRONTEND_DIST"] || "../../cdc-erp/dist/public",
    );

    app.use(express.static(frontendDir));

    app.use((req, res, next) => {
      if (req.path.startsWith("/api")) {
        res.status(404).json({ error: "Not found" });
        return;
      }
      if (!req.path.includes(".")) {
        res.sendFile(path.join(frontendDir, "index.html"));
        return;
      }
      next();
    });
  }

app.use((err: unknown, req: Request, res: Response, _next: NextFunction) => {
  logger.error(
    {
      err,
      cause: err instanceof Error ? err.cause : undefined,
      requestId: req.id,
      method: req.method,
      url: req.originalUrl,
    },
    "Unhandled request error",
  );

  res.status(500).json({ error: "Internal server error" });
});

export default app;
