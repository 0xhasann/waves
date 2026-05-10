CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE,        
  user_pass TEXT,
  mobile_no TEXT UNIQUE,
  email_id TEXT UNIQUE,
  avatar_url TEXT,
  first_name TEXT,
  last_name TEXT,
  google_id TEXT,
  provider TEXT DEFAULT 'local',
  is_verified INTEGER DEFAULT 0,
  deleted INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%S', 'now', '+5 hours', '30 minutes')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%S', 'now', '+5 hours', '30 minutes'))

);