import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const countServer = {
  sum: async (valor: number) => {
    const objectKey = { id: 1 };
    const objCount = await prisma.count.findUnique({ where: objectKey });
    let soma = 0;
    if (objCount != null) {
      soma = valor + objCount.sum;
    }
    await prisma.count.update({
      where: objectKey,
      data: { sum: soma },
    });
    return soma;
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  workerSum: async (job: any) => {
    await job.log(`Processing jobId :${job.id}`);
    // eslint-disable-next-line no-param-reassign
    job.returnvalue = await countServer.sum(job.data.sum);
    await job.log(`Soma = ${job.returnvalue}`);
    return job.returnvalue;
  },
};

export default countServer;
