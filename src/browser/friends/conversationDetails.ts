import type { ApiResponse } from '../../shared/apiResponse';
import type { PendingFriendRequests } from '../../shared/types';

export async function fetchPendingRequests() {
  try {
    const res = await fetch('/api/friends/pendingRequests', {
      credentials: 'include',
    });

    const result = (await res.json()) as ApiResponse<PendingFriendRequests[]>;

    if (!res.ok || !result.success || result.error || !result.data) {
      throw new Error(`Failed to fetch requests ${result.message} ${result.error}`);
    }

    renderPendingRequests(result.data);
  } catch (err) {
    console.error(err);
  }
}

function renderPendingRequests(requests: PendingFriendRequests[]) {
  const container = document.getElementById('connections-list') as HTMLDivElement;
  if (!container) {
    console.error('connections-list not found');
    return;
  }

  container.innerHTML = requests
    .map((request) => {
      const fullName = `${request.first_name || ''} ${request.last_name || ''}`.trim();

      return `
        <div class="request-card">
          <div>
            ${fullName || request.username}
          </div>
          <div class="request-actions">
            <button class="accept-btn" data-sender-id="${request.sender_id}">
              Accept
            </button>
            <button class="reject-btn" data-sender-id="${request.sender_id}">
              Reject
            </button>
          </div>
        </div>
      `;
    })
    .join('');

  bindRequestActions(container);
}

function bindRequestActions(container: HTMLDivElement) {
  container.addEventListener('click', (e) => {
    const target = e.target as HTMLButtonElement;

    const senderId = target.dataset.senderId;
    if (!senderId) return;

    if (target.classList.contains('accept-btn')) {
      void handleAccept(senderId, target);
    } else if (target.classList.contains('reject-btn')) {
      void handleReject(senderId, target);
    }
  });
}

async function handleAccept(senderId: string, btn: HTMLButtonElement) {
  btn.disabled = true;

  try {
    const res = await fetch('/api/friends/processRequest', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ receiver_id: Number(senderId), status: 'accepted' }),
    });

    const result = (await res.json()) as ApiResponse<null>;

    if (!res.ok || !result.success) {
      throw new Error(`Failed to accept: ${result.message}`);
    }

    btn.closest('.request-card')?.remove();
  } catch (err) {
    console.error(err);
    btn.disabled = false;
  }
}

async function handleReject(senderId: string, btn: HTMLButtonElement) {
  btn.disabled = true;

  try {
    const res = await fetch('/api/friends/processRequest', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ receiver_id: Number(senderId), status: 'rejected' }),
    });

    const result = (await res.json()) as ApiResponse<null>;

    if (!res.ok || !result.success) {
      throw new Error(`Failed to reject: ${result.message}`);
    }

    btn.closest('.request-card')?.remove();
  } catch (err) {
    console.error(err);
    btn.disabled = false;
  }
}

export async function sendFriendRequest(receiverId: number, btn: HTMLButtonElement) {
  btn.disabled = true;
  try {
    const res = await fetch('/api/friends/sendRequest', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ receiver_id: receiverId }),
    });

    const result = (await res.json()) as ApiResponse<null>;
    if (!res.ok || !result.success) throw new Error(`Failed to send request: ${result.message}`);

    btn.textContent = 'Request Sent';
  } catch (err) {
    console.error(err);
    btn.disabled = false;
  }
}

export async function unfollowFriend(user2Id: number, btn: HTMLButtonElement) {
  btn.disabled = true;
  try {
    const res = await fetch('/api/friends/unfollowFriend', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user2_id: user2Id }),
    });

    const result = (await res.json()) as ApiResponse<null>;
    if (!res.ok || !result.success) throw new Error(`Failed to unfollow: ${result.message}`);

    btn.textContent = 'Unfollowed';
  } catch (err) {
    console.error(err);
    btn.disabled = false;
  }
}
