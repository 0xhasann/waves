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

import { pageLoader, showForm, signup } from "./auth.user.dom";
import { ChatUI } from "./chat";
import { attachUserMedia, hangUpCall, renderIncomingCall, setRemoteNameLabel, localStream } from "./dom";
import { conversations, fetchUserConversations, searchUser } from "./friends/conversation.dom";
import { recordStream } from "./recordStream";
import { shareScreen } from "./shareScreen";
import { attachDataChannelHandlers, RTCPeerConnectionHandler } from "./webrtcEventHandler";
import { WebSocketHandler } from "./websocketHandler";

const ws = WebSocketHandler.getInstance();
ws.on("hang-up", hangUpCall);
document.getElementById("HangupBtn")?.addEventListener("click", hangUpCall);
//Frontend -> Backend -> Google -> Redirect -> backend -> Frontend
const googleButtons = document.querySelectorAll(".google-btn",) as NodeListOf<HTMLButtonElement>;

googleButtons.forEach((btn) => {
  btn?.addEventListener("click", () => {
    window.location.href = "http://localhost:3000/auth/google";
  });
});

window?.addEventListener("DOMContentLoaded", async () => {
  const isProtectedPage =
    window.location.pathname === "/conversation_timeline.html";

  if (isProtectedPage) {
    const isAuthenticated = await pageLoader();

    if (!isAuthenticated) return;
    await fetchUserConversations();
  }
});

const signupForm = document.getElementById("signupForm") as HTMLFormElement;

if (signupForm) {
  signupForm.addEventListener("submit", signup);
}

document.querySelectorAll(".controls button").forEach((btn) => {
  btn?.addEventListener("click", () => {
    btn.classList.toggle("active");
  });
});

document.getElementById("loginTab")?.addEventListener("click", () => {
  showForm("login");
});

document.getElementById("signupTab")?.addEventListener("click", () => {
  showForm("signup");
});

export const search = document.getElementById("search") as HTMLInputElement;
export const friends = document.getElementById("friends") as HTMLDivElement;
export const searchUsers = document.getElementById("search-results") as HTMLDivElement;


search?.addEventListener("keyup", searchUser);

[friends, searchUsers].forEach((element)  => {
  element?.addEventListener("click", conversations);
});


let audioEnabled = true;
let videoEnabled = true;

const micButton = document.getElementById("micBtn") as HTMLButtonElement | null;

micButton?.addEventListener("click", () => {
  audioEnabled = !audioEnabled;
  micButton?.classList.toggle("active");
  const tooltip = micButton?.querySelector(".tooltip");
  if (tooltip) tooltip.textContent = audioEnabled ? "Mute" : "Unmute";
  (localStream as unknown as MediaStream | null)?.getAudioTracks().forEach(track => {
    track.enabled = audioEnabled;
  });
  micButton?.classList.toggle("active");
});

const videoButton = document.getElementById("videoBtn") as HTMLButtonElement | null;

videoButton?.addEventListener("click", () => {
  videoEnabled = !videoEnabled;
  videoButton?.classList.toggle("active");
  const tooltip = videoButton?.querySelector(".tooltip");
  if (tooltip) tooltip.textContent = videoEnabled ? "Stop Video" : "Start Video";
  (localStream as unknown as MediaStream | null)?.getVideoTracks().forEach(track => {
    track.enabled = videoEnabled;
  });
  videoButton?.classList.toggle("active");

});

// Record Stream 
const recordBtn = document.getElementById("recordBtn") as HTMLDivElement | null;
recordBtn?.addEventListener("click", async () => {
  await recordStream();
});

// Share Screen
const shareBtn = document.getElementById("shareBtn") as HTMLButtonElement | null;
shareBtn?.addEventListener("click", async () => {
  await shareScreen();
});

ChatUI.init();
// const pc = RTCPeerConnectionHandler.pc;


ws.on("new-ice-candidate", async (event) => {
  // await pc.addIceCandidate(event.candidate);
  await RTCPeerConnectionHandler.pc.addIceCandidate(event.candidate);
});
ws.on("video-answer", async (event) => {
  if (RTCPeerConnectionHandler.pc.signalingState !== "have-local-offer") return;
  await RTCPeerConnectionHandler.pc.setRemoteDescription(event.sdp);
})

ws.on("accept", async ({ name }) => {
  const dc = RTCPeerConnectionHandler.pc.createDataChannel("chat");
  RTCPeerConnectionHandler.dataChannel = dc;
  attachDataChannelHandlers(dc);


  const granted = await attachUserMedia(audioEnabled, videoEnabled);
  if (!granted) {
    hangUpCall();
    return;
  }
  setRemoteNameLabel(name);
  const camerabox = document.getElementById("camerabox") as HTMLElement | null;
  camerabox?.classList.add("active");
  const loginPage = document.querySelector(".container");
  if (loginPage)
    loginPage.classList.add('active');

});
const chatToggleBtn = document.getElementById("chatToggleBtn");
const chatContainer = document.getElementById("chat-container");

chatToggleBtn?.addEventListener("click", () => {
  chatContainer?.classList.toggle("active");
});

ws.on("video-offer", async (event) => {

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
  const camerabox = document.getElementById("camerabox") as HTMLElement | null;
  camerabox?.classList.add("active");
  const loginPage = document.querySelector(".container");
  if (loginPage)
    loginPage.classList.add('active');
});


ws.on("call", renderIncomingCall);
