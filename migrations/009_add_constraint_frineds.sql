CREATE UNIQUE INDEX idx_unique_friend_pair
ON friend_requests (
  MIN(sender_id, receiver_id),
  MAX(sender_id, receiver_id)
)
WHERE status = 'pending';