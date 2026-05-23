import { Router } from "express";
import auth from "../../middleware/auth";
import { USER_ROLES } from "../../types";
import { issuesController } from "./issues.controller";
import { authController } from "../auth/auth.controller";

const router = Router();

router.post(
  "/",
  auth(USER_ROLES.contributer, USER_ROLES.maintainer),
  issuesController.createIssue,
);

router.get("/", issuesController.getAllIssues);
router.get("/:id", issuesController.getSingleIssue);

export const issuesRoute = router;
