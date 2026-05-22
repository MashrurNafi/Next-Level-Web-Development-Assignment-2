import type { NextFunction, Request, Response } from "express";
import type { ROLES } from "../types";
import sendResponse from "../utility/sendResponse";
import jwt, { type JwtPayload } from "jsonwebtoken";
import config from "../config";
import { pool } from "../db";

const auth = (...roles: ROLES[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.headers.authorization;
      if (!token) {
        sendResponse(res, {
          statusCode: 401,
          success: false,
          message: "Unauthorized Access",
        });
      }

      const decoded = jwt.verify(
        token as string,
        config.secret as string,
      ) as JwtPayload;


      const userData = await pool.query(
        `
          SELECT * FROM users WHERE email=$1
        `,
        [decoded.email],
      );

      if (userData.rows.length === 0) {
        sendResponse(res, {
          statusCode: 403,
          success: false,
          message: "Forbidden!",
        });
      }

      const user = userData.rows[0];

      if (roles.length && !roles.includes(user.role)) {
        sendResponse(res, {
          statusCode: 403,
          success: false,
          message: "Forbidden: Unauthorized Access",
        });
      }

      req.user = decoded;
      console.log(req.body);

      next();
    } catch (error) {
      next(error);
    }
  };
};


export default auth;