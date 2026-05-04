CREATE TABLE IF NOT EXISTS friend_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sender_id INTEGER NOT NULL,
  receiver_id INTEGER NOT NULL,
  status TEXT NOT NULL, -- 'pending' | 'accepted' | 'rejected'
  created_at TEXT NOT NULL DEFAULT (strftime('%d/%m/%Y %H:%M:%S', 'now', '+5 hours', '30 minutes')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%d/%m/%Y %H:%M:%S', 'now', '+5 hours', '30 minutes')),

  CHECK (sender_id != receiver_id),

  FOREIGN KEY (sender_id) REFERENCES users(id),
  FOREIGN KEY (receiver_id) REFERENCES users(id)
);