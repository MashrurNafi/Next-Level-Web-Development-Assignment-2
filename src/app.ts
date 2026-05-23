import express, { type Request, type Response } from "express";
import type { Application } from "express-serve-static-core";
import { userRoute } from "./modules/user/user.route";
import { authRoute } from "./modules/auth/auth.route";
import { issuesRoute } from "./modules/issues/issues.route";
import cors from "cors";
import logger from "./middleware/logger";
import sendResponse from "./utility/sendResponse";

const app: Application = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(logger);

app.use(
  cors({
    origin: "http://localhost:5000",
  }),
);

app.get("/", (req: Request, res: Response) => {
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Devpulse",
  });
});

app.use("/api/auth/signup", userRoute);
app.use("/api/auth/login", authRoute);
app.use("/api/issues", issuesRoute);

export default app;
