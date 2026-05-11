import { formatMessageTime } from '../../shared/timeUtils';
import type { Conversations } from '../../shared/types';

export function friendCard(conv: Conversations) {
  const fullName = `${conv.first_name || ''} ${conv.last_name || ''}`.trim();
  const displayName = `${fullName || conv.username}`.trim();
  return `
    <div
      class="friend"
      data-user-id="${conv.peer_id}"
      data-username="${conv.username}"
      data-display-name="${displayName}"
      data-avatar-url="${conv.avatar_url || 'https://i.pravatar.cc/150'}"
      data-conversation-id="${conv.conversation_id || ''}"
    >

      <img 
        src="${conv.avatar_url || 'https://i.pravatar.cc/150'}"
        alt="${conv.username}"
      >

      <div class="friend-content">

        <div class="friend-top">
          <div class="friend-name">
            ${displayName}
          </div>

          <div class="friend-time">
            <span>${formatMessageTime(conv.updated_at!)}</span>
          </div>
        </div>

        <div class="friend-message">
          ${conv.last_message || ''}
        </div>

      </div>

    </div>
  `;
}
