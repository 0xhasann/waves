import { formatMessageTime } from '../../shared/timeUtils';
import type { Conversations, FriendRequestStatus, UserSearchResult } from '../../shared/types';

function getDisplayName(conv: Pick<Conversations, 'first_name' | 'last_name' | 'username'>): string {
  const fullName = `${conv.first_name || ''} ${conv.last_name || ''}`.trim();
  return fullName || conv.username;
}

function avatarUrl(url?: string | null): string {
  return url || 'https://i.pravatar.cc/150';
}

function friendActionButton(
  peerId: number,
  frs?: Pick<FriendRequestStatus, 'friend_request_status' | 'friend_request_deleted' | 'friend_request_sender_id'>,
): string {
  if (!frs || frs.friend_request_deleted || !frs.friend_request_status || frs.friend_request_status === 'rejected') {
    return `<button class="send-request-btn" data-receiver-id="${peerId}">Add Friend</button>`;
  }

  if (frs.friend_request_status === 'pending') {
    const iSentIt = frs.friend_request_sender_id !== peerId;
    return iSentIt
      ? `<button class="send-request-btn send-request-btn--pending" disabled data-receiver-id="${peerId}">Request Sent</button>`
      : `<span class="friend-request-badge">Request Received</span>`;
  }

  return '';
}

export function searchResultCard(user: UserSearchResult): string {
  const displayName = getDisplayName(user);
  const avatar = avatarUrl(user.avatar_url);
  const actionBtn = friendActionButton(user.peer_id, user);

  return `
    <div
      class="friend friend--search-result"
      data-user-id="${user.peer_id}"
      data-username="${user.username}"
      data-display-name="${displayName}"
      data-avatar-url="${avatar}"
      data-conversation-id="${user.conversation_id || ''}"
      data-conversation-deleted="${user.deleted}"
      data-friend-request-status="${user.friend_request_status ?? ''}"
    >
      <img src="${avatar}" alt="${user.username}">

      <div class="friend-content">
        <div class="friend-top">
          <div class="friend-name">${displayName}</div>
        </div>

        <div class="friend-username">@${user.username}</div>

        <div class="friend-actions">${actionBtn}</div>
      </div>
    </div>
  `;
}

export function conversationCard(conv: Conversations, frs?: FriendRequestStatus): string {
  const displayName = getDisplayName(conv);
  const avatar = avatarUrl(conv.avatar_url);

  const timeLabel = conv.last_message && conv.updated_at ? `<span>${formatMessageTime(conv.updated_at)}</span>` : '';

  const reAddBtn = frs?.friend_request_deleted ? friendActionButton(conv.peer_id, frs) : '';

  return `
    <div
      class="friend friend--conversation"
      data-user-id="${conv.peer_id}"
      data-username="${conv.username}"
      data-display-name="${displayName}"
      data-avatar-url="${avatar}"
      data-conversation-id="${conv.conversation_id || ''}"
      data-conversation-deleted="${conv.deleted}"
      data-friend-request-status="${frs?.friend_request_status ?? ''}"
    >
      <img src="${avatar}" alt="${conv.username}">

      <div class="friend-content">
        <div class="friend-top">
          <div class="friend-name">${displayName}</div>
          <div class="friend-time">${timeLabel}</div>
        </div>

        <div class="friend-message">${conv.last_message || ''}</div>

        ${reAddBtn ? `<div class="friend-actions">${reAddBtn}</div>` : ''}
      </div>
    </div>
  `;
}
