"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/app.ts
var import_express4 = __toESM(require("express"));

// src/modules/user/user.route.ts
var import_express = require("express");

// src/modules/user/user.service.ts
var import_bcryptjs = __toESM(require("bcryptjs"));

// src/db/index.ts
var import_pg = require("pg");

// src/config/index.ts
var import_dotenv = __toESM(require("dotenv"));
var import_path = __toESM(require("path"));
import_dotenv.default.config({
  path: import_path.default.join(process.cwd(), ".env")
});
var config = {
  port: process.env.PORT,
  connectionString: process.env.CONNECTIONSTRING,
  secret: process.env.JWT_SECRET
};
var config_default = config;

// src/db/index.ts
var pool = new import_pg.Pool({
  connectionString: config_default.connectionString
});
var initDB = async () => {
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
      `);
    await pool.query(`
          CREATE TABLE IF NOT EXISTS issues(
          id SERIAL PRIMARY KEY,
          title VARCHAR(150) NOT NULL,
          description VARCHAR(100) NOT NULL,
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
};

// src/modules/user/user.service.ts
var createUserIntoDB = async (payload) => {
  if (!payload) {
    throw new Error("Payload is missing");
  }
  const { name, email, password, role } = payload;
  const hashPassword = await import_bcryptjs.default.hash(password, 10);
  const result = await pool.query(
    `
      INSERT INTO users (name,email,password,role) VALUES ($1,$2,$3,COALESCE($4, 'user'))
      RETURNING * 
    `,
    [name, email, hashPassword, role]
  );
  delete result.rows[0].password;
  return result;
};
var userService = {
  createUserIntoDB
};

// src/utility/sendResponse.ts
var sendResponse = (res, data) => {
  res.status(data.statusCode).json({
    success: data.success,
    message: data.message,
    data: data.data,
    error: data.error
  });
};
var sendResponse_default = sendResponse;

// src/modules/user/user.controller.ts
var createUser = async (req, res) => {
  try {
    const result = await userService.createUserIntoDB(req.body);
    sendResponse_default(res, {
      statusCode: 201,
      success: true,
      message: "User registered successfully",
      data: result.rows[0]
    });
  } catch (error) {
    sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: error.message,
      error
    });
  }
};
var userController = {
  createUser
};

// src/modules/user/user.route.ts
var router = (0, import_express.Router)();
router.post("/", userController.createUser);
var userRoute = router;

// src/modules/auth/auth.route.ts
var import_express2 = require("express");

// src/modules/auth/auth.service.ts
var import_bcryptjs2 = __toESM(require("bcryptjs"));
var import_jsonwebtoken = __toESM(require("jsonwebtoken"));
var loginUserIntoDB = async (payload) => {
  const { email, password } = payload;
  const userData = await pool.query(
    `
      SELECT * FROM users WHERE email=$1
    `,
    [email]
  );
  if (userData.rows.length === 0) {
    throw new Error("Invalid Credentials");
  }
  const user = userData.rows[0];
  const matchPassword = await import_bcryptjs2.default.compare(password, user.password);
  if (!matchPassword) {
    throw new Error("Invalid Credentials!");
  }
  const jwtpayload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  };
  const accessToken = import_jsonwebtoken.default.sign(jwtpayload, config_default.secret, {
    expiresIn: "1d"
  });
  return { accessToken };
};
var authService = {
  loginUserIntoDB
};

// src/modules/auth/auth.controller.ts
var loginUser = async (req, res) => {
  try {
    const result = await authService.loginUserIntoDB(req.body);
    sendResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "Login Successfully",
      data: result
    });
  } catch (error) {
    sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: error.message,
      error
    });
  }
};
var authController = {
  loginUser
};

// src/modules/auth/auth.route.ts
var router2 = (0, import_express2.Router)();
router2.post("/", authController.loginUser);
var authRoute = router2;

// src/modules/issues/issues.route.ts
var import_express3 = require("express");

// src/middleware/auth.ts
var import_jsonwebtoken2 = __toESM(require("jsonwebtoken"));
var auth = (...roles) => {
  return async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      if (!token) {
        sendResponse_default(res, {
          statusCode: 401,
          success: false,
          message: "Unauthorized Access"
        });
      }
      const decoded = import_jsonwebtoken2.default.verify(
        token,
        config_default.secret
      );
      const userData = await pool.query(
        `
          SELECT * FROM users WHERE email=$1
        `,
        [decoded.email]
      );
      if (userData.rows.length === 0) {
        sendResponse_default(res, {
          statusCode: 403,
          success: false,
          message: "Forbidden!"
        });
      }
      const user = userData.rows[0];
      if (roles.length && !roles.includes(user.role)) {
        sendResponse_default(res, {
          statusCode: 403,
          success: false,
          message: "Forbidden: Unauthorized Access"
        });
      }
      req.user = decoded;
      next();
    } catch (error) {
      next(error);
    }
  };
};
var auth_default = auth;

// src/types/index.ts
var USER_ROLES = {
  contributer: "contributor",
  maintainer: "maintainer"
};

// src/modules/issues/issues.service.ts
var createIssueIntoDB = async (payload, user) => {
  const { title, description, type, status } = payload;
  const result = await pool.query(
    `
      INSERT INTO issues (title, description, type, status, reporter_id) VALUES ($1,$2,$3,$4,$5) 
      RETURNING *
    `,
    [title, description, type, status, user.id]
  );
  return result;
};
var getAllIssuesFromDB = async () => {
  const result = await pool.query(`
      SELECT * FROM issues
    `);
  return result;
};
var getReporterInfoFromDB = async (id) => {
  const result = await pool.query(
    `
      SELECT id,name,role FROM users WHERE id=$1
    `,
    [id]
  );
  return result;
};
var getSingleIssueFromDB = async (id) => {
  const result = await pool.query(
    `
      SELECT * FROM issues WHERE id=$1
    `,
    [id]
  );
  return result;
};
var deleteIssueFromDB = async (id) => {
  await pool.query(`DELETE FROM issues WHERE id=$1`, [id]);
};
var updateIssueFromDB = async (payload, id) => {
  const { title, description, type, status } = payload;
  const result = await pool.query(
    `
      UPDATE issues
      SET title = COALESCE($1,title),
      description = COALESCE($2,description),
      type = COALESCE($3,type),
      status = COALESCE($4, status)

      WHERE id=$5 RETURNING *
    `,
    [title, description, type, status, id]
  );
  return result;
};
var issuesService = {
  createIssueIntoDB,
  getAllIssuesFromDB,
  getReporterInfoFromDB,
  getSingleIssueFromDB,
  deleteIssueFromDB,
  updateIssueFromDB
};

// src/modules/issues/issues.controller.ts
var createIssue = async (req, res) => {
  try {
    const user = req.user;
    const result = await issuesService.createIssueIntoDB(req.body, user);
    sendResponse_default(res, {
      statusCode: 201,
      success: true,
      message: "Issue created Successfully",
      data: result.rows[0]
    });
  } catch (error) {
    sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: error.message,
      error
    });
  }
};
var getAllIssues = async (req, res) => {
  try {
    const result = await issuesService.getAllIssuesFromDB();
    const sort = req.query.sort || "newest";
    const { type, status } = req.query;
    let sortedResult = [];
    if (sort === "newest") {
      sortedResult = result.rows.sort((a, b) => b.created_at - a.created_at);
    } else if (sort === "oldest") {
      sortedResult = result.rows.sort((a, b) => a.created_at - b.created_at);
    }
    if (type !== void 0) {
      sortedResult = sortedResult.filter((item) => item.type === type);
    }
    if (status !== void 0) {
      sortedResult = sortedResult.filter((item) => item.status === status);
    }
    const resultWithReporterInfo = await Promise.all(
      sortedResult.map(async (item) => {
        const { reporter_id, created_at, updated_at, ...rest } = item;
        const reporterInfo = await issuesService.getReporterInfoFromDB(reporter_id);
        const reporter = reporterInfo.rows[0];
        return {
          ...rest,
          reporter,
          created_at,
          updated_at
        };
      })
    );
    sendResponse_default(res, {
      statusCode: 200,
      success: true,
      data: resultWithReporterInfo
    });
  } catch (error) {
    sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: error.message,
      error
    });
  }
};
var getSingleIssue = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await issuesService.getSingleIssueFromDB(id);
    const { reporter_id, created_at, updated_at, ...rest } = result.rows[0];
    const reporterInfo = await issuesService.getReporterInfoFromDB(reporter_id);
    const reporter = reporterInfo.rows[0];
    const resultWithReporterInfo = {
      ...rest,
      reporter,
      created_at,
      updated_at
    };
    sendResponse_default(res, {
      statusCode: 200,
      success: true,
      data: resultWithReporterInfo
    });
  } catch (error) {
    sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: error.message,
      error
    });
  }
};
var deleteIssue = async (req, res) => {
  const { id } = req.params;
  try {
    await issuesService.deleteIssueFromDB(id);
    sendResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "Issue deleted successfully"
    });
  } catch (error) {
    sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: error.message,
      error
    });
  }
};
var updateIssue = async (req, res) => {
  const { id } = req.params;
  const user = req.user;
  try {
    if (user.role === "maintainer") {
      const result = await issuesService.updateIssueFromDB(
        req.body,
        id
      );
      sendResponse_default(res, {
        statusCode: 200,
        success: true,
        message: "Issue updated successfully",
        data: result.rows[0]
      });
    } else if (user.role === "contributor") {
      const issue = await issuesService.getSingleIssueFromDB(id);
      const reporterId = issue.rows[0].reporter_id;
      const { status } = issue.rows[0];
      if (user.id !== reporterId && status !== "open") {
        throw new Error("Unauthorized Access!");
      } else {
        const result = await issuesService.updateIssueFromDB(
          req.body,
          id
        );
        sendResponse_default(res, {
          statusCode: 200,
          success: true,
          message: "Issue updated successfully",
          data: result.rows[0]
        });
      }
    }
  } catch (error) {
    sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: error.message,
      error
    });
  }
};
var issuesController = {
  createIssue,
  getAllIssues,
  getSingleIssue,
  deleteIssue,
  updateIssue
};

// src/modules/issues/issues.route.ts
var router3 = (0, import_express3.Router)();
router3.post(
  "/",
  auth_default(USER_ROLES.contributer, USER_ROLES.maintainer),
  issuesController.createIssue
);
router3.get("/", issuesController.getAllIssues);
router3.get("/:id", issuesController.getSingleIssue);
router3.delete("/:id", auth_default(USER_ROLES.maintainer), issuesController.deleteIssue);
router3.put("/:id", auth_default(USER_ROLES.contributer, USER_ROLES.maintainer), issuesController.updateIssue);
var issuesRoute = router3;

// src/app.ts
var import_cors = __toESM(require("cors"));

// src/middleware/logger.ts
var import_fs = __toESM(require("fs"));
var logger = (req, res, next) => {
  console.log("Method - URL - Time:", req.method, req.url, Date.now());
  const log = `Method -> ${req.method} Time -> ${Date.now()} URL -> ${req.url}
`;
  import_fs.default.appendFile("logger.txt", log, (err) => {
  });
  next();
};
var logger_default = logger;

// src/app.ts
var app = (0, import_express4.default)();
app.use(import_express4.default.json());
app.use(import_express4.default.urlencoded({ extended: true }));
app.use(logger_default);
app.use(
  (0, import_cors.default)({
    origin: "http://localhost:5000"
  })
);
app.get("/", (req, res) => {
  sendResponse_default(res, {
    statusCode: 200,
    success: true,
    message: "Devpulse"
  });
});
app.use("/api/auth/signup", userRoute);
app.use("/api/auth/login", authRoute);
app.use("/api/issues", issuesRoute);
var app_default = app;

// src/server.ts
var main = async () => {
  await initDB();
  app_default.listen(config_default.port, () => {
    console.log(`App is listening at port ${config_default.port}`);
  });
};
main();
//# sourceMappingURL=server.js.map