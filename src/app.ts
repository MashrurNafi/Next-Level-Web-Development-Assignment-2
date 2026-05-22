import express, { type Request, type Response } from "express";
import type { Application } from "express-serve-static-core";

const app: Application = express();

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    message: "Next Level Assignment 2",
    author: "Mashrur",
  });
});

export default app;
