import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { randomUUID } from "crypto";
import { mkdirSync } from "fs";
import { resolve } from "path";
import { DataSource } from "typeorm";
import { SystemEventLog } from "./system-logs/entities/system-event-log.entity";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const dataSource = app.get(DataSource);
  const logRepository = dataSource.getRepository(SystemEventLog);
  const config = app.get(ConfigService);
  const configuredCorsOrigins = config
    .get<string>("CORS_ORIGINS")
    ?.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
  const corsOrigins = configuredCorsOrigins && configuredCorsOrigins.length > 0 ? configuredCorsOrigins : [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:5173",
    "http://localhost:4173",
    "http://localhost:5174",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:4173",
    "http://127.0.0.1:5174",
  ];
  const imageStoragePath = config.get<string>("IMAGE_STORAGE_PATH") ?? "uploads";

  app.setGlobalPrefix("api/v1");
  app.use((req: { headers?: Record<string, string | string[] | undefined>; method?: string }, res: { setHeader: (name: string, value: string) => void; status: (code: number) => { send: () => void } }, next: () => void) => {
    const origin = typeof req.headers?.origin === "string" ? req.headers.origin : undefined;
    if (origin && corsOrigins.includes(origin)) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Access-Control-Allow-Credentials", "true");
      res.setHeader("Vary", "Origin");
      res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, X-Request-Id");
    }

    if ((req.method ?? "GET") === "OPTIONS") {
      return res.status(204).send();
    }

    next();
  });
  app.use((req: { method?: string; originalUrl?: string; headers?: Record<string, string | string[] | undefined>; ip?: string }, res: { on: (event: string, listener: () => void) => void; setHeader: (name: string, value: string) => void; statusCode?: number }, next: () => void) => {
    const startedAt = Date.now();
    const requestId = typeof req.headers?.["x-request-id"] === "string" ? req.headers["x-request-id"] : randomUUID();
    res.setHeader("X-Request-Id", requestId);
    res.on("finish", () => {
      const durationMs = Date.now() - startedAt;
      console.log(`[${new Date().toISOString()}] ${req.method ?? "GET"} ${req.originalUrl ?? "/"} ${durationMs}ms`);
      void logRepository
        .save(
          logRepository.create({
            eventType: (res.statusCode ?? 200) >= 400 ? "API_ERROR" : "API_REQUEST",
            requestId,
            httpMethod: req.method ?? "GET",
            path: req.originalUrl ?? "/",
            statusCode: res.statusCode,
            message: `${req.method ?? "GET"} ${req.originalUrl ?? "/"} completed in ${durationMs}ms`,
            metadata: {
              durationMs,
              ip: req.ip,
              userAgent: typeof req.headers?.["user-agent"] === "string" ? req.headers["user-agent"] : undefined,
            },
          }),
        )
        .catch((error: unknown) => {
          console.error("Failed to persist request log", error);
        });
    });
    next();
  });
  const resolvedImageStoragePath = resolve(process.cwd(), imageStoragePath);
  mkdirSync(resolvedImageStoragePath, { recursive: true });
  app.useStaticAssets(resolvedImageStoragePath, { prefix: "/uploads/" });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.enableShutdownHooks();

  await app.listen(config.get<number>("PORT") ?? 8080);
}

void bootstrap();
