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
    u.email_id = ?
    OR u.mobile_no = ?
    OR u.username = ?
    OR u.first_name = ?
    OR u.last_name = ?
)
AND u.id != ?
AND u.deleted = 0;`;

export const sendRequestQuery = `INSERT into friend_requests (status, sender_id, receiver_id) VALUES('pending', ?, ?);`;

export const pastFriendRequestQuery = `SELECT 1 from friend_requests where sender_id = ? and receiver_id = ? and deleted = 1;`;

export const processpastFriendRequestQuery = `UPDATE friend_requests SET
      status = 'pending',
      updated_at = ?,
      deleted = 0 where sender_id = ? and receiver_id = ?;`;

export const searchFriendRequestQuery = `SELECT status FROM friend_requests WHERE sender_id = ? AND receiver_id = ? AND deleted = 0;`;

export const processRequestQuery = `UPDATE friend_requests SET
      status = ?,
      updated_at = ?,
      deleted = CASE
        WHEN ? = 'rejected' THEN 1
        ELSE deleted
      END where sender_id = ? and receiver_id = ?;`;

export const createFriendQuery = `INSERT into friends (user1_id, user2_id) VALUES(?, ?);`;

export const fetchPastFriendQuery = `SELECT 1 from friends where user1_id = ? and user2_id = ? and deleted = 1;`;

export const updatePastFriendQuery = `UPDATE friends SET
      updated_at = ?,
      deleted = 0 where user1_id = ? and user2_id = ?;`;

export const searchFriendQuery = `SELECT 1 FROM friends WHERE user1_id = ? AND user2_id = ? AND deleted = 0;`;

export const conversationExistsQuery = `SELECT EXISTS (
  SELECT 1
  FROM conversations
  WHERE id = ? AND deleted = 0
) AS conversation_exists;`;

export const deleteFriendQuery = `UPDATE friends set deleted = 1, updated_at=? WHERE user1_id = ? AND user2_id =?;`;

export const deleteFriendRequestQuery = `UPDATE friend_requests SET
      updated_at = ?,
      deleted = 1
      where sender_id = ? and receiver_id = ?;`;

export const deleteConverstationQuery = `UPDATE conversations SET
      updated_at = ?,
      deleted = 1
      where user1_id = ? and user2_id = ?;`;

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

JOIN users u
ON u.id = fr.sender_id

WHERE fr.receiver_id = ?
AND fr.status = 'pending'
AND fr.deleted = 0

ORDER BY fr.created_at DESC;`;
