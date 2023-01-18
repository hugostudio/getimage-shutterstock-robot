import { Request, Response, Router } from "express";
import { defaultQueue } from "../../service/index";

const countRouter = Router();

countRouter.post("/sum", (req: Request, res: Response) => {
  const param = req.body;
  defaultQueue.add('Sum', param);
  res.json({ ok: true });
});

export default countRouter;
