CREATE TABLE IF NOT EXISTS conversations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user1_id TEXT NOT NULL,
  user2_id TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,

  UNIQUE (user1_id, user2_id),

  FOREIGN KEY (user1_id) REFERENCES users(id),
  FOREIGN KEY (user2_id) REFERENCES users(id)
);