// the browser orchestration layer
// ties everything together. listens for ws events and drives the webrtc flow

/* caller (you called someone)
ws.on("accept") fires → call is accepted
Attaches local media (attachUserMedia) → adding tracks triggers onnegotiationneeded
onnegotiationneeded → creates offer → sends video-offer
ws.on("video-answer") → pc.setRemoteDescription()
ws.on("new-ice-candidate") → pc.addIceCandidate()
*/

/* callee flow (someone called you):

ws.on("video-offer") fires → you are the answerer
pc.setRemoteDescription(offer)
Attaches local media
pc.createAnswer() → pc.setLocalDescription(answer) → sends video-answer
ws.on("new-ice-candidate") → pc.addIceCandidate()
*/

import { pageLoader, showForm, signin, signup } from './auth.user.dom';
import { ChatUI } from './chat';
import { attachUserMedia, hangUpCall, renderIncomingCall, setRemoteNameLabel, localStream } from './dom';
import { conversations, openChatMobile, searchUserWithDelay } from './friends/conversation.dom';
import { fetchPendingRequests, sendFriendRequest } from './friends/conversationDetails';
import { recordStream } from './recordStream';
import { shareScreen } from './shareScreen';
import { attachDataChannelHandlers, RTCPeerConnectionHandler } from './webrtcEventHandler';
import { WebSocketHandler } from './websocketHandler';

const ws = WebSocketHandler.getInstance();
ws.on('hang-up', hangUpCall);
document.getElementById('HangupBtn')?.addEventListener('click', hangUpCall);
//Frontend -> Backend -> Google -> Redirect -> backend -> Frontend
const googleButtons = document.querySelectorAll('.google-btn');

googleButtons.forEach((btn) => {
  btn?.addEventListener('click', () => {
    window.location.href = '/auth/google';
  });
});
window?.addEventListener('DOMContentLoaded', () => {
  void pageLoader();
});

document.getElementById('home')?.addEventListener('click', () => {
  window.location.href = '/conversation.html';
});

const signupForm = document.getElementById('signupForm') as HTMLFormElement;

if (signupForm) {
  signupForm.addEventListener('submit', (e) => {
    void signup(e);
  });
}

const loginForm = document.getElementById('loginForm') as HTMLFormElement;

if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    void signin(e);
  });
}

document.querySelectorAll('.controls button').forEach((btn) => {
  btn?.addEventListener('click', () => {
    btn.classList.toggle('active');
  });
});

document.getElementById('loginTab')?.addEventListener('click', () => {
  showForm('login');
});

document.getElementById('signupTab')?.addEventListener('click', () => {
  showForm('signup');
});
const connectionsToggle = document.getElementById('connections-toggle') as HTMLButtonElement;

const connectionsDropdown = document.getElementById('connections-dropdown') as HTMLDivElement;

connectionsToggle?.addEventListener('click', () => {
  connectionsDropdown.classList.toggle('hidden');

  if (!connectionsDropdown.classList.contains('hidden')) {
    void fetchPendingRequests();
  }
});
export const search = document.getElementById('search') as HTMLInputElement;
export const friends = document.getElementById('friends') as HTMLDivElement;
export const searchUsers = document.getElementById('search-results') as HTMLDivElement;

search?.addEventListener('keyup', searchUserWithDelay);

searchUsers.addEventListener('click', (e) => {
  const target = e.target as HTMLElement;

  if (target.classList.contains('send-request-btn')) {
    const receiverId = Number(target.dataset.receiverId);
    void sendFriendRequest(receiverId, target as HTMLButtonElement);
    return;
  }

  const friend = target.closest('.friend') as HTMLElement;
  if (!friend) return;

  const url = new URL(window.location.href);
  url.searchParams.set('username', friend.dataset.username!);
  window.history.pushState({}, '', url);
  void conversations(friend);
});
friends.addEventListener('click', (e) => {
  const target = e.target as HTMLElement;
  const friend = target.closest('.friend') as HTMLElement;
  if (!friend) return;
  const url = new URL(window.location.href);
  if (!friend.dataset.username) {
    console.error('username not found in friend dataset');
    return;
  }
  url.searchParams.set('username', friend.dataset.username);
  window.history.pushState({}, '', url);
  void conversations(friend);
  openChatMobile();
});

let audioEnabled = true;
let videoEnabled = true;

const micButton = document.getElementById('micBtn') as HTMLButtonElement | null;

micButton?.addEventListener('click', () => {
  audioEnabled = !audioEnabled;
  micButton?.classList.toggle('active');
  const tooltip = micButton?.querySelector('.tooltip');
  if (tooltip) tooltip.textContent = audioEnabled ? 'Mute' : 'Unmute';
  localStream?.getAudioTracks().forEach((track) => {
    track.enabled = audioEnabled;
  });
  micButton?.classList.toggle('active');
});

const videoButton = document.getElementById('videoBtn') as HTMLButtonElement | null;

videoButton?.addEventListener('click', () => {
  videoEnabled = !videoEnabled;
  videoButton?.classList.toggle('active');
  const tooltip = videoButton?.querySelector('.tooltip');
  if (tooltip) tooltip.textContent = videoEnabled ? 'Stop Video' : 'Start Video';
  localStream?.getVideoTracks().forEach((track) => {
    track.enabled = videoEnabled;
  });
  videoButton?.classList.toggle('active');
});

// Record Stream
const recordBtn = document.getElementById('recordBtn') as HTMLDivElement | null;
recordBtn?.addEventListener('click', () => {
  void recordStream();
});

// Share Screen
const shareBtn = document.getElementById('shareBtn') as HTMLButtonElement | null;
shareBtn?.addEventListener('click', () => {
  void shareScreen();
});

ChatUI.init();
// const pc = RTCPeerConnectionHandler.pc;

ws.on('new-ice-candidate', async (event) => {
  // await pc.addIceCandidate(event.candidate);
  await RTCPeerConnectionHandler.pc.addIceCandidate(event.candidate);
});
ws.on('video-answer', async (event) => {
  if (RTCPeerConnectionHandler.pc.signalingState !== 'have-local-offer') return;
  await RTCPeerConnectionHandler.pc.setRemoteDescription(event.sdp);
});

ws.on('accept', async ({ name }) => {
  const dc = RTCPeerConnectionHandler.pc.createDataChannel('chat');
  RTCPeerConnectionHandler.dataChannel = dc;
  attachDataChannelHandlers(dc);

  const granted = await attachUserMedia(audioEnabled, videoEnabled);
  if (!granted) {
    hangUpCall();
    return;
  }
  setRemoteNameLabel(name);
  const camerabox = document.getElementById('camerabox');
  camerabox?.classList.add('active');
  const loginPage = document.querySelector('.container');
  if (loginPage) loginPage.classList.add('active');
});
const chatToggleBtn = document.getElementById('chatToggleBtn');
const chatContainer = document.getElementById('chat-container');

chatToggleBtn?.addEventListener('click', () => {
  chatContainer?.classList.toggle('active');
});

ws.on('video-offer', async (event) => {
  await RTCPeerConnectionHandler.pc.setRemoteDescription(event.sdp);
  // Get media and use addTrack (not addTransceiver)
  const granted = await attachUserMedia(audioEnabled, videoEnabled);
  if (!granted) {
    hangUpCall();
    return;
  }

  const answer = await RTCPeerConnectionHandler.pc.createAnswer();
  await RTCPeerConnectionHandler.pc.setLocalDescription(answer);
  if (!RTCPeerConnectionHandler.pc.localDescription) return;
  ws.videoAnswer(RTCPeerConnectionHandler.pc.localDescription);
  const camerabox = document.getElementById('camerabox');
  camerabox?.classList.add('active');
  const loginPage = document.querySelector('.container');
  if (loginPage) loginPage.classList.add('active');
});

ws.on('call', renderIncomingCall);
