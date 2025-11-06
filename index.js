import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import pg from "pg";
import fs from "fs";
import csv from "csv-parser";

dotenv.config();
const app = express();
const port = 3000;

app.set("view engine", "ejs");

fs.createReadStream("flags.csv")
  .pipe(csv())
  .on("data", async (row) => {
    await db.query("INSERT INTO flags (name, flag) VALUES ($1, $2)", [row.name, row.flag]);
  })
  .on("end", () => {
    console.log("✅ CSV import completed!");
  });

const db = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  user: process.env.DB_USER,
  password: String(process.env.DB_PASSWORD),
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
});

await db.connect();

let totalCorrect = 0;
let currentQuestion = {};

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// function to get one random question from DB
async function nextQuestion() {
  const result = await db.query("SELECT * FROM flags ORDER BY RANDOM() LIMIT 1");
  currentQuestion = result.rows[0];
}

// home page
app.get("/", async (req, res) => {
  totalCorrect = 0;
  await nextQuestion();

  if (!currentQuestion) {
    return res.send("No question found in database.");
  }

  res.render("index.ejs", { question: currentQuestion });
});

// form submission
app.post("/submit", async (req, res) => {
  const answer = req.body.answer?.trim().toLowerCase();
  let isCorrect = false;

  if (currentQuestion && currentQuestion.name?.toLowerCase() === answer) {
    totalCorrect++;
    isCorrect = true;
  }

  await nextQuestion();

  res.render("index.ejs", {
    question: currentQuestion,
    wasCorrect: isCorrect,
    totalScore: totalCorrect,
  });
});

app.listen(port, () => {
  console.log(`✅ Server is running at http://localhost:${port}`);
});
