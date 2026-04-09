import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

const paymentReturnMiddleware = () => {
  const handle = (req: any, res: any, next: any) => {
    const url = typeof req.url === "string" ? req.url : "";
    if (req.method !== "POST") return next();
    if (!url.startsWith("/order-success")) return next();

    let body = "";
    req.on("data", (chunk: any) => {
      body += chunk?.toString?.() ?? "";
      if (body.length > 256_000) req.destroy();
    });
    req.on("end", () => {
      const base = new URL(url, "http://local.dev");
      const params = new URLSearchParams(base.search);

      const contentType = String(req.headers?.["content-type"] || "").toLowerCase();
      const add = (k: string, v: unknown) => {
        if (!k) return;
        if (v === undefined || v === null) return;
        const value = String(v);
        if (!value) return;
        if (!params.has(k)) params.set(k, value);
      };

      try {
        if (contentType.includes("application/json")) {
          const parsed = JSON.parse(body || "{}");
          if (parsed && typeof parsed === "object") {
            Object.entries(parsed).forEach(([k, v]) => add(k, v));
          }
        } else {
          const parsed = new URLSearchParams(body);
          const allowed = new Set([
            "status",
            "payment_status",
            "txn_status",
            "result",
            "response",
            "txnid",
            "easepayid",
            "error",
            "errormessage",
            "amount",
            "mode",
            "name_on_card",
          ]);
          parsed.forEach((v, k) => {
            if (allowed.has(k.toLowerCase())) add(k, v);
          });
        }
      } catch {
        // ignore body parsing errors
      }

      const location = `${base.pathname}?${params.toString()}`;
      res.statusCode = 303;
      res.setHeader("Location", location);
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.end(`<html><head><meta http-equiv="refresh" content="0;url=${location}"></head><body>Redirecting...</body></html>`);
    });
  };

  return {
    name: "payment-return-middleware",
    configureServer(server: any) {
      server.middlewares.use(handle);
    },
    configurePreviewServer(server: any) {
      server.middlewares.use(handle);
    },
  };
};

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [paymentReturnMiddleware(), react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core"],
  },
}));
