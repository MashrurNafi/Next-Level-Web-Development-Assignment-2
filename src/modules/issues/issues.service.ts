import type { JwtPayload } from "jsonwebtoken";
import { pool } from "../../db";
import type { IIssues } from "./issues.interface";

const createIssueIntoDB = async (payload: IIssues, user: JwtPayload) => {
  const { title, description, type } = payload;

  const result = await pool.query(
    `
      INSERT INTO issues (title, description, type, reporter_id) VALUES ($1,$2,$3,$4) 
      RETURNING *
    `,
    [title, description, type, user.id]
  );

  return result;
};

export const issuesService = {
  createIssueIntoDB,
};
