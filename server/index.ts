import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import { spawn } from "child_process";

const app = express();
const httpServer = createServer(app);

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  if (process.env.NODE_ENV === "production") {
    log("Production mode: starting Flask on port 5000 directly");
    const pythonCmd = "python3";

    const flaskProcess = spawn(pythonCmd, ["run.py"], {
      stdio: ["ignore", "pipe", "pipe"],
      env: { ...process.env, FLASK_PORT: "5000", NODE_ENV: "production" },
    });

    flaskProcess.on("error", (err) => {
      log(`Failed to start Flask: ${err.message}`, "flask");
    });

    flaskProcess.stdout?.on("data", (data: Buffer) => {
      log(data.toString().trim(), "flask");
    });

    flaskProcess.stderr?.on("data", (data: Buffer) => {
      log(data.toString().trim(), "flask");
    });

    flaskProcess.on("exit", (code: number | null) => {
      log(`Flask process exited with code ${code}`, "flask");
      process.exit(code || 1);
    });

    process.on("exit", () => {
      flaskProcess.kill();
    });
  } else {
    await registerRoutes(httpServer, app);

    app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      console.error("Internal Server Error:", err);

      if (res.headersSent) {
        return next(err);
      }

      return res.status(status).json({ message });
    });

    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);

    const pythonCmd = "python3";
    log(`Starting Flask with: ${pythonCmd} run.py`, "flask");

    const flaskProcess = spawn(pythonCmd, ["run.py"], {
      stdio: ["ignore", "pipe", "pipe"],
      env: { ...process.env },
    });

    flaskProcess.on("error", (err) => {
      log(`Failed to start Flask: ${err.message}`, "flask");
    });

    flaskProcess.stdout?.on("data", (data: Buffer) => {
      log(data.toString().trim(), "flask");
    });

    flaskProcess.stderr?.on("data", (data: Buffer) => {
      log(data.toString().trim(), "flask");
    });

    flaskProcess.on("exit", (code: number | null) => {
      log(`Flask process exited with code ${code}`, "flask");
    });

    process.on("exit", () => {
      flaskProcess.kill();
    });

    const port = parseInt(process.env.PORT || "5000", 10);
    httpServer.listen(
      {
        port,
        host: "0.0.0.0",
      },
      () => {
        log(`serving on port ${port}`);
      },
    );
  }
})();
