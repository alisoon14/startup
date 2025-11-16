const express = require('express');
const cors = require('cors');
const fs = require('fs');
const app = express();
app.use(cors());
app.use(express.json());

const DB_FILE = './db.json';

function readDB() {
  if (!fs.existsSync(DB_FILE)) return {};
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
}
function writeDB(db) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
}
function generateAccessKey() {
  return Array(16).fill(0).map(() => Math.random().toString(36)[2]).join('');
}

app.post('/get-key', (req, res) => {
  const { tg_username } = req.body;
  const db = readDB();
  if (db[tg_username]) {
    res.json({ access_key: db[tg_username] });
  } else {
    const key = generateAccessKey();
    db[tg_username] = key;
    writeDB(db);
    res.json({ access_key: key });
  }
});

app.post('/validate-key', (req, res) => {
  const { tg_username, access_key } = req.body;
  const db = readDB();
  const valid = db[tg_username] === access_key;
  res.json({ valid });
});

app.listen(3333, () => console.log('Demo JSON-server running on 3333'));
