const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const config = require("./config");
const pool = require("./db/pool");

const app = express();

const STATUSES = ["Backlog", "In Progress", "Review", "Done"];
const PRIORITIES = ["Critical", "High", "Medium", "Low"];
const KINDS = ["Feature", "Bug", "Task"];

app.use(
  cors({
    origin: config.corsOrigin,
  }),
);
app.use(express.json());

function toIsoDate(value) {
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }
  return value;
}

function toDto(row) {
  return {
    id: row.id,
    code: row.code,
    title: row.title,
    points: row.points,
    ownerName: row.owner_name,
    ownerTag: row.owner_tag,
    priority: row.priority,
    kind: row.kind,
    dueDate: toIsoDate(row.due_date),
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function validateStoryBody(body, isUpdate = false) {
  const requiredFields = [
    "code",
    "title",
    "points",
    "ownerName",
    "ownerTag",
    "priority",
    "kind",
    "dueDate",
    "status",
  ];

  if (!isUpdate) {
    for (const field of requiredFields) {
      if (body[field] === undefined || body[field] === null || body[field] === "") {
        return `${field} is required`;
      }
    }
  }

  if (body.priority && !PRIORITIES.includes(body.priority)) {
    return "priority must be one of Critical, High, Medium, Low";
  }

  if (body.kind && !KINDS.includes(body.kind)) {
    return "kind must be one of Feature, Bug, Task";
  }

  if (body.status && !STATUSES.includes(body.status)) {
    return "status must be one of Backlog, In Progress, Review, Done";
  }

  if (body.points !== undefined && (!Number.isInteger(body.points) || body.points < 0)) {
    return "points must be an integer >= 0";
  }

  return null;
}

app.get("/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok", db: "connected" });
  } catch {
    res.status(500).json({ status: "error", db: "disconnected" });
  }
});

app.get("/api/stories", async (_req, res, next) => {
  try {
    const result = await pool.query(
      "SELECT * FROM stories ORDER BY created_at DESC, id DESC",
    );
    res.json(result.rows.map(toDto));
  } catch (error) {
    next(error);
  }
});

app.post("/api/stories", async (req, res, next) => {
  try {
    const error = validateStoryBody(req.body);
    if (error) {
      return res.status(400).json({ message: error });
    }

    const insertSql = `
      INSERT INTO stories
      (code, title, points, owner_name, owner_tag, priority, kind, due_date, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `;

    const params = [
      req.body.code,
      req.body.title,
      req.body.points,
      req.body.ownerName,
      req.body.ownerTag,
      req.body.priority,
      req.body.kind,
      req.body.dueDate,
      req.body.status,
    ];

    await pool.query(insertSql, params);
    const createdResult = await pool.query("SELECT * FROM stories WHERE code = $1", [
      req.body.code,
    ]);
    return res.status(201).json(toDto(createdResult.rows[0]));
  } catch (error) {
    if (error.code === "23505" || error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "Story code already exists" });
    }
    return next(error);
  }
});

app.patch("/api/stories/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ message: "Invalid story id" });
    }

    const error = validateStoryBody(req.body, true);
    if (error) {
      return res.status(400).json({ message: error });
    }

    const currentResult = await pool.query("SELECT * FROM stories WHERE id = $1", [id]);
    if (currentResult.rowCount === 0) {
      return res.status(404).json({ message: "Story not found" });
    }

    const current = currentResult.rows[0];
    const nextStory = {
      code: req.body.code ?? current.code,
      title: req.body.title ?? current.title,
      points: req.body.points ?? current.points,
      owner_name: req.body.ownerName ?? current.owner_name,
      owner_tag: req.body.ownerTag ?? current.owner_tag,
      priority: req.body.priority ?? current.priority,
      kind: req.body.kind ?? current.kind,
      due_date: req.body.dueDate ?? current.due_date,
      status: req.body.status ?? current.status,
    };

    const updateSql = `
      UPDATE stories
      SET code = $1,
          title = $2,
          points = $3,
          owner_name = $4,
          owner_tag = $5,
          priority = $6,
          kind = $7,
          due_date = $8,
            status = $9
          WHERE id = $10
    `;

    const updatedResult = await pool.query(updateSql, [
      nextStory.code,
      nextStory.title,
      nextStory.points,
      nextStory.owner_name,
      nextStory.owner_tag,
      nextStory.priority,
      nextStory.kind,
      nextStory.due_date,
      nextStory.status,
      id,
    ]);

    if (updatedResult.rowCount === 0) {
      return res.status(404).json({ message: "Story not found" });
    }

    const selectedResult = await pool.query("SELECT * FROM stories WHERE id = $1", [id]);

    return res.json(toDto(selectedResult.rows[0]));
  } catch (error) {
    if (error.code === "23505" || error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "Story code already exists" });
    }
    return next(error);
  }
});

app.delete("/api/stories/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ message: "Invalid story id" });
    }

    const result = await pool.query("DELETE FROM stories WHERE id = $1", [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Story not found" });
    }

    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ message: "Internal server error" });
});

async function bootstrap() {
  const schemaSql = fs.readFileSync(path.resolve(__dirname, "db/schema.sql"), "utf-8");
  await pool.query(schemaSql);

  app.listen(config.port, () => {
    console.log(`Rally backend listening on http://localhost:${config.port}`);
  });
}

bootstrap().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});

 // license to himanshu bisht 