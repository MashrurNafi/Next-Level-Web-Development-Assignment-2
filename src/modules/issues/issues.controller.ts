import type { Request, Response } from "express";
import { issuesService } from "./issues.service";
import sendResponse from "../../utility/sendResponse";
import type { IUserJwtPayload } from "./issues.interface";

const createIssue = async (req: Request, res: Response) => {
  try {
    const user = req.user as IUserJwtPayload;
    const result = await issuesService.createIssueIntoDB(req.body, user);

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Issue created Successfully",
      data: result.rows[0],
    });
  } catch (error: any) {
    sendResponse(res, {
      statusCode: 500,
      success: false,
      message: error.message,
      error: error,
    });
  }
};

export const issuesController = {
  createIssue,
};
