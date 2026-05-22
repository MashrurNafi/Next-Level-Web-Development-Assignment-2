import {Pool} from "pg";
import config from "../config";

export const pool = new Pool({
  connectionString: config.connectionString,
})

export const initDB = async() => {
  try {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS users(
        id SERIAL PRIMARY KEY,
        name VARCHAR(25) NOT NULL,
        email VARCHAR(25) UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role VARCHAR(15) DEFAULT 'contributor' CHECK (role IN ('contributor', 'maintainer')),

        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
        )
      `)

      await pool.query(`
          CREATE TABLE IF NOT EXISTS issues(
          id SERIAL PRIMARY KEY,
          title VARCHAR(150) NOT NULL,
          description VARCHAR(20) NOT NULL,
          type VARCHAR(15) CHECK (type IN ('bug', 'feature_request')),
          status VARCHAR(11) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved')),
          reporter_id INT NOT NULL,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
          )
        `);
        console.log("Database Connected Successfully!");
  } catch (error) {
    console.log(error);
  }
}