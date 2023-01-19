import { createBullBoard } from "@bull-board/api";
import { BullAdapter } from "@bull-board/api/bullAdapter";
import { ExpressAdapter } from "@bull-board/express";
import Bull from "bull";
import * as dotenv from "dotenv";
import robotServer from "./robotService";

dotenv.config();

export let defaultQueue: any;

const setupBullMQProcessor = async ( queueName: string, workJob: any, jobName?: string ) => {
  const objQueue = new Bull(queueName, {
    redis: { port: Number(process.env.REDIS_PORT), host: process.env.REDIS_HOST },
  });

  if(!jobName){ jobName = '*'; } 
  objQueue.process(jobName, async (job: any) => workJob(job.data));

  return objQueue;
};

export const queueMonitorAdapter = new ExpressAdapter();

const initQueueService = async () => {
  /**
   * Para adicionar uma nova fila
   *    novaFila = await setupBullMQProcessor('nome_da_fila', workerTeste);
   */
  defaultQueue = await setupBullMQProcessor(process.env.QUEUE_DEFAULT as string, robotServer.execute, process.env.QUEUE_DEFAULT);

  const filas = [new BullAdapter(defaultQueue)];

  queueMonitorAdapter.setBasePath(`/${process.env.QUEUE_URI_MONITOR}`);

  createBullBoard({ queues: filas, serverAdapter: queueMonitorAdapter });
};

const init = async () => {
  await initQueueService();
};

init().catch((e) => console.error(e));
