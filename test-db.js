import pg from "pg";

const db = new pg.Client({
  connectionString: "postgresql://flag_quiz_db_ch77_user:4AAg78u0tut5kQLw5maP0vf4aRieRH1X@dpg-d45deo7diees73877gm0-a.oregon-postgres.render.com:5432/flag_quiz_db_ch77",
  ssl: { rejectUnauthorized: false }
});

db.connect()
  .then(() => {
    console.log("✅ Connected successfully!");
    return db.end();
  })
  .catch((err) => {
    console.error("❌ Connection failed:", err.message);
  });
