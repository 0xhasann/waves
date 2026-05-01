CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  conversation_id TEXT NOT NULL,
  sender_id TEXT NOT NULL,

  type TEXT NOT NULL, -- 'text' | 'image' | 'video'
  content TEXT,       -- text or file URL

  created_at TEXT DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (conversation_id) REFERENCES conversations(id),
  FOREIGN KEY (sender_id) REFERENCES users(id)
);