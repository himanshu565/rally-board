const config = require("../config");

let mysqlPool = null;
let pgPool = null;

if (config.dbClient === "postgres") {
  const { Pool } = require("pg");
  pgPool = new Pool({
    connectionString: config.databaseUrl,
  });
} else {
  const mysql = require("mysql2/promise");
  mysqlPool = mysql.createPool({
    host: config.mysqlHost,
    port: config.mysqlPort,
    user: config.mysqlUser,
    password: config.mysqlPassword,
    database: config.mysqlDatabase,
    waitForConnections: true,
    connectionLimit: 10,
    multipleStatements: true,
  });
}

function toMysqlSql(sql) {
  return sql.replace(/\$\d+/g, "?");
}

async function query(sql, params = []) {
  if (pgPool) {
    const result = await pgPool.query(sql, params);
    return {
      rows: result.rows,
      rowCount: result.rowCount,
      insertId: null,
      affectedRows: result.rowCount,
    };
  }

  const [rows] = await mysqlPool.query(toMysqlSql(sql), params);
  if (Array.isArray(rows)) {
    return {
      rows,
      rowCount: rows.length,
      insertId: null,
      affectedRows: rows.length,
    };
  }

  return {
    rows: [],
    rowCount: rows.affectedRows ?? 0,
    insertId: rows.insertId ?? null,
    affectedRows: rows.affectedRows ?? 0,
  };
}

async function end() {
  if (pgPool) {
    await pgPool.end();
    return;
  }
  await mysqlPool.end();
}

module.exports = {
  query,
  end,
};
