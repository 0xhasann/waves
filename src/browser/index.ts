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

import { ChatUI } from "./chat";
import { disableCallButton, attachUserMedia, hangUpCall, renderIncomingCall, renderUserList, login, setRemoteNameLabel, localStream } from "./dom";
import { recordStream } from "./recordStream";
import { shareScreen } from "./shareScreen";
import { attachDataChannelHandlers, RTCPeerConnectionHandler } from "./webrtcEventHandler";
import { WebSocketHandler } from "./websocketHandler";

const ws = WebSocketHandler.getInstance();
document.getElementById("HangupBtn")?.addEventListener("click", hangUpCall);
//Frontend -> Backend -> Google -> Redirect -> backend -> Frontend
const googleButtons = document.querySelectorAll(".google-btn",) as NodeListOf<HTMLButtonElement>;

googleButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    window.location.href = "http://localhost:3000/auth/google";
  });
});

window.addEventListener("DOMContentLoaded", async () => {
    try {
    const res = await fetch("http://localhost:3000/auth/google/me", {
      credentials: "include",
    });

    if (!res.ok) {
      console.error("Res check failed");
    }
    const user = await res.json();

    login(user.first_name || user.username);
  } catch (err) {
    console.error("Auth check failed");
  }
});
document.querySelectorAll(".controls button").forEach(btn => {
    btn.addEventListener("click", () => {
        btn.classList.toggle("active");
    });
});

document.getElementById("loginTab")?.addEventListener("click", () => {
  showForm("login");
});

document.getElementById("signupTab")?.addEventListener("click", () => {
  showForm("signup");
});

function showForm(type: "login" | "signup") {
    const loginForm = document.getElementById("loginForm");
    const signupForm = document.getElementById("signupForm");
    const buttons = document.querySelectorAll<HTMLButtonElement>(".tab-btn");
    buttons.forEach((btn) => btn.classList.remove("active"));

    if (type === "login") {
        loginForm?.classList.add("active");
        signupForm?.classList.remove("active");
        buttons[0]?.classList.add("active");
    } else {
        signupForm?.classList.add("active");
        loginForm?.classList.remove("active");
        buttons[1]?.classList.add("active");
    }
}

const loginTab = document.getElementById("loginTab");
const signupTab = document.getElementById("signupTab");

loginTab?.addEventListener("click", () => {
  showForm("login");
});

signupTab?.addEventListener("click", () => {
  showForm("signup");
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
const pc = RTCPeerConnectionHandler.pc;

ws.on("new-ice-candidate", async (event) => {
    await pc.addIceCandidate(event.candidate);
});
ws.on("video-answer", async (event) => {
    if (pc.signalingState !== "have-local-offer") return;
    await pc.setRemoteDescription(event.sdp);
})

ws.on("accept", async ({ name }) => {
    disableCallButton(name);
    const dc = pc.createDataChannel("chat");
    RTCPeerConnectionHandler.dataChannel = dc;
    attachDataChannelHandlers(dc);

    ws.on("hang-up", () => {
        hangUpCall();
       
    })

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
    ws.on("hang-up", () => {
        hangUpCall();
       
    });

    await pc.setRemoteDescription(event.sdp);

    // Get media and use addTrack (not addTransceiver)
    const granted = await attachUserMedia(audioEnabled, videoEnabled);
    if (!granted) {
        hangUpCall();
        return;
    }



    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    if (!pc.localDescription) return;
    ws.videoAnswer(pc.localDescription);
    const camerabox = document.getElementById("camerabox") as HTMLElement | null;
    camerabox?.classList.add("active");
    const loginPage = document.querySelector(".container");
    if(loginPage)
        loginPage.classList.add('active');
});


ws.on("call", renderIncomingCall);
ws.on("user-list", renderUserList);

