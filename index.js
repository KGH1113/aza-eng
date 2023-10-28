const express = require("express");
const sqlite3 = require("sqlite3").verbose();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static("public"));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
});

const db = new sqlite3.Database("./database.db");

// Create a "suggestions" table if it doesn't exist
db.serialize(() => {
  db.run(
    "CREATE TABLE IF NOT EXISTS suggestions (id INTEGER PRIMARY KEY, text TEXT, implemented BOOLEAN)"
  );
});

app.use(express.json());

// Create a new suggestion
app.post("/api/suggestions", (req, res) => {
  const { text } = req.body;

  db.run(
    "INSERT INTO suggestions (text, implemented) VALUES (?, ?)",
    [text, false],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ id: this.lastID });
    }
  );
});

// Get all suggestions
app.get("/api/suggestions", (req, res) => {
  db.all("SELECT * FROM suggestions", (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Mark a suggestion as implemented
app.put("/api/suggestions/:id", (req, res) => {
  const suggestionId = req.params.id;

  db.run(
    "UPDATE suggestions SET implemented = ? WHERE id = ?",
    [true, suggestionId],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ changes: this.changes });
    }
  );
});

// Delete a suggestion by ID
app.delete('/api/suggestions/:id', (req, res) => {
  const suggestionId = req.params.id;

  db.run('DELETE FROM suggestions WHERE id = ?', suggestionId, function (err) {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ message: 'Suggestion not found' });
    }
    res.json({ message: 'Suggestion deleted', changes: this.changes });
  });
});

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.get("/suggestion-request", (req, res) => {
  res.sendFile(__dirname + "/public/suggestion.html");
});

app.get("/admin", (req, res) => {
  res.sendFile(__dirname + "/public/admin.html");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
