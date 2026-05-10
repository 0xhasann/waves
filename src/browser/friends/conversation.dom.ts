import { friends } from "..";
import type { ApiResponse } from "../../server/units/apiResponse";
import type { Conversations, MessageDTO } from "../../shared/types";
import { setRemoteNameLabel } from "../dom";
import { WebSocketHandler } from "../websocketHandler";
import { friendCard } from "./friendCard";

let timeout: number;

type SelectedConversation = {
  peerId: number;
  displayName: string;
  avatarUrl: string;
  conversationId?: number;
};

let selectedConversation: SelectedConversation | null = null;
let realtimeBound = false;
let incomingPromptBound = false;

function ensureIncomingCallPrompt() {
  if (incomingPromptBound) return;
  incomingPromptBound = true;

  const app = document.querySelector(".app");
  if (!app) return;

  const prompt = document.createElement("div");
  prompt.id = "timeline-incoming-call";
  prompt.style.display = "none";
  prompt.style.position = "fixed";
  prompt.style.top = "16px";
  prompt.style.left = "50%";
  prompt.style.transform = "translateX(-50%)";
  prompt.style.zIndex = "2000";
  prompt.style.background = "#fff";
  prompt.style.padding = "12px 16px";
  prompt.style.border = "1px solid #ddd";
  prompt.style.borderRadius = "10px";
  prompt.style.boxShadow = "0 4px 14px rgba(0,0,0,0.18)";
  prompt.innerHTML = `
    <span id="timeline-incoming-call-text"></span>
    <button id="timeline-accept-call" style="margin-left:10px;">Accept</button>
    <button id="timeline-reject-call" style="margin-left:8px;">Reject</button>
  `;
  document.body.appendChild(prompt);
}

async function sendMessages(conversationId: number, content: string) {
  const response = await fetch("http://localhost:3000/api/conversations/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      conversation_id: conversationId,
      type: "text",
      content,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to save message");
  }

  return response.json();
}

function appendIncomingMessage(content: string, sentAt?: string) {
  const messagesNode = document.getElementById("p2p-messages");
  if (!messagesNode) return;

  const msgDiv = document.createElement("div");
  msgDiv.className = "message received";
  msgDiv.innerHTML = `
    <div class="text">${content}</div>
    <div class="time">${new Date(sentAt || Date.now()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
  `;
  messagesNode.appendChild(msgDiv);
  messagesNode.scrollTop = messagesNode.scrollHeight;
}

function bindRealtimeMessaging() {
  if (realtimeBound) return;
  realtimeBound = true;
  ensureIncomingCallPrompt();

  const ws = WebSocketHandler.getInstance();
  ws.on("direct-message", ({ conversationId, content, sentAt }) => {
    if (!selectedConversation?.conversationId) return;

    if (selectedConversation.conversationId !== conversationId) {
      return;
    }
  
    appendIncomingMessage(content, sentAt);
    
  });
  ws.on("call", ({ name }) => {
    const prompt = document.getElementById("timeline-incoming-call");
    const text = document.getElementById("timeline-incoming-call-text");
    const acceptBtn = document.getElementById("timeline-accept-call") as HTMLButtonElement | null;
    const rejectBtn = document.getElementById("timeline-reject-call") as HTMLButtonElement | null;
    if (!prompt || !text || !acceptBtn || !rejectBtn) return;

    text.textContent = `Incoming video call from ${name}`;
    prompt.style.display = "block";

    acceptBtn.onclick = () => {
      setRemoteNameLabel(name);
      ws.accept(name);
      prompt.style.display = "none";
    };

    rejectBtn.onclick = () => {
      prompt.style.display = "none";
    };
  });
}

export function searchUser(search: HTMLInputElement) {
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

    let html = "";
    result.data.forEach((conv: Conversations) => {
      html += friendCard(conv);
    });
    friends.innerHTML = html;
  }, 500);
}

export async function conversations(e: PointerEvent) {
  document.querySelectorAll(".friend").forEach((el) => el.classList.remove("active"));
  const chat = document.querySelector(".chat") as HTMLDivElement;
  const target = e.target as HTMLElement;
  const friend = target.closest(".friend") as HTMLElement;

  if (!friend) return;
  friend.classList.add("active");

  const userId = friend.dataset.userId;
  if (!userId) return;


  const currentUserId = parseInt(localStorage.getItem("userId") || "0", 10);
  const displayName = friend.dataset.displayName || friend.dataset.username || "Unknown";
  const avatarUrl = friend.dataset.avatarUrl || "https://i.pravatar.cc/150";
  const conversationIdRaw = friend.dataset.conversationId;
  const parsedConversationId = conversationIdRaw ? Number(conversationIdRaw) : undefined;
  const conversationId = parsedConversationId && Number.isFinite(parsedConversationId) ? parsedConversationId : undefined;

  selectedConversation = {
    peerId: Number(userId),
    displayName,
    avatarUrl,
    conversationId,
  };
  console.log("selectedConversation ::", selectedConversation);


  const response = await fetch(
    `http://localhost:3000/api/conversations/fetchP2PConversations?user2_id=${userId}`,
  );
  const res = await response.json();
  const result = (res.data || []) as MessageDTO[];

  chat.innerHTML = `
  <div class="chat-header">
    <img src="${avatarUrl}" />
    <div class="chat-user">
      <h3>${displayName}</h3>
      <small>online</small>
    </div>
    <button id="call-btn" style="margin-left:auto;">Call</button>
  </div>
  <div class="messages" id="p2p-messages">
    ${result
      .map(
        (msg) => `
      <div class="message ${msg.sender_id === currentUserId ? "sent" : "received"}">
        <div class="text">${msg.content}</div>
        <div class="time">
          ${new Date(msg.updated_at || "").toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </div>
      </div>
    `,
      )
      .join("")}
  </div>
  <div class="chat-input">
    <input id="p2p-chat-input" type="text" placeholder="Type a message">
    <button id="p2p-send-btn">Send</button>
  </div>
`;

setTimeout(() => {
  const messagesNode = document.getElementById("p2p-messages");
  if (messagesNode) {
    messagesNode.scrollTop = messagesNode.scrollHeight;
  }
}, 0);

  const callBtn = document.getElementById("call-btn") as HTMLButtonElement | null;
  const sendBtn = document.getElementById("p2p-send-btn") as HTMLButtonElement | null;
  const input = document.getElementById("p2p-chat-input") as HTMLInputElement | null;

  callBtn?.addEventListener("click", () => {
    if (!selectedConversation?.displayName) return;
    setRemoteNameLabel(selectedConversation.displayName);
    WebSocketHandler.getInstance().call(selectedConversation.displayName);
  });


  sendBtn?.addEventListener("click", () => {
    void sendCurrentMessage();
  });
  input?.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      void sendCurrentMessage();
    }
  });
}

export async function fetchUserConversations() {
  bindRealtimeMessaging();
  let html = "";
  const response = await fetch(
    `http://localhost:3000/api/conversations/fetchAllConversations`,
  );

  const records: ApiResponse<Conversations[]> = await response.json();
  const allConversations = records.data;
  if (!allConversations) return;

  allConversations.forEach((convs: Conversations) => {
    html += friendCard(convs);
  });

  friends.innerHTML = html;
}

export const sendCurrentMessage = async () => {
  const input = document.getElementById("p2p-chat-input") as HTMLInputElement | null;
  const message = input?.value.trim();
  if (!message || !selectedConversation) return;
  console.log("sendCurrentMessage ", message, selectedConversation);


  try {

    if (!selectedConversation.conversationId) {
      const conversationResponse = await fetch(
        `http://localhost:3000/api/conversations/createOrGetConversation?user2_id=${selectedConversation.peerId}`,
      );
      const conversationResult = await conversationResponse.json();
      selectedConversation.conversationId = Number(conversationResult.data);

    }

    if (!selectedConversation.conversationId) return;

    await sendMessages(selectedConversation.conversationId, message);
    WebSocketHandler.getInstance().directMessage(
      selectedConversation.displayName,
      message,
      selectedConversation.conversationId,
    );

    const messagesNode = document.getElementById("p2p-messages");
    const msgDiv = document.createElement("div");
    msgDiv.className = "message sent";
    msgDiv.innerHTML = `
      <div class="text">${message}</div>
      <div class="time">${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
    `;
    messagesNode?.appendChild(msgDiv);
    if (messagesNode) {
      messagesNode.scrollTop = messagesNode.scrollHeight;
    }
    if (input) input.value = "";
  } catch (error) {
    console.error("failed to send message", error);
  }
};