import type { ApiResponse } from "../../server/units/apiResponse";
import type { Conversations, User } from "../../shared/types";
import { friendCard } from "./friendCard";

let timeout: number;
export function searchUser(search: HTMLInputElement, friends: HTMLDivElement) {

  clearTimeout(timeout);

  timeout = window.setTimeout(async () => {
    const query = search.value;

    if (query.length < 1) {
      friends.innerHTML = "";
      return;
    }

    const response = await fetch(
      `http://localhost:3000/api/friends/search?query=${encodeURIComponent(query)}`,
    );

    const result = await response.json();

    console.log(result);

    let html = "";

    result.data.forEach((conv: Conversations) => {
      html += friendCard(conv);
    });

    friends.innerHTML = html;
  }, 500);
}



export async function conversations(e: PointerEvent, friends: HTMLDivElement) {
  let html = "";
  document
    .querySelectorAll(".friend")
    .forEach((el) => el.classList.remove("active"));

  friends.classList.add("active");
  const chat = document.querySelector(".chat") as HTMLDivElement;
  const target = e.target as HTMLElement;

  const friend = target.closest(".friend") as HTMLElement;

  if (!friend) return;

  const userId = friend.dataset.userId;

  console.log("clicked user:", userId);


  const response = await fetch(
    `http://localhost:3000/api/conversations/fetchAllConversations`,
  );

  const records: ApiResponse<Conversations[]> = await response.json();

  const allConversations = await records.data;

  if(!allConversations) return;

  console.log(allConversations);


  allConversations.forEach((convs: Conversations) => {
    html += friendCard(convs);
  });

  friends.innerHTML = html;




//   chat.innerHTML = `
//   <div class="chat-header">

//     <img src="https://i.pravatar.cc/150" />

//     <div class="chat-user">
//       <h3>
//         ${friend.querySelector(".friends-name")?.textContent}
//       </h3>

//       <small>online</small>
//     </div>

//   </div>

//   <div class="messages">

//     <div class="message received">
//       Hi bro
//     </div>

//     <div class="message sent">
//       Hello
//     </div>

//   </div>

//   <div class="chat-input">
//     <input type="text" placeholder="Type a message">
//     <button>Send</button>
//   </div>
// `;
}
