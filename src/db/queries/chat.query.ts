export const prepareFetchConvQuery = `SELECT 
      c.id as conversation_id,
      c.updated_at,
      c.deleted,
      m.id as message_id,
      m.sender_id,
      m.type,
      m.content,
      m.created_at
    FROM conversations c
    LEFT JOIN messages m
      ON m.conversation_id = c.id
    WHERE c.id = ?
    ORDER BY m.created_at DESC
    LIMIT ?;`;

export const prepareCreateConvQuery = `INSERT INTO conversations (user1_id, user2_id)VALUES (?, ?) ON CONFLICT(user1_id, user2_id)
                DO UPDATE SET user1_id = excluded.user1_id, deleted = 0
                RETURNING id;`;

export const prepareSendMessageQuery = `INSERT INTO messages(conversation_id, sender_id, type, content) VALUES (?, ?, ?, ?);`;

export const prepareFetchAllConversations = `SELECT 
    u.id AS peer_id,
    u.username,
    u.first_name,
    u.last_name,
    u.avatar_url,
    
    c.id AS conversation_id,
    c.deleted,
    m.content AS last_message,
    m.type,
    m.sender_id,
    m.updated_at

FROM conversations c

JOIN users u ON u.id = CASE 
    WHEN c.user1_id = ? THEN c.user2_id 
    ELSE c.user1_id 
END

LEFT JOIN messages m ON m.id = (
    SELECT id FROM messages
    WHERE conversation_id = c.id
    ORDER BY updated_at DESC
    LIMIT 1
)

WHERE c.user1_id = ? OR c.user2_id = ?

ORDER BY m.updated_at DESC;`;

export const prepareP2PConversationsSchema = `SELECT *
FROM (
    SELECT 
    m.id,
    m.content,
    m.type,
    m.sender_id,
    m.updated_at,
    
    u.id AS peer_id,
    u.username,
    u.first_name,
    u.last_name,
    u.avatar_url
FROM messages m
JOIN users u ON u.id = ?
WHERE m.conversation_id = (
    SELECT id FROM conversations
    WHERE (user1_id = ? AND user2_id = ?)
    OR (user1_id = ? AND user2_id = ?)
)
ORDER BY m.updated_at DESC
LIMIT 20
) AS last_20
ORDER BY updated_at ASC;`;
