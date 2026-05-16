export const searchUserQuery = `SELECT
    u.id AS peer_id,
    u.username,
    u.first_name,
    u.last_name,
    u.avatar_url,

    c.id AS conversation_id,
    c.deleted,

    m.content AS last_message,
    m.updated_at,
    fr.status AS friend_request_status,
    fr.deleted AS friend_request_deleted,
    fr.sender_id as friend_request_sender_id

FROM users u

LEFT JOIN conversations c
ON (
    (c.user1_id = ? AND c.user2_id = u.id)
    OR
    (c.user2_id = ? AND c.user1_id = u.id)
)

LEFT JOIN friend_requests fr
ON (
    (fr.sender_id = ? AND fr.receiver_id = u.id)
    OR
    (fr.sender_id = u.id AND fr.receiver_id = ?)

)

LEFT JOIN messages m ON m.id = (
    SELECT id
    FROM messages
    WHERE conversation_id = c.id
    ORDER BY updated_at DESC
    LIMIT 1
)

WHERE (
    u.email_id   LIKE ? COLLATE NOCASE
    OR u.mobile_no    = ?
    OR u.username     LIKE ? COLLATE NOCASE
    OR u.first_name   LIKE ? COLLATE NOCASE
    OR u.last_name    LIKE ? COLLATE NOCASE
)
AND u.id != ?
AND u.deleted = 0;`;

export const upsertFriendRequestQuery = `
  INSERT INTO friend_requests (sender_id, receiver_id, status, deleted)
  VALUES (?, ?, 'pending', 0)
  ON CONFLICT(MIN(sender_id, receiver_id), MAX(sender_id, receiver_id)) DO UPDATE SET
    status     = 'pending',
    deleted    = 0,
    updated_at = CURRENT_TIMESTAMP;`;

export const getRelationshipQuery = `
  SELECT status, deleted, sender_id, receiver_id
  FROM friend_requests
  WHERE (sender_id = ? AND receiver_id = ?)
     OR (sender_id = ? AND receiver_id = ?)
  LIMIT 1;`;

export const searchFriendRequestQuery = `
  SELECT status, sender_id, receiver_id
  FROM friend_requests
  WHERE (sender_id = ? AND receiver_id = ?)
     OR (sender_id = ? AND receiver_id = ?)
  AND deleted = 0;`;

export const processRequestQuery = `
  UPDATE friend_requests SET
    status     = ?,
    updated_at = ?,
    deleted    = CASE WHEN ? = 'rejected' THEN 1 ELSE deleted END
  WHERE sender_id = ? AND receiver_id = ?;`;

export const upsertFriendQuery = `
  INSERT INTO friends (user1_id, user2_id)
  VALUES (?, ?)
  ON CONFLICT(user1_id, user2_id) DO UPDATE SET
    deleted    = 0,
    updated_at = CURRENT_TIMESTAMP;`;

export const searchFriendQuery = `
  SELECT 1 FROM friends
  WHERE user1_id = ? AND user2_id = ?
  AND deleted = 0;`;

export const deleteFriendQuery = `
  UPDATE friends SET deleted = 1, updated_at = ?
  WHERE user1_id = ? AND user2_id = ?;`;

export const deleteFriendRequestQuery = `
  UPDATE friend_requests SET updated_at = ?, deleted = 1
  WHERE (sender_id = ? AND receiver_id = ?)
     OR (sender_id = ? AND receiver_id = ?);`;

export const deleteConversationQuery = `
  UPDATE conversations SET updated_at = ?, deleted = 1
  WHERE (user1_id = ? AND user2_id = ?)
     OR (user1_id = ? AND user2_id = ?);`;

export const findAllPendingRequests = `SELECT
  fr.id,
  fr.sender_id,
  fr.receiver_id,
  fr.status,
  fr.created_at,
  u.username,
  u.first_name,
  u.last_name,
  u.avatar_url
FROM friend_requests fr
JOIN users u ON u.id = fr.sender_id
WHERE fr.receiver_id = ?
AND fr.status = 'pending'
AND fr.deleted = 0
ORDER BY fr.created_at DESC;`;

export const searchUserQuery2 = `
  SELECT
    u.id AS peer_id,
    u.username,
    u.first_name,
    u.last_name,
    u.avatar_url
  FROM users u
  WHERE u.id = ? AND u.deleted = 0;`;

export const conversationExistsQuery = `SELECT EXISTS (
    SELECT 1
    FROM conversations
    WHERE id = ? AND deleted = 0
  ) AS conversation_exists;`;
