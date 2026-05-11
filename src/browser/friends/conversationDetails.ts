import type { ApiResponse } from '../../shared/apiResponse';
import type { PendingFriendRequests } from '../../shared/types';

export async function fetchPendingRequests() {
  try {
    const res = await fetch('http://localhost:3000/api/friends/pendingRequets', {
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
              <button
                class="accept-btn"
                data-sender-id="${request.sender_id}"
              >
                Accept
              </button>
  
              <button
                class="reject-btn"
                data-sender-id="${request.sender_id}"
              >
                Reject
              </button>
            </div>
  
          </div>
        `;
    })
    .join('');
}
