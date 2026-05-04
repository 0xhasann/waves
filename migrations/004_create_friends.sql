CREATE TABLE IF NOT EXISTS friends (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user1_id INTEGER NOT NULL,
  user2_id INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%d/%m/%Y %H:%M:%S', 'now', '+5 hours', '30 minutes')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%d/%m/%Y %H:%M:%S', 'now', '+5 hours', '30 minutes')),

  UNIQUE (user1_id, user2_id),

  FOREIGN KEY (user1_id) REFERENCES users(id),
  FOREIGN KEY (user2_id) REFERENCES users(id)
);