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

const getAllIssues = async (req: Request, res: Response) => {
  try {
    const result = await issuesService.getAllIssuesFromDB();

    const sort = (req.query.sort as string) || "newest";
    const { type, status } = req.query;

    let sortedResult = [];

    if (sort === "newest") {
      sortedResult = result.rows.sort((a, b) => b.created_at - a.created_at);
    } else if (sort === "oldest") {
      sortedResult = result.rows.sort((a, b) => a.created_at - b.created_at);
    }

    if (type !== undefined) {
      sortedResult = sortedResult.filter((item) => item.type === type);
    }

    if (status !== undefined) {
      sortedResult = sortedResult.filter((item) => item.status === status);
    }

    const resultWithReporterInfo = await Promise.all(
      sortedResult.map(async (item) => {
        const { reporter_id, created_at, updated_at, ...rest } = item;
        const reporterInfo =
          await issuesService.getReporterInfoFromDB(reporter_id);
        const reporter = reporterInfo.rows[0];

        return {
          ...rest,
          reporter,
          created_at,
          updated_at,
        };
      }),
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      data: resultWithReporterInfo,
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

const getSingleIssue = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await issuesService.getSingleIssueFromDB(id as string);

    const { reporter_id, created_at, updated_at, ...rest } = result.rows[0];
    const reporterInfo = await issuesService.getReporterInfoFromDB(reporter_id);
    const reporter = reporterInfo.rows[0];
    const resultWithReporterInfo = {
      ...rest,
      reporter,
      created_at,
      updated_at,
    };

    sendResponse(res, {
      statusCode: 200,
      success: true,
      data: resultWithReporterInfo,
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

const deleteIssue = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await issuesService.deleteIssueFromDB(id as string);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Issue deleted successfully",
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

const updateIssue = async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = req.user as IUserJwtPayload;
  try {
    if (user.role === "maintainer") {
      const result = await issuesService.updateIssueFromDB(
        req.body,
        id as string,
      );

      sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Issue updated successfully",
        data: result.rows[0],
      });
    } else if (user.role === "contributor") {
      const issue = await issuesService.getSingleIssueFromDB(id as string);
      const reporterId = issue.rows[0].reporter_id;
      const { status } = issue.rows[0];
      if (user.id !== reporterId && status !== "open") {
        throw new Error("Unauthorized Access!");
      } else {
        const result = await issuesService.updateIssueFromDB(
          req.body,
          id as string,
        );

        sendResponse(res, {
          statusCode: 200,
          success: true,
          message: "Issue updated successfully",
          data: result.rows[0],
        });
      }
    }
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
  getAllIssues,
  getSingleIssue,
  deleteIssue,
  updateIssue
};
