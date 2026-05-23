import { type JwtPayload } from "jsonwebtoken";
export interface IIssues {
  title: string;
  description: string;
  type: string;
  status?: string;
}

export interface IUserJwtPayload extends JwtPayload{
  id: number;
  name: string;
  email:string;
  role: string;
}