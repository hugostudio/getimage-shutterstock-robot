import { Router } from "express";
import * as dotenv from "dotenv";
import apiRouter from "../api";
import { queueMonitorAdapter } from "../service/queueService";

dotenv.config();

const router = Router();
router.use("/api", apiRouter);
router.use(`/${process.env.QUEUE_URI_MONITOR}`, queueMonitorAdapter.getRouter());

export default router;
