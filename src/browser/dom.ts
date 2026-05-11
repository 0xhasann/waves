// expose methods to do the following via changing the document
// displaying local stream
// displaying remote stream
// display state changes for icegathering, iceconnection, signaling state
// add methods to
// implement login that html calls
// show active users on userlistbox html ul
// add send call next to each user on user list
// show accept when an call is received from server for the given caller name in user list
// hangup button

// UI logic hanlder
import type { Name } from '../shared/chatmessage';
import { RTCPeerConnectionHandler } from './webrtcEventHandler';
import { WebSocketHandler } from './websocketHandler';

export let localStream: MediaStream | null = null;

export function disableRemoteNameLabel() {
  const remoteLabel = document.getElementById('remote-name-label') as HTMLSpanElement;
  remoteLabel.textContent = '';
  remoteLabel.style.display = 'none';
  const btn = document.getElementById('HangupBtn');
  if (btn) {
    btn.style.display = 'none';
  }
}

export function setRemoteNameLabel(remoteName: string) {
  const remoteLabel = document.getElementById('remote-name-label') as HTMLSpanElement;
  const btn = document.getElementById('HangupBtn') as HTMLSpanElement;
  const header = document.getElementById('chat-header') as HTMLSpanElement;
  const chatUser = document.getElementById('chat-user') as HTMLSpanElement;
  if (chatUser) {
    chatUser.textContent = remoteName;
  }

  if (btn) {
    btn.style.display = 'flex';
  }
  if (header) header.textContent = `Chat with ${remoteName}`;
  remoteLabel.textContent = remoteName;
}

// hides the form, shows welcome text, calls ws.login()
export function login(wsName: string, name: string, shouldRedirect = true) {
  const ws = WebSocketHandler.getInstance();
  const authContainer = document.querySelector('.auth-container') as HTMLElement;

  if (authContainer) {
    authContainer.style.display = 'none';
  }
  if (!wsName) return;

  const localLabel = document.getElementById('local-name-label');
  if (localLabel) {
    localLabel.textContent = wsName || name;
  }
  ws.login(wsName || name);
  if (shouldRedirect) {
    window.location.href = '/conversation.timeline.html';
  }
}

// inserts an "Accept" prompt when a call comes in
export function renderIncomingCall(data: { name: Name }) {
  const ws = WebSocketHandler.getInstance();

  let prompt = document.getElementById('incoming-call-prompt');

  if (!prompt) {
    prompt = document.createElement('div');
    prompt.id = 'incoming-call-prompt';

    prompt.innerHTML = `
        <div class="incoming-call-modal">
            <h3>Incoming Call</h3>
    
            <p>
                ${data.name} is calling...
            </p>
    
            <div class="incoming-call-actions">
                <button id="accept-call-btn" class="accept-btn">
                    Accept
                </button>
    
                <button id="reject-call-btn" class="reject-btn">
                    Reject
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(prompt);
  }

  const text = document.getElementById('incoming-call-text');
  const acceptBtn = document.getElementById('accept-call-btn');
  const rejectBtn = document.getElementById('reject-call-btn');

  if (text) {
    text.textContent = `Incoming call from ${data.name}`;
  }

  acceptBtn?.addEventListener('click', () => {
    ws.accept(data.name);
    setRemoteNameLabel(data.name);
    prompt?.remove();
  });

  rejectBtn?.addEventListener('click', () => {
    prompt?.remove();
  });
}

//  stops media tracks, closes RTCPeerConnection, calls ws.hangUp()
export function hangUpCall() {
  const ws = WebSocketHandler.getInstance();
  const localVideo = document.getElementById('local_video') as HTMLVideoElement | null;
  const remoteVideo = document.getElementById('received_video') as HTMLVideoElement | null;
  ws.hangUp();

  if (localVideo && localVideo.srcObject instanceof MediaStream) {
    localVideo.pause();
    localVideo.srcObject.getTracks().forEach((track) => {
      track.stop();
    });

    localVideo.srcObject = null;
    localVideo.classList.remove('pip-mode');
  }

  if (remoteVideo && remoteVideo.srcObject instanceof MediaStream) {
    remoteVideo.srcObject.getTracks().forEach((track) => {
      track.stop();
    });
    remoteVideo.srcObject = null;
    remoteVideo.style.objectFit = 'cover';
  }
  RTCPeerConnectionHandler.close();

  const loginPage = document.querySelector('.container');
  if (loginPage) loginPage.classList.add('active');

  document.getElementById('camerabox')?.classList.remove('active');
  document.getElementById('chat-container')?.classList.remove('active');
  document.querySelector('.container')?.classList.remove('active');
}

// gets camera/mic, adds tracks to the peer connection
export async function attachUserMedia(audio: boolean, video: boolean): Promise<boolean> {
  // const pc = RTCPeerConnectionHandler.pc;
  const shareBtn = document.getElementById('shareBtn');
  if (shareBtn) shareBtn.style.display = 'flex';

  const recordBtn = document.getElementById('recordBtn');
  if (recordBtn) recordBtn.style.display = 'flex';

  const chatToggleBtn = document.getElementById('chatToggleBtn');
  if (chatToggleBtn) {
    chatToggleBtn.style.display = 'flex';
    // chatToggleBtn.style.removeProperty('display');
  }

  try {
    // Always acquire both tracks on first stage
    localStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });

    // Use the booleans to set initial enabled state
    localStream.getAudioTracks().forEach((track) => (track.enabled = audio));
    localStream.getVideoTracks().forEach((track) => (track.enabled = video));

    const localVideoElem = document.getElementById('local_video') as HTMLVideoElement | null;
    if (localVideoElem) {
      localVideoElem.srcObject = localStream;
    }

    if (!localStream) return false;
    localStream.getTracks().forEach((track) => {
      if (localStream) {
        const alreadyAdded = RTCPeerConnectionHandler.pc.getSenders().some((s) => s.track === track);
        if (!alreadyAdded) {
          RTCPeerConnectionHandler.pc.addTrack(track, localStream);
        }
      }
    });

    return true;
  } catch (err) {
    if (err instanceof Error)
      if (err.name === 'NotAllowedError') {
        console.warn('User denied camera/mic permission');
      } else if (err.name === 'NotFoundError') {
        console.warn('No camera/mic device found');
      } else {
        console.error('getUserMedia error:', err);
      }
    return false;
  }
}
