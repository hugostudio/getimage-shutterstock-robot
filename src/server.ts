import express from "express";
import * as dotenv from "dotenv";
import router from "./router";

dotenv.config();

const run = async () => {
  const app = express();
  app.use(router);

  app.listen(process.env.HTTP_PORT, () => {
    console.log(
      `Para acessar a interface abra: http://localhost:${process.env.HTTP_PORT}/${process.env.QUEUE_URI_MONITOR}`,
    );
    console.log("Para testar a fila execute o script :");
    console.log("  teste/post-count-sum.rest");
  });
};

run().catch((e) => console.error(e));
