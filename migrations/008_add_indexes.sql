CREATE INDEX IF NOT EXISTS idx_messages_conversation 
ON messages(conversation_id, created_at);

CREATE INDEX IF NOT EXISTS idx_friend_requests_receiver 
ON friend_requests(receiver_id);