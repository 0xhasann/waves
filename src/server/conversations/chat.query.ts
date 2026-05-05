export const prepareFetchConvQuery = `SELECT 
      c.id as conversation_id,
      c.updated_at,
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
    LIMIT ?;`


export const prepareCreateConvQuery = `INSERT INTO conversations (user1_id, user2_id)VALUES (?, ?) ON CONFLICT(user1_id, user2_id)
                DO UPDATE SET user1_id = excluded.user1_id
                RETURNING id;`

export const prepareSendMessageQuery = `INSERT INTO messages(conversation_id, sender_id, type, content) VALUES (?, ?, ?, ?);`