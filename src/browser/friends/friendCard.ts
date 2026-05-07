import type { User } from "../../shared/types";

export function friendCard(user: User) {
  console.log("friendCard");
	return `
    <div class="friend" data-user-id="${user.id}">

      <img 
        src="${user.avatar_url || "https://i.pravatar.cc/150"}"
        alt="${user.username}"
      >

      <div class="friend-content">

        <div class="friend-top">
          <div class="friend-name">
            ${user.username}
          </div>

          <div class="friend-time">
            10:30 PM
          </div>
        </div>

        <div class="friend-message">
          ${user.last_chat || "hello"}
        </div>

      </div>

    </div>
  `;
}
