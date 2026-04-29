const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const config = {
  port: Number(process.env.PORT || 4000),
  dbClient: process.env.DB_CLIENT || "mysql",
  databaseUrl: process.env.DATABASE_URL,
  mysqlHost: process.env.MYSQL_HOST || "localhost",
  mysqlPort: Number(process.env.MYSQL_PORT || 3306),
  mysqlUser: process.env.MYSQL_USER || "root",
  mysqlPassword: process.env.MYSQL_PASSWORD || "",
  mysqlDatabase: process.env.MYSQL_DATABASE || "rally_board",
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:5173",
};

if (config.dbClient === "postgres" && !config.databaseUrl) {
  throw new Error("DATABASE_URL is required when DB_CLIENT=postgres.");
}

module.exports = config;

