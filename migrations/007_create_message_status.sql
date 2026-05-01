CREATE TABLE IF NOT EXISTS message_status (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  message_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  msg_status TEXT NOT NULL, -- 'sent' | 'delivered' | 'read'
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,

  UNIQUE (message_id, user_id),

  FOREIGN KEY (message_id) REFERENCES messages(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);