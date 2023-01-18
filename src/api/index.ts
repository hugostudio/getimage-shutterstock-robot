import { Router } from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import countRouter from "./count";

dotenv.config();

const apiRouter = Router();
apiRouter.use(bodyParser.json({ limit: process.env.PARSER_JSON_LIMIT }));
apiRouter.use("/count", countRouter);

export default apiRouter;
