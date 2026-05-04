CREATE TABLE IF NOT EXISTS  profile_audit (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  username TEXT NOT NULL UNIQUE,
  field_name TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%d/%m/%Y %H:%M:%S', 'now', '+5 hours', '30 minutes')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%d/%m/%Y %H:%M:%S', 'now', '+5 hours', '30 minutes')),
  FOREIGN KEY (user_id) REFERENCES users(id)
);