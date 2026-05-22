import { Router } from "express";
import auth from "../../middleware/auth";
import { USER_ROLES } from "../../types";
import { issuesController } from "./issues.controller";

const router = Router();

router.post(
  "/",
  auth(USER_ROLES.contributer, USER_ROLES.maintainer),
  issuesController.createIssue,
);

export const issuesRoute = router;
