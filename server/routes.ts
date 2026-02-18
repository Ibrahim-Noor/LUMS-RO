import type { Express } from "express";
import { type Server } from "http";
import http from "http";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.all("/api/{*path}", (req, res) => {
    const options: http.RequestOptions = {
      hostname: "127.0.0.1",
      port: 5001,
      path: req.originalUrl,
      method: req.method,
      headers: { ...req.headers, host: "127.0.0.1:5001" },
    };

    const proxyReq = http.request(options, (proxyRes) => {
      res.writeHead(proxyRes.statusCode || 500, proxyRes.headers);
      proxyRes.pipe(res, { end: true });
    });

    proxyReq.on("error", (err) => {
      console.error("Proxy error:", err.message);
      if (!res.headersSent) {
        res.status(502).json({ message: "Backend unavailable" });
      }
    });

    req.pipe(proxyReq, { end: true });
  });

  return httpServer;
}
