import { friends, search } from '..';
import type { ApiResponse } from '../../shared/apiResponse';
import type { Conversations, MessageDTO } from '../../shared/types';
import { setRemoteNameLabel } from '../dom';
import { WebSocketHandler } from '../websocketHandler';
import { friendCard } from './friendCard';

let timeout: number;

type SelectedConversation = {
  peerId: number;
  displayName: string;
  avatarUrl: string;
  conversationId?: number;
};

let selectedConversation: SelectedConversation | null = null;
let realtimeBound = false;

async function sendMessages(conversationId: number, content: string) {
  const res = await fetch('http://localhost:3000/api/conversations/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      conversation_id: conversationId,
      type: 'text',
      content,
    }),
  });

  const result = (await res.json()) as ApiResponse;

  if (!res.ok || !result.success || result.error || !result.data) {
    throw new Error(`Failed to save message ${result.message} ${result.error}`);
  }

  return result;
}

function appendIncomingMessage(content: string, sentAt?: string) {
  const messagesNode = document.getElementById('p2p-messages');
  if (!messagesNode) return;

  const msgDiv = document.createElement('div');
  msgDiv.className = 'message received';
  msgDiv.innerHTML = `
    <div class="text">${content}</div>
    <div class="time">${new Date(sentAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
  `;
  messagesNode.appendChild(msgDiv);
  messagesNode.scrollTop = messagesNode.scrollHeight;
}

function bindRealtimeMessaging() {
  if (realtimeBound) return;
  realtimeBound = true;

  const ws = WebSocketHandler.getInstance();
  ws.on('direct-message', ({ conversationId, content, sentAt }) => {
    if (!selectedConversation?.conversationId) return;

    if (selectedConversation.conversationId !== conversationId) {
      return;
    }

    appendIncomingMessage(content, sentAt);
  });
}

const searchResults = document.getElementById('search-results') as HTMLDivElement;

async function searchUser() {
  const query = search.value;

  if (!query) {
    searchResults.innerHTML = '';
    searchResults.style.display = 'none';
    return;
  }

  const res = await fetch(`http://localhost:3000/api/friends/search?query=${encodeURIComponent(query)}`);
  const result = (await res.json()) as ApiResponse<Conversations[]>;

  if (!res.ok || !result.success || result.error || !result.data) {
    throw new Error(`Failed to save message ${result.message} ${result.error}`);
  }

  let html = '';
  result.data.forEach((conv: Conversations) => {
    html += friendCard(conv);
  });
  searchResults.innerHTML = html;
  searchResults.style.display = 'block';
}

export function searchUserWithDelay() {
  clearTimeout(timeout);
  timeout = window.setTimeout(() => {
    void searchUser();
  }, 500);
}

export async function conversations(friend: HTMLElement) {
  document.querySelectorAll('.friend').forEach((el) => el.classList.remove('active'));
  const chat = document.querySelector('.chat') as HTMLDivElement;

  if (!friend) return;
  friend.classList.add('active');

  const userId = friend.dataset.userId;
  if (!userId) return;

  const currentUserId = parseInt(localStorage.getItem('userId') || '0', 10);
  const displayName = friend.dataset.displayName || friend.dataset.username || 'Unknown';
  const avatarUrl = friend.dataset.avatarUrl || 'https://i.pravatar.cc/150';
  const conversationIdRaw = friend.dataset.conversationId;
  const parsedConversationId = conversationIdRaw ? Number(conversationIdRaw) : undefined;
  const conversationId =
    parsedConversationId && Number.isFinite(parsedConversationId) ? parsedConversationId : undefined;

  selectedConversation = {
    peerId: Number(userId),
    displayName,
    avatarUrl,
    conversationId,
  };
  console.log('selectedConversation ::', selectedConversation);

  const res = await fetch(`http://localhost:3000/api/conversations/fetchP2PConversations?user2_id=${userId}`);
  const result = (await res.json()) as ApiResponse<MessageDTO[]>;

  if (!res.ok || !result.success || result.error || !result.data) {
    throw new Error(`Failed to save message ${result.message} ${result.error}`);
  }

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
    ${result.data
      .map(
        (msg) => `
      <div class="message ${msg.sender_id === currentUserId ? 'sent' : 'received'}">
        <div class="text">${msg.content}</div>
        <div class="time">
          ${new Date(msg.updated_at || '').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    `,
      )
      .join('')}
  </div>
  <div class="chat-input">
    <input id="p2p-chat-input" type="text" placeholder="Type a message">
    <button id="p2p-send-btn">Send</button>
  </div>
`;

  setTimeout(() => {
    const messagesNode = document.getElementById('p2p-messages');
    if (messagesNode) {
      messagesNode.scrollTop = messagesNode.scrollHeight;
    }
  }, 0);

  const callBtn = document.getElementById('call-btn') as HTMLButtonElement | null;
  const sendBtn = document.getElementById('p2p-send-btn') as HTMLButtonElement | null;
  const input = document.getElementById('p2p-chat-input') as HTMLInputElement | null;

  callBtn?.addEventListener('click', () => {
    if (!selectedConversation?.displayName) return;
    setRemoteNameLabel(selectedConversation.displayName);
    WebSocketHandler.getInstance().call(selectedConversation.displayName);
  });

  sendBtn?.addEventListener('click', () => {
    void sendCurrentMessage();
  });
  input?.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      void sendCurrentMessage();
    }
  });
}

export async function fetchUserConversations() {
  bindRealtimeMessaging();
  let html = '';
  const res = await fetch(`http://localhost:3000/api/conversations/fetchAllConversations`);

  const result = (await res.json()) as ApiResponse<Conversations[]>;

  if (!res.ok || !result.success || result.error || !result.data) {
    throw new Error(`Failed to save message ${result.message} ${result.error}`);
  }
  const allConversations = result.data;
  if (!allConversations) return;

  allConversations.forEach((convs: Conversations) => {
    html += friendCard(convs);
  });

  friends.innerHTML = html;
}

export const sendCurrentMessage = async () => {
  const input = document.getElementById('p2p-chat-input') as HTMLInputElement | null;
  const message = input?.value.trim();
  if (!message || !selectedConversation) return;
  console.log('sendCurrentMessage ', message, selectedConversation);

  try {
    if (!selectedConversation.conversationId) {
      const res = await fetch(
        `http://localhost:3000/api/conversations/createOrGetConversation?user2_id=${selectedConversation.peerId}`,
      );
      const result = (await res.json()) as ApiResponse;

      if (!res.ok || !result.success || result.error || !result.data) {
        throw new Error(`Failed to save message ${result.message} ${result.error}`);
      }
      selectedConversation.conversationId = Number(result.data);
    }

    if (!selectedConversation.conversationId) return;

    await sendMessages(selectedConversation.conversationId, message);
    WebSocketHandler.getInstance().directMessage(
      selectedConversation.displayName,
      message,
      selectedConversation.conversationId,
    );

    const messagesNode = document.getElementById('p2p-messages');
    const msgDiv = document.createElement('div');
    msgDiv.className = 'message sent';
    msgDiv.innerHTML = `
      <div class="text">${message}</div>
      <div class="time">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
    `;
    messagesNode?.appendChild(msgDiv);
    if (messagesNode) {
      messagesNode.scrollTop = messagesNode.scrollHeight;
    }
    if (input) input.value = '';
  } catch (error) {
    console.error('failed to send message', error);
  }
};

export function getFriendFromSearch() {
  const params = new URLSearchParams(window.location.search);
  const username = params.get('username');
  return username;
}
