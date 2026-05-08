import { formatMessageTime } from "../../server/units/timeUtils";
import type { Conversations} from "../../shared/types";

export function friendCard(conv: Conversations) {
  console.log("friendCard");
	return `
    <div class="friend" data-user-id="${conv.peer_id}">

      <img 
        src="${conv.avatar_url || "https://i.pravatar.cc/150"}"
        alt="${conv.username}"
      >

      <div class="friend-content">

        <div class="friend-top">
          <div class="friend-name">
            ${conv.first_name + " " + conv.last_name}
          </div>

          <div class="friend-time">
            <span>${formatMessageTime(conv.updated_at!)}</span>
          </div>
        </div>

        <div class="friend-message">
          ${conv.last_message || "hello"}
        </div>

      </div>

    </div>
  `;
}
