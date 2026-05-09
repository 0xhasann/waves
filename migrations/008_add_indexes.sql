CREATE INDEX IF NOT EXISTS idx_messages_conversation 
ON messages(conversation_id, created_at);

CREATE INDEX IF NOT EXISTS idx_friend_requests_receiver 
ON friend_requests(receiver_id);

CREATE UNIQUE INDEX unique_active_friend_request
ON friend_requests(sender_id, receiver_id)
WHERE deleted = 0;

CREATE UNIQUE INDEX unique_active_friends
ON friends(user1_id, user2_id)
WHERE deleted = 0;

CREATE UNIQUE INDEX unique_active_conversations
ON conversations(user1_id, user2_id)
WHERE deleted = 0;