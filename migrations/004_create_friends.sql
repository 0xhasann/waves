CREATE TABLE IF NOT EXISTS friends (
  user1_id TEXT NOT NULL,
  user2_id TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (user1_id, user2_id),

  FOREIGN KEY (user1_id) REFERENCES users(id),
  FOREIGN KEY (user2_id) REFERENCES users(id)
);