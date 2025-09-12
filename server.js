import express from "express";
import dotenv from "dotenv";
import {
  convertCurrency,
  toMinorUnit,
  convertViaMinorUnits,
  convertCrypto,
} from "./converter.js";

dotenv.config();
const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const API_KEY = process.env.API_KEY || "my-secret-api";


app.use((req, res, next) => {
  const key = req.headers["x-api-key"];
  if (key !== API_KEY) {
    return res.status(403).json({ error: "Invalid API Key" });
  }
  next();
});


app.post("/convert", async (req, res) => {
  try {
    const { amount, from, to } = req.body;
    const result = await convertCurrency(amount, from, to);
    res.json({ result: result.toString() });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


app.post("/convert/minor", async (req, res) => {
  try {
    const { amount, currency } = req.body;
    const result = await toMinorUnit(amount, currency);
    res.json({ result: result.toString() });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


app.post("/convert/accurate", async (req, res) => {
  try {
    const { amount, from, to } = req.body;
    const result = await convertViaMinorUnits(amount, from, to);
    res.json({ result: result.toString() });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


app.post("/convert/crypto", async (req, res) => {
  try {
    const { amount, from, to } = req.body;
    const result = await convertCrypto(amount, from, to);
    res.json({ result: result.toString() });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(` Server running on http://localhost:${PORT}`);
});
