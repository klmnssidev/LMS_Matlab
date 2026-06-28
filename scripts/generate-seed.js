const { execSync } = require("child_process");
const fs = require("fs");

const PASSWORD = "Password12";
const TABLES = ["departments", "teachers", "students", "courses", "semesters", "classrooms", "course_offerings", "enrollments", "attendance", "exams", "exam_results"];

function mysql(query) {
  const cmd = `docker exec mysql mysql -u root -p${PASSWORD} adv_db -B --column-names=false -e "${query.replace(/"/g, '\\"')}"`;
  return execSync(cmd, { encoding: "utf8" }).trim().split("\n").filter(Boolean);
}

function pgEscape(val) {
  if (val === null || val === "NULL") return "NULL";
  const s = String(val);
  if (s === "" || s === "\\N") return "NULL";
  return `'${s.replace(/'/g, "''")}'`;
}

function getColumns(table) {
  const raw = mysql(`SHOW COLUMNS FROM ${table}`);
  return raw.map((row) => row.split("\t")[0]);
}

function getData(table) {
  const columns = getColumns(table);
  const rows = mysql(`SELECT * FROM ${table} ORDER BY ${columns[0]}`);
  return rows.map((row) => {
    const vals = row.split("\t");
    return columns.map((col, i) => pgEscape(vals[i]));
  });
}

let sql = "-- ============================================================\n";
sql += "-- Seed data for adv_db (PostgreSQL)\n";
sql += "-- Generated from MySQL Docker container\n";
sql += "-- ============================================================\n\n";

for (const table of TABLES) {
  const columns = getColumns(table);
  const data = getData(table);
  if (data.length === 0) continue;

  const colList = columns.join(", ");
  sql += `-- ${table} (${data.length} rows)\n`;

  const batchSize = 50;
  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize);
    const values = batch.map((row) => `(${row.join(", ")})`).join(",\n");
    sql += `INSERT INTO ${table} (${colList}) VALUES\n${values};\n\n`;
  }

  const maxId = data[data.length - 1][0];
  sql += `SELECT setval('${table}_${columns[0]}_seq', ${maxId});\n\n`;
}

fs.writeFileSync("seed_pg.sql", sql);
console.log("Generated seed_pg.sql");
