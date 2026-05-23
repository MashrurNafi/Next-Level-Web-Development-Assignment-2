import express, { type Response } from "express";
import type { Application } from "express-serve-static-core";
import { userRoute } from "./modules/user/user.route";
import { authRoute } from "./modules/auth/auth.route";
import { issuesRoute } from "./modules/issues/issues.route";
import cors from "cors";

const app: Application = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
  origin: 'http://localhost:5000',
}));

app.get("/", (res: Response) => {
  res.status(200).json({
    message: "Next Level Assignment 2",
    author: "Mashrur",
  });
});

app.use("/api/auth/signup", userRoute);
app.use("/api/auth/login", authRoute);
app.use("/api/issues", issuesRoute);

export default app;
