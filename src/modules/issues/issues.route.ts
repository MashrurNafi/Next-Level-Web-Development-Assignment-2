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
router.delete("/:id", auth(USER_ROLES.maintainer), issuesController.deleteIssue)
router.put("/:id", auth(USER_ROLES.contributer,USER_ROLES.maintainer), issuesController.updateIssue);

export const issuesRoute = router;
