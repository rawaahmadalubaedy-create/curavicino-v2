import { Router, type IRouter } from "express";
import { HealthCheckResponse } from "@workspace/api-zod";
import { realtime } from "../lib/realtime";

const router: IRouter = Router();

router.get("/healthz", (_req, res) => {
  const data = HealthCheckResponse.parse({ status: "ok" });
  res.json({ ...data, wsConnections: realtime.connectionCount });
});

export default router;
