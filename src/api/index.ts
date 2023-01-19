import { Router } from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import getImageRouter from "./robot/robot.controller";


dotenv.config();

const apiRouter = Router();
apiRouter.use(bodyParser.json({ limit: process.env.PARSER_JSON_LIMIT }));
apiRouter.use("/get-image", getImageRouter);

export default apiRouter;
