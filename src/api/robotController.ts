
import { Request, Response, Router } from "express";
//import { defaultQueue } from "../service/index";
import RobotService from '../service/robotService';

const getImageRouter = Router();

// getImageRouter.post("/by-queue", (req: Request, res: Response) => {
//   const param = req.body;
//   defaultQueue.add(QUEUE_NAME, param);
//   res.json({ ok: true });
// });

getImageRouter.post("/by-now", async (req: Request, res: Response) => {
  let result : any;
  const param = req.body;
  result = await RobotService.execute(param);  
  await RobotService.deleteAllTempArchive();
  res.set('Content-Type','application/octet-stream');
  res.set('Content-Disposition',`attachment; filename=${result.fileName}`);
  res.set('Content-Length',result.data.length);
  res.send(result.data);
});

export default getImageRouter;
