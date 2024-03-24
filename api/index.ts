import express from "express";
import pool from "./db";
import bodyParser from "body-parser";

const app = express();
app.use(bodyParser.json());

app.get("/data", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM scanqr");
    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/create", async (req, res) => {
  const { id, scannedData } = req.body;
  try {
    const checkResult = await pool.query(
      "SELECT * FROM scanqr WHERE scanned_data = $1",
      [scannedData]
    );

    if (checkResult.rows.length > 0) {
      res.status(400).json({ error: "Scanned data already exists" });
    } else {
      const insertResult = await pool.query(
        "INSERT INTO scanqr (id, created_at, scanned_data) VALUES ($1, NOW(), $2) RETURNING *",
        [id, scannedData]
      );
      res.status(201).json(insertResult.rows[0]);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
