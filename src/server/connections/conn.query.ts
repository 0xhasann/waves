
export const searchUserQuery = `SELECT id, username  FROM users WHERE email_id = ? OR mobile_no = ? 
    OR username = ? OR first_name = ? OR last_name = ? AND deleted = 0;`

export const  sendRequestQuery =  `INSERT into friend_requests (status, sender_id, receiver_id) VALUES('pending', ?, ?);`

export const searchFriendRequestQuery  = `SELECT status FROM friend_requests WHERE sender_id = ? AND receiver_id = ? AND deleted = 0;`

export const processRequestQuery = `UPDATE friend_requests SET
      status = ?,
      updated_at = ?,
      deleted = CASE
        WHEN ? = 'rejected' THEN 1
        ELSE deleted
      END where sender_id = ? and receiver_id = ?;`

export const createFriendQuery = `INSERT into friends (user1_id, user2_id) VALUES(?, ?);`


export const searchFriendQuery = `SELECT 1 FROM friends WHERE user1_id = ? AND user2_id = ? AND deleted = 0;`

export const deleteFriendQuery = `UPDATE friends set deleted = 1, updated_at=? WHERE user1_id = ? AND user2_id =?;`

export const deleteFriendRequestQuery = `UPDATE friend_requests SET
      updated_at = ?,
      deleted = 1
      where sender_id = ? and receiver_id = ?;`



