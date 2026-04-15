const fs = require("fs");
const path = require("path");
const pool = require("./pool");
const seedStories = require("../data/seedStories");

async function seed() {
  const schemaPath = path.resolve(__dirname, "schema.sql");
  const schemaSql = fs.readFileSync(schemaPath, "utf-8");

  await pool.query(schemaSql);
  await pool.query("DELETE FROM stories");

  const insertSql = `
    INSERT INTO stories
    (code, title, points, owner_name, owner_tag, priority, kind, due_date, status)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
  `;

  for (const story of seedStories) {
    await pool.query(insertSql, [
      story.code,
      story.title,
      story.points,
      story.owner_name,
      story.owner_tag,
      story.priority,
      story.kind,
      story.due_date,
      story.status,
    ]);
  }

  console.log(`Seeded ${seedStories.length} stories.`);
}

seed()
  .catch((error) => {
    console.error("Failed to seed database:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
