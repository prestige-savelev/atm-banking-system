import express, { type Express } from "express";
import router from "./routes.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import errorHandler from "./middlewares/error-handler.js";

const app: Express = express();
app.use(cookieParser());
app.use(cors({ credentials: true, origin: "*" }));
app.use(express.json());

app.use("/api", router);

export function startHttpServer() {
  app.listen(3000, () => {
    console.log(`Running a HTTP API server at http://localhost:3000/`);
  });
}

app.use(errorHandler());
