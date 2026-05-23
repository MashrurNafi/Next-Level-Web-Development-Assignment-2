import type { JwtPayload } from "jsonwebtoken";
import { pool } from "../../db";
import type { IIssues } from "./issues.interface";

const createIssueIntoDB = async (payload: IIssues, user: JwtPayload) => {
  const { title, description, type, status } = payload;

  const result = await pool.query(
    `
      INSERT INTO issues (title, description, type, status, reporter_id) VALUES ($1,$2,$3,$4,$5) 
      RETURNING *
    `,
    [title, description, type, status, user.id],
  );

  return result;
};

const getAllIssuesFromDB = async () => {
  const result = await pool.query(`
      SELECT * FROM issues
    `);
  return result;
};

const getReporterInfoFromDB = async (id: number) => {
  const result = await pool.query(
    `
      SELECT id,name,role FROM users WHERE id=$1
    `,
    [id],
  );
  return result;
};

const getSingleIssueFromDB = async(id: string) => {
  const result = await pool.query(`
      SELECT * FROM issues WHERE id=$1
    `,[id])

  return result;
}

export const issuesService = {
  createIssueIntoDB,
  getAllIssuesFromDB,
  getReporterInfoFromDB,
  getSingleIssueFromDB
};
