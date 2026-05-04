CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  user_pass TEXT NOT NULL,
  mobile_no TEXT UNIQUE,
  email_id TEXT UNIQUE,
  avatar_url TEXT,
  first_name TEXT,
  last_name TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%d/%m/%Y %H:%M:%S', 'now', '+5 hours', '30 minutes')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%d/%m/%Y %H:%M:%S', 'now', '+5 hours', '30 minutes'))

);