CREATE TABLE IF NOT EXISTS message_status (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  message_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  msg_status TEXT NOT NULL, -- 'sent' | 'delivered' | 'read'
  deleted INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%S', 'now', '+5 hours', '30 minutes')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%S', 'now', '+5 hours', '30 minutes')),

  UNIQUE (message_id, user_id),

  FOREIGN KEY (message_id) REFERENCES messages(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);